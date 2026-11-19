from dataclasses import dataclass

from app.algorithms.fastest import Matrix


@dataclass(frozen=True)
class Visit:
    place_id: str
    arrival: int
    visit_start: int
    departure: int
    travel: int


@dataclass(frozen=True)
class Schedule:
    stops: tuple[Visit, ...] = ()
    used: int = 0
    travel: int = 0


def smart_schedule(
    start: str,
    start_minute: int,
    durations: dict[str, int],
    windows: dict[str, list[tuple[int, int]]],
    matrix: Matrix,
    beam_width: int = 64,
) -> tuple[Visit, ...]:
    """Search up to 64 partial routes per depth, favoring more scheduled visits."""
    frontier = [Schedule()]
    best = frontier[0]
    for _ in durations:
        candidates = []
        for schedule in frontier:
            last = schedule.stops[-1] if schedule.stops else None
            for index, (place_id, duration) in enumerate(durations.items()):
                bit = 1 << index
                if schedule.used & bit:
                    continue
                travel = matrix[last.place_id if last else start, place_id]
                arrival = (last.departure if last else start_minute) + travel
                visit_start = min(
                    (max(arrival, opening) for opening, closing in windows[place_id]
                     if max(arrival, opening) + duration <= closing),
                    default=None,
                )
                if visit_start is None:
                    continue
                visit = Visit(place_id, arrival, visit_start, visit_start + duration, travel)
                candidates.append(Schedule(
                    schedule.stops + (visit,), schedule.used | bit, schedule.travel + travel,
                ))
        if not candidates:
            break
        candidates.sort(key=lambda item: (item.stops[-1].departure, item.travel))
        frontier = candidates[:beam_width]
        best = frontier[0]
    return best.stops
