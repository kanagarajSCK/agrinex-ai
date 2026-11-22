import asyncio
import json
import tempfile
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
import httpx

from app.locations.geocoding import OpenMeteoGeocodingProvider
from app.locations.repository import LocationRepository
from app.schemas.locations import LocationRecord, LocationSnapshot
from app.locations.geocoding import OpenMeteoGeocodingProvider


def make_snapshot(records: list[dict]) -> dict:
    return {
        "snapshot_id": "fixture-2026",
        "source": "LGD fixture",
        "source_update_date": "2026-11-22",
        "ingested_at": datetime.now(ZoneInfo("Asia/Kolkata")).isoformat(),
        "records": records,
    }


def test_national_fixture_has_28_states_and_8_union_territories() -> None:
    records = []
    for index in range(1, 29):
        records.append({
            "location_id": f"state-{index}",
            "lgd_code": f"S{index:02}",
            "name_en": f"State {index}",
            "entity_type": "state",
            "state_code": f"S{index:02}",
            "active": True,
        })
    for index in range(1, 9):
        records.append({
            "location_id": f"ut-{index}",
            "lgd_code": f"U{index:02}",
            "name_en": f"Union Territory {index}",
            "entity_type": "union_territory",
            "state_code": f"U{index:02}",
            "active": True,
        })
    snapshot = LocationSnapshot.model_validate(make_snapshot(records))
    states = [record for record in snapshot.records if record.entity_type == "state"]
    uts = [record for record in snapshot.records if record.entity_type == "union_territory"]
    assert len(states) == 28
    assert len(uts) == 8


def test_district_hierarchy_and_local_name_search() -> None:
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "locations.json"
        backup = Path(directory) / "previous.json"
        snapshot = make_snapshot([
            {
                "location_id": "tn",
                "lgd_code": "TN",
                "name_en": "Tamil Nadu",
                "name_local": "தமிழ்நாடு",
                "entity_type": "state",
                "state_code": "TN",
                "active": True,
            },
            {
                "location_id": "salem",
                "lgd_code": "SALEM",
                "name_en": "Salem",
                "parent_location_id": "tn",
                "entity_type": "district",
                "state_code": "TN",
                "district_code": "SALEM",
                "active": True,
            },
            {
                "location_id": "salem-town",
                "lgd_code": "SAL-T",
                "name_en": "Salem",
                "name_local": "சேலம்",
                "parent_location_id": "salem",
                "entity_type": "town",
                "state_code": "TN",
                "district_code": "SALEM",
                "active": True,
            },
        ])
        path.write_text(json.dumps(snapshot), encoding="utf-8")
        repo = LocationRepository(str(path), str(backup))

        assert len(repo.states()) == 1
        assert repo.districts("TN")[0].name_en == "Salem"
        assert repo.places("SALEM", "சேலம்")[0].entity_type == "town"
        assert repo.search("tamil")[0].name_en == "Tamil Nadu"


def test_duplicate_lgd_codes_are_rejected() -> None:
    with tempfile.TemporaryDirectory() as directory:
        repo = LocationRepository(
            str(Path(directory) / "locations.json"),
            str(Path(directory) / "previous.json"),
        )
        snapshot = make_snapshot([
            {
                "location_id": "a",
                "lgd_code": "DUP",
                "name_en": "A",
                "entity_type": "state",
                "state_code": "A",
            },
            {
                "location_id": "b",
                "lgd_code": "DUP",
                "name_en": "B",
                "entity_type": "state",
                "state_code": "B",
            },
        ])
        with pytest.raises(ValueError, match="Duplicate LGD"):
            repo.import_snapshot(snapshot)


def test_missing_parent_is_rejected_from_validated_snapshot() -> None:
    with tempfile.TemporaryDirectory() as directory:
        repo = LocationRepository(
            str(Path(directory) / "locations.json"),
            str(Path(directory) / "previous.json"),
        )
        snapshot = make_snapshot([
            {
                "location_id": "village-a",
                "name_en": "Village A",
                "parent_location_id": "missing",
                "entity_type": "village",
                "district_code": "D1",
            }
        ])
        imported, report = repo.import_snapshot(snapshot)
        assert imported.records == []
        assert report["rejected"] == 1


def test_snapshot_rollback() -> None:
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "locations.json"
        backup = Path(directory) / "previous.json"
        repo = LocationRepository(str(path), str(backup))
        first = make_snapshot([{
            "location_id": "s1",
            "lgd_code": "S1",
            "name_en": "State 1",
            "entity_type": "state",
            "state_code": "S1",
        }])
        repo.import_snapshot(first)
        second = make_snapshot([{
            "location_id": "s2",
            "lgd_code": "S2",
            "name_en": "State 2",
            "entity_type": "state",
            "state_code": "S2",
        }])
        repo.import_snapshot(second)
        rolled_back = repo.rollback()
        assert rolled_back.records[0].location_id == "s1"


def test_invalid_location_id() -> None:
    with tempfile.TemporaryDirectory() as directory:
        repo = LocationRepository(
            str(Path(directory) / "locations.json"),
            str(Path(directory) / "previous.json"),
        )
        assert repo.get("not-found") is None


def test_geocoding_ambiguity_requires_single_match() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={
            "results": [
                {"name": "Salem", "country_code": "IN", "admin1": "Tamil Nadu", "admin2": "Salem", "latitude": 11.6643, "longitude": 78.1460},
                {"name": "Salem", "country_code": "IN", "admin1": "Tamil Nadu", "admin2": "Salem", "latitude": 12.0, "longitude": 79.0},
            ]
        })

    async def scenario() -> None:
        provider = OpenMeteoGeocodingProvider(
            transport=httpx.MockTransport(handler),
        )
        result = await provider.resolve("Salem", "Tamil Nadu", "Salem")
        assert result is None

    asyncio.run(scenario())
