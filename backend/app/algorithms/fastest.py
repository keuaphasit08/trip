from collections.abc import Mapping

Matrix = Mapping[tuple[str, str], int]


def fastest_order(start: str, destinations: list[str], matrix: Matrix) -> list[str]:
    """Build and improve a fixed-start, open-ended route."""
    remaining = destinations.copy()
    route = [start]
    while remaining:
        nearest = min(remaining, key=lambda place: matrix[route[-1], place])
        route.append(nearest)
        remaining.remove(nearest)

    def cost(path: list[str]) -> int:
        return sum(matrix[a, b] for a, b in zip(path, path[1:]))

    while True:
        best = route
        best_cost = cost(route)
        for first in range(1, len(route) - 1):
            for end in range(first + 2, len(route) + 1):
                candidate = route[:first] + route[first:end][::-1] + route[end:]
                candidate_cost = cost(candidate)
                if candidate_cost < best_cost:
                    best, best_cost = candidate, candidate_cost
        if best is route:
            return route[1:]
        route = best
