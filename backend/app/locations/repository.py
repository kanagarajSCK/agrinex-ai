import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from app.schemas.locations import LocationRecord, LocationSnapshot


class LocationRepository:
    def __init__(self, snapshot_path: str, backup_path: str) -> None:
        self._snapshot_path = Path(snapshot_path)
        self._backup_path = Path(backup_path)
        self._snapshot_path.parent.mkdir(parents=True, exist_ok=True)

    def load(self) -> LocationSnapshot:
        if not self._snapshot_path.exists():
            return LocationSnapshot(
                snapshot_id="not-imported",
                ingested_at=datetime.now(ZoneInfo("Asia/Kolkata")),
                records=[],
            )
        try:
            payload = json.loads(self._snapshot_path.read_text(encoding="utf-8"))
            return LocationSnapshot.model_validate(payload)
        except (json.JSONDecodeError, ValueError) as exc:
            raise ValueError("The LGD location snapshot is invalid") from exc

    def import_snapshot(self, payload: dict) -> tuple[LocationSnapshot, dict]:
        snapshot = LocationSnapshot.model_validate(payload)
        records = snapshot.records
        ids = [record.location_id for record in records]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate location_id values are not allowed")

        lgd_codes = [
            record.lgd_code
            for record in records
            if record.lgd_code
        ]
        if len(lgd_codes) != len(set(lgd_codes)):
            raise ValueError("Duplicate LGD codes are not allowed")

        record_ids = set(ids)
        rejected: list[dict] = []
        validated: list[LocationRecord] = []
        for record in records:
            if record.parent_location_id and record.parent_location_id not in record_ids:
                rejected.append({
                    "location_id": record.location_id,
                    "reason": "missing parent location",
                })
                continue
            validated.append(record)

        snapshot = snapshot.model_copy(update={"records": validated})
        if self._snapshot_path.exists():
            self._backup_path.parent.mkdir(parents=True, exist_ok=True)
            self._backup_path.write_text(
                self._snapshot_path.read_text(encoding="utf-8"),
                encoding="utf-8",
            )

        temporary = self._snapshot_path.with_suffix(".tmp")
        temporary.write_text(
            snapshot.model_dump_json(indent=2),
            encoding="utf-8",
        )
        temporary.replace(self._snapshot_path)
        report = {
            "snapshot_id": snapshot.snapshot_id,
            "accepted": len(validated),
            "rejected": len(rejected),
            "rejections": rejected,
        }
        return snapshot, report

    def rollback(self) -> LocationSnapshot:
        if not self._backup_path.exists():
            raise ValueError("No previous location snapshot is available")
        payload = self._backup_path.read_text(encoding="utf-8")
        snapshot = LocationSnapshot.model_validate_json(payload)
        temporary = self._snapshot_path.with_suffix(".tmp")
        temporary.write_text(payload, encoding="utf-8")
        temporary.replace(self._snapshot_path)
        return snapshot

    def states(self) -> list[LocationRecord]:
        return [
            record
            for record in self.load().records
            if record.active
            and record.entity_type in {"state", "union_territory"}
        ]

    def districts(self, state_code: str) -> list[LocationRecord]:
        return [
            record
            for record in self.load().records
            if record.active
            and record.entity_type == "district"
            and record.state_code == state_code
        ]

    def sub_districts(self, district_code: str) -> list[LocationRecord]:
        return [
            record
            for record in self.load().records
            if record.active
            and record.entity_type == "sub-district"
            and record.district_code == district_code
        ]

    def places(self, district_code: str, query: str = "") -> list[LocationRecord]:
        needle = query.strip().casefold()
        return [
            record
            for record in self.load().records
            if record.active
            and record.entity_type in {"city", "town", "village", "local-body", "panchayat"}
            and record.district_code == district_code
            and (
                not needle
                or needle in record.name_en.casefold()
                or (
                    record.name_local
                    and needle in record.name_local.casefold()
                )
            )
        ]

    def search(self, query: str) -> list[LocationRecord]:
        needle = query.strip().casefold()
        if not needle:
            return []
        return [
            record
            for record in self.load().records
            if record.active
            and (
                needle in record.name_en.casefold()
                or (
                    record.name_local
                    and needle in record.name_local.casefold()
                )
            )
        ][:100]

    def get(self, location_id: str) -> LocationRecord | None:
        for record in self.load().records:
            if record.location_id == location_id:
                return record
        return None
