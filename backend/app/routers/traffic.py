from fastapi import APIRouter, Query
from ..services.traffic_service import get_live_traffic

router = APIRouter(prefix="/api/traffic", tags=["Traffic"])

@router.get("")
def get_traffic_endpoint(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0)
):
    """Obtain live traffic flow indicators using open mapping APIs."""
    return get_live_traffic(latitude, longitude)
