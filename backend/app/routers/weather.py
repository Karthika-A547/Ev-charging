from fastapi import APIRouter, Query
from ..services.weather_service import get_live_weather

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("")
def get_weather_endpoint(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0)
):
    """Obtain weather data for any coordinate using open Open-Meteo API."""
    return get_live_weather(latitude, longitude)
