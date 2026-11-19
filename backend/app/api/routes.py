from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.trips import Place, TripRequest, TripResponse
from app.services.maps import MapsProvider, MockMapsProvider
from app.services.trips import UnknownPlace, optimize_trip

router = APIRouter(prefix="/api")
mock_provider = MockMapsProvider()


def get_maps_provider() -> MapsProvider:
    return mock_provider


@router.get("/places/search", response_model=list[Place])
def search_places(q: str = Query(default="", max_length=100), provider=Depends(get_maps_provider)):
    return provider.search(q)


@router.post("/trips/optimize", response_model=TripResponse)
def optimize(request: TripRequest, provider=Depends(get_maps_provider)):
    try:
        return optimize_trip(request, provider)
    except UnknownPlace as error:
        raise HTTPException(422, detail={"code": "unknown_place", "place_id": error.args[0]}) from error
