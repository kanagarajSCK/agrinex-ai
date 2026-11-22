import argparse
import csv
import json
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from app.core.config import get_settings
from app.locations.repository import LocationRepository


def repository() -> LocationRepository:
    settings = get_settings()
    return LocationRepository(
        settings.lgd_snapshot_path,
        settings.lgd_backup_path,
    )


def load_payload(path: str, snapshot_id: str) -> dict:
    source_path = Path(path)
    if not source_path.exists() or not source_path.is_file():
        raise ValueError("LGD snapshot file does not exist")
    if source_path.stat().st_size > 100 * 1024 * 1024:
        raise ValueError("LGD snapshot exceeds 100 MB")
    if source_path.suffix.lower() == ".json":
        payload = json.loads(source_path.read_text(encoding="utf-8"))
        if isinstance(payload, list):
            payload = {
                "snapshot_id": snapshot_id,
                "source": "Local Government Directory",
                "source_update_date": None,
                "ingested_at": datetime.now(ZoneInfo("Asia/Kolkata")).isoformat(),
                "records": payload,
            }
        if not isinstance(payload, dict):
            raise ValueError("LGD JSON snapshot must contain an object")
        return payload
    if source_path.suffix.lower() == ".csv":
        records = []
        with source_path.open("r", encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle):
                record = {
                    key: (value.strip() if isinstance(value, str) and value.strip() else None)
                    for key, value in row.items()
                }
                records.append(record)
        return {
            "snapshot_id": snapshot_id,
            "source": "Local Government Directory",
            "source_update_date": None,
            "ingested_at": datetime.now(ZoneInfo("Asia/Kolkata")).isoformat(),
            "records": records,
        }
    raise ValueError("Only JSON and CSV LGD snapshots are supported")


def main() -> None:
    parser = argparse.ArgumentParser(description="AgriNex LGD location snapshot tools")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("inspect")
    subparsers.add_parser("validate")
    subparsers.add_parser("rollback")

    import_parser = subparsers.add_parser("import")
    import_parser.add_argument("--file", required=True)
    import_parser.add_argument("--snapshot-id", required=True)

    search_parser = subparsers.add_parser("search")
    search_parser.add_argument("--query", required=True)
    args = parser.parse_args()

    repo = repository()
    if args.command == "import":
        payload = load_payload(args.file, args.snapshot_id)
        snapshot, report = repo.import_snapshot(payload)
        print(json.dumps(report, ensure_ascii=False, indent=2))
    elif args.command == "inspect":
        snapshot = repo.load()
        counts: dict[str, int] = {}
        for record in snapshot.records:
            counts[record.entity_type] = counts.get(record.entity_type, 0) + 1
        print(json.dumps({
            "snapshot_id": snapshot.snapshot_id,
            "source_update_date": (
                snapshot.source_update_date.isoformat()
                if snapshot.source_update_date
                else None
            ),
            "record_count": len(snapshot.records),
            "counts": counts,
        }, ensure_ascii=False, indent=2))
    elif args.command == "validate":
        snapshot = repo.load()
        ids = {record.location_id for record in snapshot.records}
        missing = [
            record.location_id
            for record in snapshot.records
            if record.parent_location_id and record.parent_location_id not in ids
        ]
        print(json.dumps({
            "valid": not missing,
            "record_count": len(snapshot.records),
            "missing_parents": missing,
        }, ensure_ascii=False, indent=2))
    elif args.command == "rollback":
        snapshot = repo.rollback()
        print(json.dumps({
            "rolled_back": True,
            "snapshot_id": snapshot.snapshot_id,
            "record_count": len(snapshot.records),
        }, ensure_ascii=False, indent=2))
    elif args.command == "search":
        print(json.dumps([
            record.model_dump(mode="json")
            for record in repo.search(args.query)
        ], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
