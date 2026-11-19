from datetime import date
from typing import Protocol

from app.data.bangkok import HOURS, MATRICES, PLACES
from app.schemas.trips import Place, Transport

Matrix = dict[tuple[str, str], int]
Geometry = list[tuple[float, float]]


class MapsProvider(Protocol):
    source: str

    def search(self, query: str) -> list[Place]: ...
    def get_place(self, place_id: str) -> Place | None: ...
    def opening_windows(self, place_id: str, day: date) -> list[tuple[int, int]]: ...
    def travel_matrix(self, ids: list[str], transport: Transport) -> Matrix: ...
    def route_geometry(self, ids: list[str], transport: Transport) -> Geometry | None: ...


class MockMapsProvider:
    source = "mock"

    def search(self, query: str) -> list[Place]:
        tokens = query.casefold().split()
        return [
            place for place in PLACES.values()
            if all(token in " ".join([
                place.name, place.name_th, place.district, place.district_th,
            ]).casefold() for token in tokens)
        ]

    def get_place(self, place_id: str) -> Place | None:
        return PLACES.get(place_id)

    def opening_windows(self, place_id: str, day: date) -> list[tuple[int, int]]:
        opening, closing, closed_days = HOURS[place_id]
        return [] if day.weekday() in closed_days else [(opening, closing)]

    def travel_matrix(self, ids: list[str], transport: Transport) -> Matrix:
        return {(a, b): MATRICES[transport][a, b] for a in ids for b in ids}

    def route_geometry(self, ids: list[str], transport: Transport) -> Geometry | None:
        return None  # The client can draw a schematic connection between stops.
