from datetime import date as Date, datetime, time
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

Transport = Literal["car", "transit", "walk"]


class Place(BaseModel):
    id: str
    name: str
    name_th: str
    district: str
    district_th: str
    lat: float
    lng: float
    suggested_duration: int


class Destination(BaseModel):
    place_id: str = Field(min_length=1, max_length=80)
    duration_minutes: int = Field(ge=1, le=720, strict=True)


class TripRequest(BaseModel):
    mode: Literal["fastest", "smart"]
    transport: Transport
    date: Date
    start_time: time
    start_place_id: str = Field(min_length=1, max_length=80)
    destinations: list[Destination] = Field(min_length=1, max_length=12)

    @field_validator("start_time")
    @classmethod
    def local_minute(cls, value: time) -> time:
        if value.tzinfo is not None or value.second or value.microsecond:
            raise ValueError("Use a Bangkok local time in HH:MM format")
        return value

    @field_validator("date")
    @classmethod
    def supported_date(cls, value: Date) -> Date:
        if not 1900 <= value.year <= 9998:
            raise ValueError("Date must be in years 1900–9998")
        return value

    @model_validator(mode="after")
    def unique_destinations(self):
        ids = [stop.place_id for stop in self.destinations]
        if len(set(ids)) != len(ids) or self.start_place_id in ids:
            raise ValueError("Start and destination places must be distinct")
        return self


class Stop(BaseModel):
    place: Place
    arrival_time: datetime
    visit_start_time: datetime
    departure_time: datetime
    travel_minutes: int
    wait_minutes: int


class Warning(BaseModel):
    code: Literal["closed", "no_visit_window"]
    place: Place


class TripResponse(BaseModel):
    mode: Literal["fastest", "smart"]
    transport: Transport
    start_place: Place
    start_datetime: datetime
    ordered_stops: list[Stop]
    total_travel_minutes: int
    total_trip_minutes: int
    warnings: list[Warning]
    route_geometry: list[tuple[float, float]] | None
    data_source: str
