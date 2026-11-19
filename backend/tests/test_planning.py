from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def request(mode, stops, start_time="09:00", day="2026-11-23"):
    return {
        "mode": mode, "transport": "car", "date": day, "start_time": start_time,
        "start_place_id": "siam",
        "destinations": [{"place_id": place, "duration_minutes": length} for place, length in stops],
    }


def test_fastest_includes_closed_stop_and_estimates_totals():
    response = client.post("/api/trips/optimize", json=request("fastest", [("museum", 60), ("jim", 50)]))
    assert response.status_code == 200
    result = response.json()
    assert [x["place"]["id"] for x in result["ordered_stops"]] == ["jim", "museum"]
    assert result["total_travel_minutes"] == 32
    assert result["total_trip_minutes"] == 142
    assert result["ordered_stops"][0]["arrival_time"] == "2026-11-23T09:07:00+07:00"


def test_smart_waits_and_reports_closed_location():
    response = client.post("/api/trips/optimize", json=request("smart", [("museum", 60), ("jim", 50)]))
    assert response.status_code == 200
    result = response.json()
    assert result["warnings"][0]["code"] == "closed"
    assert result["warnings"][0]["place"]["id"] == "museum"
    assert result["ordered_stops"][0]["wait_minutes"] == 53
    assert result["total_trip_minutes"] == 110


def test_smart_impossible_schedule():
    response = client.post("/api/trips/optimize", json=request("smart", [("palace", 60)], "15:00"))
    assert response.status_code == 200
    result = response.json()
    assert result["ordered_stops"] == []
    assert result["total_trip_minutes"] == result["total_travel_minutes"] == 0
    assert result["warnings"][0]["code"] == "no_visit_window"


def test_bilingual_search_and_invalid_destination():
    assert client.get("/api/places/search", params={"q": "วัดโพธิ์"}).json()[0]["id"] == "pho"
    assert client.get("/api/places/search", params={"q": "istanbul"}).json() == []
    for stops in ([("siam", 10)], [("unknown", 15)], [("pho", 0)], []):
        assert client.post("/api/trips/optimize", json=request("smart", stops)).status_code == 422
