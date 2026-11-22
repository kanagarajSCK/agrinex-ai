import argparse
import csv
import json
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import date, datetime, time, timezone
from pathlib import Path
from typing import Iterable

from app.schemas.locations import LocationRecord


VILLAGE_REQUIRED_COLUMNS = {
    "villageCode",
    "villageNameEnglish",
    "subdistrictCode",
    "districtCode",
    "stateCode",
}


def clean_code(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text if text else None


def clean_name(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text if text else None


def corruption_markers(value: str | None) -> list[str]:
    if not value:
        return []
    markers: list[str] = []
    if "\ufffd" in value:
        markers.append("unicode-replacement-character")
    if "\x00" in value:
        markers.append("null-character")
    if re.search(r"[ÃÂð]|�", value):
        markers.append("likely-mojibake")
    if any(ord(char) < 32 and char not in "\t\n\r" for char in value):
        markers.append("control-character")
    return markers


def parse_source_date(value: object) -> date | None:
    text = clean_name(value)
    if not text:
        return None
    for date_format in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(text, date_format).date()
        except ValueError:
            continue
    return None


def read_csv(path: Path) -> tuple[list[dict[str, str]], list[str]]:
    problems: list[str] = []
    try:
        handle = path.open("r", encoding="utf-8-sig", newline="")
    except UnicodeDecodeError as exc:
        return [], [f"{path.name}: invalid UTF-8 encoding: {exc}"]
    with handle:
        try:
            reader = csv.DictReader(handle)
            rows = [
                {str(key): (value if value is not None else "") for key, value in row.items()}
                for row in reader
            ]
            headers = list(reader.fieldnames or [])
        except UnicodeDecodeError as exc:
            return [], [f"{path.name}: invalid UTF-8 encoding: {exc}"]
    for index, row in enumerate(rows, start=2):
        for key, value in row.items():
            if "name" not in key.lower() and "local" not in key.lower():
                continue
            markers = corruption_markers(value)
            if markers:
                problems.append(
                    f"{path.name}:row {index}:{key}:{','.join(markers)}"
                )
    return rows, problems


def classify_csv(path: Path, headers: Iterable[str]) -> str:
    names = set(headers)
    if "villageCode" in names:
        return "villages"
    if "subdistrict_code" in names:
        return "subdistricts"
    if "district_code" in names and "state_code" in names:
        return "districts"
    if "state_code" in names and "state_name_english" in names:
        return "states"
    return "unknown"


def deterministic_location_id(entity_type: str, codes: list[str]) -> str:
    encoded = ":".join(clean_code(code) or "-" for code in codes)
    return f"lgd:{entity_type}:{encoded}"


def normalize_name(value: object) -> str:
    """Normalize for audit-only exact name comparison; never alter source values."""
    text = clean_name(value) or ""
    text = unicodedata.normalize("NFKC", text).casefold()
    return " ".join(re.sub(r"[^\w]+", " ", text, flags=re.UNICODE).split())


def normalized_code(value: object) -> str | None:
    code = clean_code(value)
    if not code or not code.isdecimal():
        return None
    return code.lstrip("0") or "0"


def row_detail(row: dict[str, str], path: Path, row_number: int) -> dict[str, object]:
    return {"source_filename": path.name, "source_row": row_number, "source_values": row}


def audit_rejected_lgd(raw_dir: Path, output_dir: Path) -> dict:
    """Write a staging-only audit for every rejected village row and duplicate group."""
    raw_dir = raw_dir.resolve()
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    classified: dict[str, list[tuple[Path, list[dict[str, str]]]]] = defaultdict(list)
    provenance: list[dict[str, object]] = []
    for path in sorted(raw_dir.glob("*.csv"), key=lambda item: item.name.lower()):
        rows, _ = read_csv(path)
        headers = list(rows[0]) if rows else []
        kind = classify_csv(path, headers) if rows else "unknown"
        classified[kind].append((path, rows))
        date_columns = [column for column in headers if column in {"last_updated", "data_gov_update_date"}]
        update_dates = sorted({clean_code(row.get(column)) for row in rows for column in date_columns if clean_code(row.get(column))})
        provenance.append({"filename": path.name, "dataset_type": kind, "record_count": len(rows), "update_date_columns": date_columns, "update_dates": update_dates})

    states: dict[str, dict[str, str]] = {}
    districts: dict[str, dict[str, str]] = {}
    subdistricts: dict[str, dict[str, str]] = {}
    districts_by_normalized_code: dict[str, list[dict[str, str]]] = defaultdict(list)
    subdistricts_by_normalized_code: dict[str, list[dict[str, str]]] = defaultdict(list)
    districts_by_name: dict[tuple[str, str], list[dict[str, str]]] = defaultdict(list)
    subdistricts_by_name: dict[tuple[str, str, str], list[dict[str, str]]] = defaultdict(list)

    for _, rows in classified["states"]:
        for row in rows:
            code = clean_code(row.get("state_code"))
            if code:
                states[code] = {"code": code, "name": clean_name(row.get("state_name_english")) or "", "local_name": clean_name(row.get("state_name_local")) or ""}
    for _, rows in classified["districts"]:
        for row in rows:
            code, state_code = clean_code(row.get("district_code")), clean_code(row.get("state_code"))
            if not code or not state_code:
                continue
            item = {"code": code, "state_code": state_code, "name": clean_name(row.get("district_name_english")) or "", "local_name": clean_name(row.get("district_name_local")) or ""}
            districts[code] = item
            if (key := normalized_code(code)) is not None:
                districts_by_normalized_code[key].append(item)
            districts_by_name[(state_code, normalize_name(item["name"]))].append(item)
    for _, rows in classified["subdistricts"]:
        for row in rows:
            code, district_code, state_code = clean_code(row.get("subdistrict_code")), clean_code(row.get("district_code")), clean_code(row.get("state_code"))
            if not code or not district_code or not state_code:
                continue
            item = {"code": code, "state_code": state_code, "district_code": district_code, "name": clean_name(row.get("subdistrict_name_english")) or "", "local_name": clean_name(row.get("subdistrict_name_local")) or ""}
            subdistricts[code] = item
            if (key := normalized_code(code)) is not None:
                subdistricts_by_normalized_code[key].append(item)
            subdistricts_by_name[(state_code, district_code, normalize_name(item["name"]))].append(item)

    def matches(items: list[dict[str, str]]) -> list[dict[str, str]]:
        return [{"code": item["code"], "name": item["name"], "state_code": item["state_code"], "district_code": item.get("district_code")} for item in items]

    audit_records: list[dict[str, object]] = []
    duplicate_groups: dict[str, list[dict[str, object]]] = defaultdict(list)
    seen_valid_village_codes: set[str] = set()
    reason_counts: Counter[str] = Counter()

    for path, rows in classified["villages"]:
        for row_number, row in enumerate(rows, start=2):
            village_code = clean_code(row.get("villageCode"))
            state_code = clean_code(row.get("stateCode"))
            district_code = clean_code(row.get("districtCode"))
            subdistrict_code = clean_code(row.get("subdistrictCode"))
            village_name = clean_name(row.get("villageNameEnglish"))
            markers = corruption_markers(village_name) + corruption_markers(clean_name(row.get("villageNameLocal")))
            base: dict[str, object] = {
                "village_lgd_code": village_code,
                "village_name": village_name,
                "village_name_local": clean_name(row.get("villageNameLocal")),
                "state_code": state_code,
                "state_name": clean_name(row.get("stateNameEnglish")) or states.get(state_code or "", {}).get("name", ""),
                "district_code": district_code,
                "district_name": clean_name(row.get("districtNameEnglish")),
                "subdistrict_code": subdistrict_code,
                "subdistrict_name": clean_name(row.get("subdistrictNameEnglish")),
                "referenced_parent_exists": {
                    "state": bool(state_code and state_code in states),
                    "district": bool(district_code and district_code in districts),
                    "subdistrict": bool(subdistrict_code and subdistrict_code in subdistricts),
                },
                "normalized_parent_matches": {
                    "district_code": matches(districts_by_normalized_code.get(normalized_code(district_code), [])) if district_code else [],
                    "district_name_same_state": matches(districts_by_name.get((state_code or "", normalize_name(row.get("districtNameEnglish"))), [])),
                    "subdistrict_code": matches(subdistricts_by_normalized_code.get(normalized_code(subdistrict_code), [])) if subdistrict_code else [],
                    "subdistrict_name_same_parent": matches(subdistricts_by_name.get((state_code or "", district_code or "", normalize_name(row.get("subdistrictNameEnglish"))), [])),
                },
                **row_detail(row, path, row_number),
            }
            rejection: tuple[str, str] | None = None
            if not village_code or not village_name or not state_code or not district_code or not subdistrict_code or markers:
                rejection = ("Other data-quality issue", "missing required village fields or suspicious name encoding")
            elif state_code not in states:
                rejection = ("State/district relationship mismatch", "referenced state code is absent from national states")
            elif district_code not in districts:
                alternatives = base["normalized_parent_matches"]["district_code"] or base["normalized_parent_matches"]["district_name_same_state"]
                rejection = (("Parent code mismatch" if alternatives else "Missing parent genuinely absent"), "referenced district code is absent from national districts")
            elif districts[district_code]["state_code"] != state_code:
                rejection = ("State/district relationship mismatch", "referenced district belongs to a different state in national data")
            elif subdistrict_code not in subdistricts:
                alternatives = base["normalized_parent_matches"]["subdistrict_code"] or base["normalized_parent_matches"]["subdistrict_name_same_parent"]
                rejection = (("Parent code mismatch" if alternatives else "Missing parent genuinely absent"), "referenced sub-district code is absent from national sub-districts")
            elif (subdistricts[subdistrict_code]["state_code"], subdistricts[subdistrict_code]["district_code"]) != (state_code, district_code):
                rejection = ("State/district relationship mismatch", "referenced sub-district belongs to a different state or district in national data")
            elif village_code in seen_valid_village_codes:
                rejection = ("Duplicate LGD code", "village LGD code duplicates an earlier valid village row")
            else:
                seen_valid_village_codes.add(village_code)

            if village_code:
                duplicate_groups[village_code].append(base)
            if rejection:
                classification, reason = rejection
                audit_records.append({**base, "classification": classification, "rejection_reason": reason})
                reason_counts[reason] += 1

    duplicate_summary: list[dict[str, object]] = []
    duplicate_conflicting_fields: Counter[str] = Counter()
    duplicate_rejected_codes = {
        str(record["village_lgd_code"])
        for record in audit_records
        if record["classification"] == "Duplicate LGD code" and record["village_lgd_code"]
    }
    for code, rows in sorted(duplicate_groups.items()):
        if code not in duplicate_rejected_codes:
            continue
        payloads = [row["source_values"] for row in rows]
        exact = all(payload == payloads[0] for payload in payloads[1:])
        fields = sorted({field for payload in payloads for field in payload})
        differing_fields = [
            field for field in fields
            if len({str(payload.get(field, "")) for payload in payloads}) > 1
        ]
        if not exact:
            duplicate_conflicting_fields.update(differing_fields)
        duplicate_summary.append({
            "village_lgd_code": code,
            "comparison": "exact_duplicate" if exact else "conflicting_records",
            "differing_fields": differing_fields,
            "rows": rows,
        })

    classifications = Counter(str(record["classification"]) for record in audit_records)
    national_dates = {item["filename"]: item["update_dates"] for item in provenance if item["dataset_type"] in {"states", "districts", "subdistricts"}}
    village_dates = {item["filename"]: item["update_dates"] for item in provenance if item["dataset_type"] == "villages"}
    summary = {
        "audit_scope": "rejected village rows and duplicate village LGD codes only; no snapshot changes",
        "raw_directory": str(raw_dir),
        "classification_counts": dict(sorted(classifications.items())),
        "rejection_reason_counts": dict(sorted(reason_counts.items())),
        "duplicate_groups": {
            "total": len(duplicate_summary),
            "exact_duplicates": sum(group["comparison"] == "exact_duplicate" for group in duplicate_summary),
            "conflicting_records": sum(group["comparison"] == "conflicting_records" for group in duplicate_summary),
            "conflicting_field_group_counts": dict(sorted(duplicate_conflicting_fields.items())),
        },
        "source_provenance": provenance,
        "source_version_assessment": {
            "compatible_as_synchronized_hierarchy": False,
            "national_update_dates": national_dates,
            "village_update_dates": village_dates,
            "evidence": "National state/sub-district extracts are dated 2024-10-07, the district extract has no update date, and village records span later export dates through 2026-04-21. This is version-skew evidence, not proof that a similarly named parent is equivalent.",
        },
        "recommendation": "Acquire a single dated LGD administrative hierarchy export aligned with each village extract, then rerun conversion and audit. Do not import this partial candidate or substitute parents based on names.",
    }
    audit_payload = {"records": audit_records, "duplicate_groups": duplicate_summary, "source_provenance": provenance}
    json_path = output_dir / "lgd_rejection_audit.json"
    csv_path = output_dir / "lgd_rejection_audit.csv"
    summary_path = output_dir / "lgd_rejection_summary.json"
    json_path.write_text(json.dumps(audit_payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        fields = ["village_lgd_code", "village_name", "village_name_local", "state_code", "state_name", "district_code", "district_name", "subdistrict_code", "subdistrict_name", "classification", "rejection_reason", "source_filename", "source_row", "referenced_parent_exists", "normalized_parent_matches"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for record in audit_records:
            writer.writerow({key: json.dumps(record[key], ensure_ascii=False, separators=(",", ":")) if key in {"referenced_parent_exists", "normalized_parent_matches"} else record[key] for key in fields})
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"audit_json": str(json_path), "audit_csv": str(csv_path), "summary_json": str(summary_path), **summary}


def convert_lgd(raw_dir: Path, output_dir: Path, snapshot_id: str) -> dict:
    raw_dir = raw_dir.resolve()
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    report: dict = {
        "snapshot_id": snapshot_id,
        "raw_directory": str(raw_dir),
        "staging_directory": str(output_dir),
        "national_file_counts": {},
        "village_file_counts": {},
        "record_counts": {
            "accepted": {},
            "rejected": 0,
            "duplicates": 0,
        },
        "per_state_village_counts": {},
        "missing_village_states": [],
        "missing_village_coverage": True,
        "duplicates": [],
        "rejected_rows": [],
        "encoding_corruption": [],
        "missing_parents": [],
        "invalid_relationships": [],
        "parent_integrity": {
            "valid": True,
            "missing_state_parents": 0,
            "missing_district_parents": 0,
            "missing_subdistrict_parents": 0,
        },
        "partial_village_coverage": True,
        "coordinates": "not-imported",
        "live_snapshot_overwritten": False,
    }

    classified = {
        "states": [],
        "districts": [],
        "subdistricts": [],
        "villages": [],
        "unknown": [],
    }
    if not raw_dir.exists():
        raise ValueError("LGD raw directory does not exist")

    for path in sorted(raw_dir.glob("*.csv"), key=lambda item: item.name.lower()):
        try:
            rows, corruption = read_csv(path)
            if not rows and corruption:
                report["encoding_corruption"].extend(corruption)
                classified["unknown"].append((path, [], corruption))
                continue
            if not rows:
                classified["unknown"].append((path, [], [f"{path.name}: empty CSV"]))
                continue
            headers = list(rows[0].keys())
            kind = classify_csv(path, headers)
            classified[kind].append((path, rows, corruption))
        except (OSError, csv.Error) as exc:
            report["encoding_corruption"].append(f"{path.name}: CSV read error: {exc}")

    if len(classified["states"]) != 1:
        report["rejected_rows"].append({
            "file": "<classification>",
            "row": None,
            "reason": f"expected exactly one national states CSV, found {len(classified['states'])}",
        })
    if len(classified["districts"]) != 1:
        report["rejected_rows"].append({
            "file": "<classification>",
            "row": None,
            "reason": f"expected exactly one national districts CSV, found {len(classified['districts'])}",
        })
    if len(classified["subdistricts"]) != 1:
        report["rejected_rows"].append({
            "file": "<classification>",
            "row": None,
            "reason": f"expected exactly one national sub-districts CSV, found {len(classified['subdistricts'])}",
        })

    records: list[LocationRecord] = []
    source_dates: list[date] = []
    seen_codes: dict[str, set[str]] = {}

    def add_record(record: LocationRecord) -> None:
        key = f"{record.entity_type}:{record.lgd_code}"
        code_set = seen_codes.setdefault(record.entity_type, set())
        if record.lgd_code:
            if record.lgd_code in code_set:
                report["duplicates"].append({
                    "entity_type": record.entity_type,
                    "lgd_code": record.lgd_code,
                })
                return
            code_set.add(record.lgd_code)
        records.append(record)

    state_code_to_name: dict[str, str] = {}
    state_code_to_type: dict[str, str] = {}

    for path, rows, corruption in classified["states"]:
        report["encoding_corruption"].extend(corruption)
        for row_number, row in enumerate(rows, start=2):
            state_code = clean_code(row.get("state_code"))
            english = clean_name(row.get("state_name_english"))
            local = clean_name(row.get("state_name_local"))
            marker = corruption_markers(english) + corruption_markers(local)
            state_or_ut = clean_name(row.get("state_or_ut")) or ""
            if not state_code or not english or marker:
                report["rejected_rows"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": "missing required state fields or likely encoding corruption",
                })
                continue
            entity_type = "union_territory" if "ut" in state_or_ut.casefold() or "territory" in state_or_ut.casefold() else "state"
            state_code_to_name[state_code] = english
            state_code_to_type[state_code] = entity_type
            source_date = parse_source_date(row.get("last_updated"))
            if source_date:
                source_dates.append(source_date)
            add_record(LocationRecord(
                location_id=deterministic_location_id(entity_type, [state_code]),
                lgd_code=state_code,
                name_en=english,
                name_local=local,
                parent_location_id=None,
                entity_type=entity_type,
                state_code=state_code,
                district_code=None,
                latitude=None,
                longitude=None,
                source="LGD",
                source_update_date=source_date,
                active=True,
            ))

    national_states_count = sum(
        1 for record in records
        if record.entity_type in {"state", "union_territory"}
    )
    report["national_file_counts"]["states"] = national_states_count

    for path, rows, corruption in classified["districts"]:
        report["encoding_corruption"].extend(corruption)
        for row_number, row in enumerate(rows, start=2):
            state_code = clean_code(row.get("state_code"))
            district_code = clean_code(row.get("district_code"))
            english = clean_name(row.get("district_name_english"))
            local = clean_name(row.get("district_name_local"))
            marker = corruption_markers(english) + corruption_markers(local)
            if not state_code or not district_code or not english or marker:
                report["rejected_rows"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": "missing required district fields or likely encoding corruption",
                })
                continue
            if state_code not in state_code_to_name:
                report["invalid_relationships"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": f"district state_code {state_code} is absent from states",
                })
                continue
            add_record(LocationRecord(
                location_id=deterministic_location_id("district", [district_code]),
                lgd_code=district_code,
                name_en=english,
                name_local=local,
                parent_location_id=deterministic_location_id(
                    state_code_to_type[state_code],
                    [state_code],
                ),
                entity_type="district",
                state_code=state_code,
                district_code=district_code,
                latitude=None,
                longitude=None,
                source="LGD",
                source_update_date=parse_source_date(row.get("last_updated")),
                active=True,
            ))
    report["national_file_counts"]["districts"] = sum(
        1 for record in records if record.entity_type == "district"
    )

    district_codes = {
        record.district_code
        for record in records
        if record.entity_type == "district" and record.district_code
    }
    district_state_codes: dict[str, str] = {
        record.district_code: record.state_code
        for record in records
        if record.entity_type == "district"
        and record.district_code
        and record.state_code
    }

    for path, rows, corruption in classified["subdistricts"]:
        report["encoding_corruption"].extend(corruption)
        for row_number, row in enumerate(rows, start=2):
            state_code = clean_code(row.get("state_code"))
            district_code = clean_code(row.get("district_code"))
            subdistrict_code = clean_code(row.get("subdistrict_code"))
            english = clean_name(row.get("subdistrict_name_english"))
            local = clean_name(row.get("subdistrict_name_local"))
            marker = corruption_markers(english) + corruption_markers(local)
            if not state_code or not district_code or not subdistrict_code or not english or marker:
                report["rejected_rows"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": "missing required sub-district fields or likely encoding corruption",
                })
                continue
            if district_code not in district_codes:
                report["invalid_relationships"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": f"sub-district district_code {district_code} is absent from districts",
                })
                continue
            if district_state_codes.get(district_code) != state_code:
                report["invalid_relationships"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": f"sub-district state_code {state_code} does not match district {district_code}",
                })
                continue
            add_record(LocationRecord(
                location_id=deterministic_location_id("sub-district", [subdistrict_code]),
                lgd_code=subdistrict_code,
                name_en=english,
                name_local=local,
                parent_location_id=deterministic_location_id("district", [district_code]),
                entity_type="sub-district",
                state_code=state_code,
                district_code=district_code,
                latitude=None,
                longitude=None,
                source="LGD",
                source_update_date=parse_source_date(row.get("last_updated")),
                active=True,
            ))
    report["national_file_counts"]["subdistricts"] = sum(
        1 for record in records if record.entity_type == "sub-district"
    )

    subdistrict_codes = {
        record.lgd_code
        for record in records
        if record.entity_type == "sub-district" and record.lgd_code
    }
    subdistrict_state_district: dict[str, tuple[str, str]] = {
        record.lgd_code: (record.state_code or "", record.district_code or "")
        for record in records
        if record.entity_type == "sub-district" and record.lgd_code
    }
    village_state_counts: dict[str, int] = {}
    village_files: list[str] = []
    village_file_counts: dict[str, int] = {}
    village_records: list[dict] = []
    seen_village_codes: set[str] = set()

    for path, rows, corruption in classified["villages"]:
        print(f"Processing village file {path.name}: {len(rows)} rows", flush=True)
        village_files.append(path.name)
        village_file_counts[path.name] = 0
        report["encoding_corruption"].extend(corruption)
        valid_columns = VILLAGE_REQUIRED_COLUMNS.issubset(set(rows[0].keys())) if rows else False
        if not valid_columns:
            report["rejected_rows"].append({
                "file": path.name,
                "row": None,
                "reason": "missing required village columns",
            })
            continue
        for row_number, row in enumerate(rows, start=2):
            village_code = clean_code(row.get("villageCode"))
            english = clean_name(row.get("villageNameEnglish"))
            local = clean_name(row.get("villageNameLocal"))
            subdistrict_code = clean_code(row.get("subdistrictCode"))
            district_code = clean_code(row.get("districtCode"))
            state_code = clean_code(row.get("stateCode"))
            marker = corruption_markers(english) + corruption_markers(local)
            if not village_code or not english or not subdistrict_code or not district_code or not state_code or marker:
                report["rejected_rows"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": "missing required village fields or likely encoding corruption",
                })
                continue
            if state_code not in state_code_to_name:
                report["invalid_relationships"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": f"village state_code {state_code} is absent from states",
                })
                continue
            if district_code not in district_codes:
                report["invalid_relationships"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": f"village district_code {district_code} is absent from districts",
                })
                continue
            if district_state_codes.get(district_code) != state_code:
                report["invalid_relationships"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": f"village state_code {state_code} does not match district {district_code}",
                })
                continue
            if subdistrict_code not in subdistrict_codes:
                report["missing_parents"].append({
                    "file": path.name,
                    "row": row_number,
                    "missing_parent_type": "sub-district",
                    "subdistrict_code": subdistrict_code,
                    "village_code": village_code,
                })
                continue
            parent_state, parent_district = subdistrict_state_district[subdistrict_code]
            if parent_state != state_code or parent_district != district_code:
                report["invalid_relationships"].append({
                    "file": path.name,
                    "row": row_number,
                    "reason": "village state/district/sub-district hierarchy does not agree",
                })
                continue
            source_date = parse_source_date(row.get("data_gov_update_date"))
            if source_date:
                source_dates.append(source_date)
            if village_code in seen_village_codes:
                report["duplicates"].append({
                    "entity_type": "village",
                    "lgd_code": village_code,
                })
                continue
            seen_village_codes.add(village_code)
            village_state_counts[state_code] = village_state_counts.get(state_code, 0) + 1
            village_file_counts[path.name] += 1
            village_records.append({
                "location_id": deterministic_location_id(
                    "village",
                    [state_code, district_code, subdistrict_code, village_code],
                ),
                "lgd_code": village_code,
                "name_en": english,
                "name_local": local,
                "parent_location_id": deterministic_location_id(
                    "sub-district",
                    [subdistrict_code],
                ),
                "entity_type": "village",
                "state_code": state_code,
                "district_code": district_code,
                "latitude": None,
                "longitude": None,
                "source": "LGD",
                "source_update_date": source_date.isoformat() if source_date else None,
                "active": True,
            })

    report["village_file_counts"] = village_file_counts
    report["per_state_village_counts"] = {
        state_code: village_state_counts[state_code]
        for state_code in sorted(village_state_counts)
    }
    missing_states = [
        {
            "state_code": code,
            "state_name": state_code_to_name.get(code, ""),
        }
        for code in sorted(state_code_to_name)
        if code not in village_state_counts
    ]
    report["missing_village_states"] = missing_states
    report["missing_village_coverage"] = bool(missing_states)
    report["partial_village_coverage"] = bool(missing_states)

    parent_integrity = report["parent_integrity"]
    parent_integrity["missing_state_parents"] = sum(
        1 for record in records
        if record.entity_type in {"district", "sub-district", "village"}
        and record.state_code
        and record.state_code not in state_code_to_name
    )
    parent_integrity["missing_district_parents"] = sum(
        1 for record in records
        if record.entity_type == "sub-district"
        and record.district_code
        and record.district_code not in district_codes
    )
    subdistrict_parent_ids = {
        deterministic_location_id("sub-district", [code])
        for code in subdistrict_codes
    }
    parent_integrity["missing_subdistrict_parents"] = sum(
        1 for record in village_records
        if record["parent_location_id"]
        and record["parent_location_id"] not in subdistrict_parent_ids
    )
    parent_integrity["valid"] = not (
        parent_integrity["missing_state_parents"]
        or parent_integrity["missing_district_parents"]
        or parent_integrity["missing_subdistrict_parents"]
        or report["missing_parents"]
        or report["invalid_relationships"]
    )

    report["national_file_counts"]["villages"] = len(village_records)
    source_update = max(source_dates) if source_dates else None
    report["record_counts"] = {
        "accepted": {
            "states_and_union_territories": national_states_count,
            "districts": report["national_file_counts"]["districts"],
            "subdistricts": report["national_file_counts"]["subdistricts"],
            "villages": len(village_records),
            "total": len(records) + len(village_records),
        },
        "rejected": (
            len(report["rejected_rows"])
            + len(report["missing_parents"])
            + len(report["invalid_relationships"])
        ),
        "duplicates": len(report["duplicates"]),
    }
    # A staging candidate must be byte-stable when its raw inputs are unchanged.
    # The source update date is the only truthful time anchor available at this stage.
    deterministic_ingested_at = datetime.combine(
        source_update or date(1970, 1, 1),
        time.min,
        tzinfo=timezone.utc,
    ).isoformat()
    record_payload = [
        record.model_dump(mode="json")
        for record in records
    ] + village_records
    snapshot_payload = {
        "snapshot_id": snapshot_id,
        "source": "Local Government Directory",
        "source_update_date": source_update.isoformat() if source_update else None,
        "ingested_at": deterministic_ingested_at,
        "records": record_payload,
    }
    staging_snapshot = output_dir / "locations_snapshot.staging.json"
    staging_report = output_dir / "lgd_validation_report.json"
    staging_snapshot.write_text(
        json.dumps(snapshot_payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    report["staging_snapshot"] = str(staging_snapshot)
    report["live_snapshot_overwritten"] = False
    staging_report.write_text(
        json.dumps(report, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    return report


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Prepare a validated LGD snapshot without modifying the live snapshot",
    )
    parser.add_argument(
        "--raw-dir",
        default="backend/data/lgd/raw",
    )
    parser.add_argument(
        "--output-dir",
        default="backend/data/lgd/staging",
    )
    parser.add_argument(
        "--snapshot-id",
        default="lgd-staging",
    )
    parser.add_argument(
        "--audit-only",
        action="store_true",
        help="Write rejected-record audit artifacts without regenerating the staging candidate",
    )
    args = parser.parse_args()
    if args.audit_only:
        report = audit_rejected_lgd(Path(args.raw_dir), Path(args.output_dir))
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return
    report = convert_lgd(
        Path(args.raw_dir),
        Path(args.output_dir),
        args.snapshot_id,
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
