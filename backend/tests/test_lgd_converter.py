import csv
import json
import tempfile
from pathlib import Path

from app.locations.lgd_converter import audit_rejected_lgd, convert_lgd


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def test_lgd_converter_creates_staging_snapshot_with_preserved_codes() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        raw = root / "raw"
        staging = root / "staging"
        raw.mkdir()

        write_csv(
            raw / "states.csv",
            ["state_code", "state_name_english", "state_name_local", "state_or_ut"],
            [
                {"state_code": "01", "state_name_english": "State One", "state_name_local": "राज्य", "state_or_ut": "State"},
                {"state_code": "02", "state_name_english": "State Two", "state_name_local": "రాష్ట్రం", "state_or_ut": "State"},
            ],
        )
        write_csv(
            raw / "districts.csv",
            ["state_code", "district_code", "district_name_english", "district_name_local"],
            [{"state_code": "01", "district_code": "001", "district_name_english": "District One", "district_name_local": "District Local"}],
        )
        write_csv(
            raw / "subdistricts.csv",
            ["state_code", "district_code", "subdistrict_code", "subdistrict_name_english", "subdistrict_name_local"],
            [{"state_code": "01", "district_code": "001", "subdistrict_code": "0001", "subdistrict_name_english": "Subdistrict One", "subdistrict_name_local": "Local Subdistrict"}],
        )
        write_csv(
            raw / "villages_tamilnadu.csv",
            ["villageCode", "villageNameEnglish", "villageNameLocal", "subdistrictCode", "districtCode", "stateCode"],
            [
                {"villageCode": "00001", "villageNameEnglish": "Village One", "villageNameLocal": "Village Local", "subdistrictCode": "0001", "districtCode": "001", "stateCode": "01"},
            ],
        )

        live = root / "live_snapshot.json"
        live.write_text("LIVE-SENTINEL", encoding="utf-8")
        report = convert_lgd(raw, staging, "lgd-test")

        staging_payload = json.loads(
            (staging / "locations_snapshot.staging.json").read_text(encoding="utf-8")
        )
        records = staging_payload["records"]
        assert live.read_text(encoding="utf-8") == "LIVE-SENTINEL"
        assert report["live_snapshot_overwritten"] is False
        assert report["missing_village_coverage"] is True
        assert report["per_state_village_counts"]["01"] == 1
        assert any(record["lgd_code"] == "01" for record in records)
        assert any(record["lgd_code"] == "00001" for record in records)
        assert any(record["entity_type"] == "village" for record in records)
        assert report["parent_integrity"]["valid"] is True


def test_lgd_converter_detects_duplicates_missing_parents_and_corruption() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        raw = root / "raw"
        staging = root / "staging"
        raw.mkdir()

        write_csv(
            raw / "states.csv",
            ["state_code", "state_name_english", "state_name_local", "state_or_ut"],
            [
                {"state_code": "01", "state_name_english": "State One", "state_name_local": "State", "state_or_ut": "State"},
                {"state_code": "01", "state_name_english": "Duplicate State", "state_name_local": "State", "state_or_ut": "State"},
            ],
        )
        write_csv(
            raw / "districts.csv",
            ["state_code", "district_code", "district_name_english", "district_name_local"],
            [{"state_code": "01", "district_code": "001", "district_name_english": "District", "district_name_local": "District"}],
        )
        write_csv(
            raw / "subdistricts.csv",
            ["state_code", "district_code", "subdistrict_code", "subdistrict_name_english", "subdistrict_name_local"],
            [{"state_code": "01", "district_code": "001", "subdistrict_code": "0001", "subdistrict_name_english": "Subdistrict", "subdistrict_name_local": "Subdistrict"}],
        )
        write_csv(
            raw / "villages_extra.csv",
            ["villageCode", "villageNameEnglish", "villageNameLocal", "subdistrictCode", "districtCode", "stateCode"],
            [
                {"villageCode": "00001", "villageNameEnglish": "Village", "villageNameLocal": "\ufffd", "subdistrictCode": "9999", "districtCode": "001", "stateCode": "01"},
                {"villageCode": "00002", "villageNameEnglish": "Village Two", "villageNameLocal": "Village Two", "subdistrictCode": "9999", "districtCode": "001", "stateCode": "01"},
            ],
        )

        report = convert_lgd(raw, staging, "lgd-test")

        assert report["duplicates"]
        assert report["encoding_corruption"]
        assert report["missing_parents"]
        assert report["missing_village_coverage"] is True


def test_lgd_converter_rejects_state_district_mismatch_and_is_deterministic() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        raw = root / "raw"
        staging = root / "staging"
        raw.mkdir()
        write_csv(
            raw / "states.csv",
            ["state_code", "state_name_english", "state_name_local", "state_or_ut", "last_updated"],
            [
                {"state_code": "01", "state_name_english": "State One", "state_name_local": "State One", "state_or_ut": "State", "last_updated": "2025-01-01"},
                {"state_code": "02", "state_name_english": "State Two", "state_name_local": "State Two", "state_or_ut": "State", "last_updated": "2025-01-01"},
            ],
        )
        write_csv(
            raw / "districts.csv",
            ["state_code", "district_code", "district_name_english", "district_name_local"],
            [{"state_code": "01", "district_code": "001", "district_name_english": "District", "district_name_local": "District"}],
        )
        write_csv(
            raw / "subdistricts.csv",
            ["state_code", "district_code", "subdistrict_code", "subdistrict_name_english", "subdistrict_name_local"],
            [{"state_code": "01", "district_code": "001", "subdistrict_code": "0001", "subdistrict_name_english": "Subdistrict", "subdistrict_name_local": "Subdistrict"}],
        )
        write_csv(
            raw / "villages.csv",
            ["villageCode", "villageNameEnglish", "villageNameLocal", "subdistrictCode", "districtCode", "stateCode"],
            [{"villageCode": "00001", "villageNameEnglish": "Village", "villageNameLocal": "Village", "subdistrictCode": "0001", "districtCode": "001", "stateCode": "02"}],
        )

        first_report = convert_lgd(raw, staging, "lgd-test")
        first_snapshot = (staging / "locations_snapshot.staging.json").read_bytes()
        second_report = convert_lgd(raw, staging, "lgd-test")
        second_snapshot = (staging / "locations_snapshot.staging.json").read_bytes()

        assert first_snapshot == second_snapshot
        assert first_report["invalid_relationships"]
        assert second_report["record_counts"]["accepted"]["villages"] == 0


def test_rejection_audit_preserves_duplicate_rows_and_reports_code_mismatch() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        raw = root / "raw"
        staging = root / "staging"
        raw.mkdir()
        write_csv(raw / "states.csv", ["state_code", "state_name_english", "state_name_local", "state_or_ut", "last_updated"], [{"state_code": "01", "state_name_english": "State", "state_name_local": "State", "state_or_ut": "State", "last_updated": "2024-10-07"}])
        write_csv(raw / "districts.csv", ["state_code", "district_code", "district_name_english", "district_name_local"], [{"state_code": "01", "district_code": "001", "district_name_english": "District", "district_name_local": "District"}])
        write_csv(raw / "subdistricts.csv", ["state_code", "district_code", "subdistrict_code", "subdistrict_name_english", "subdistrict_name_local", "last_updated"], [{"state_code": "01", "district_code": "001", "subdistrict_code": "0001", "subdistrict_name_english": "Subdistrict", "subdistrict_name_local": "Subdistrict", "last_updated": "2024-10-07"}])
        write_csv(
            raw / "villages.csv",
            ["villageCode", "villageNameEnglish", "villageNameLocal", "subdistrictCode", "subdistrictNameEnglish", "districtCode", "districtNameEnglish", "stateCode", "stateNameEnglish", "data_gov_update_date"],
            [
                {"villageCode": "00001", "villageNameEnglish": "Village", "villageNameLocal": "Village", "subdistrictCode": "0001", "subdistrictNameEnglish": "Subdistrict", "districtCode": "001", "districtNameEnglish": "District", "stateCode": "01", "stateNameEnglish": "State", "data_gov_update_date": "21-04-2026"},
                {"villageCode": "00001", "villageNameEnglish": "Village", "villageNameLocal": "Village", "subdistrictCode": "0001", "subdistrictNameEnglish": "Subdistrict", "districtCode": "001", "districtNameEnglish": "District", "stateCode": "01", "stateNameEnglish": "State", "data_gov_update_date": "21-04-2026"},
                {"villageCode": "00002", "villageNameEnglish": "Mismatch", "villageNameLocal": "Mismatch", "subdistrictCode": "0002", "subdistrictNameEnglish": "Subdistrict", "districtCode": "001", "districtNameEnglish": "District", "stateCode": "01", "stateNameEnglish": "State", "data_gov_update_date": "21-04-2026"},
                {"villageCode": "00003", "villageNameEnglish": "Original", "villageNameLocal": "Original", "subdistrictCode": "0001", "subdistrictNameEnglish": "Subdistrict", "districtCode": "001", "districtNameEnglish": "District", "stateCode": "01", "stateNameEnglish": "State", "data_gov_update_date": "21-04-2026"},
                {"villageCode": "00003", "villageNameEnglish": "Changed", "villageNameLocal": "Changed", "subdistrictCode": "0001", "subdistrictNameEnglish": "Subdistrict", "districtCode": "001", "districtNameEnglish": "District", "stateCode": "01", "stateNameEnglish": "State", "data_gov_update_date": "21-04-2026"},
            ],
        )

        report = audit_rejected_lgd(raw, staging)
        audit = json.loads((staging / "lgd_rejection_audit.json").read_text(encoding="utf-8"))
        summary = json.loads((staging / "lgd_rejection_summary.json").read_text(encoding="utf-8"))

        assert Path(report["audit_csv"]).exists()
        assert len(audit["records"]) == 3
        assert {record["classification"] for record in audit["records"]} == {"Duplicate LGD code", "Parent code mismatch"}
        assert len(audit["duplicate_groups"]) == 2
        assert {group["comparison"] for group in audit["duplicate_groups"]} == {"exact_duplicate", "conflicting_records"}
        assert any("villageNameEnglish" in group["differing_fields"] for group in audit["duplicate_groups"])
        assert summary["source_version_assessment"]["compatible_as_synchronized_hierarchy"] is False
