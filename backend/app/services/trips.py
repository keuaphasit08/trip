from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from app.algorithms.fastest import fastest_order
from app.algorithms.smart import Visit, smart_schedule
from app.schemas.trips import Stop, TripRequest, TripResponse, Warning
from app.services.maps import MapsProvider


class UnknownPlace(ValueError):
    pass


def optimize_trip(request: TripRequest, provider: MapsProvider) -> TripResponse:
    start = request.start_place_id
    durations = {destination.place_id: destination.duration_minutes for destination in request.destinations}
    ids = [start, *durations]
    places = {}
    for place_id in ids:
        place = provider.get_place(place_id)
        if place is None:
            raise UnknownPlace(place_id)
        places[place_id] = place

    matrix = provider.travel_matrix(ids, request.transport)
    midnight = datetime.combine(request.date, time(), ZoneInfo("Asia/Bangkok"))
    start_minute = request.start_time.hour * 60 + request.start_time.minute

    def at(minute: int) -> datetime:
        return midnight + timedelta(minutes=minute)

    warnings = []
    if request.mode == "smart":
        windows = {place_id: provider.opening_windows(place_id, request.date) for place_id in durations}
        visits = smart_schedule(start, start_minute, durations, windows, matrix)
        visited = {visit.place_id for visit in visits}
        warnings = [
            Warning(code="no_visit_window" if windows[place_id] else "closed", place=places[place_id])
            for place_id in durations if place_id not in visited
        ]
    else:
        visits = []
        previous, clock = start, start_minute
        for place_id in fastest_order(start, list(durations), matrix):
            travel = matrix[previous, place_id]
            arrival = clock + travel
            clock = arrival + durations[place_id]
            visits.append(Visit(place_id, arrival, arrival, clock, travel))
            previous = place_id

    return TripResponse(
        mode=request.mode,
        transport=request.transport,
        start_place=places[start],
        start_datetime=at(start_minute),
        ordered_stops=[
            Stop(
                place=places[visit.place_id],
                arrival_time=at(visit.arrival),
                visit_start_time=at(visit.visit_start),
                departure_time=at(visit.departure),
                travel_minutes=visit.travel,
                wait_minutes=visit.visit_start - visit.arrival,
            ) for visit in visits
        ],
        total_travel_minutes=sum(visit.travel for visit in visits),
        total_trip_minutes=visits[-1].departure - start_minute if visits else 0,
        warnings=warnings,
        route_geometry=provider.route_geometry([start, *(visit.place_id for visit in visits)], request.transport)
        if visits else None,
        data_source=provider.source,
    )
