from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import ChargingStation, FavoriteStation, UserActivity
from ..schemas import ChargingStationOut
from ..dependencies import get_current_user
from ..models import User
from ..services.weather_service import get_live_weather
from ..services.traffic_service import get_live_traffic

router = APIRouter(prefix="/api/stations", tags=["Charging Stations"])

@router.get("", response_model=List[ChargingStationOut])
def get_stations(
    search: Optional[str] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    demand_level: Optional[str] = None,
    cpo_name: Optional[str] = None,
    limit: int = Query(default=100, le=10000),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(ChargingStation)

    if search:
        s = f"%{search}%"
        query = query.filter(
            (ChargingStation.name.ilike(s)) |
            (ChargingStation.station_id.ilike(s)) |
            (ChargingStation.city.ilike(s)) |
            (ChargingStation.state.ilike(s)) |
            (ChargingStation.location.ilike(s)) |
            (ChargingStation.cpo_name.ilike(s))
        )
    if state:
        query = query.filter(ChargingStation.state.ilike(f"%{state}%"))
    if city:
        query = query.filter(ChargingStation.city.ilike(f"%{city}%"))
    if demand_level and demand_level.upper() in ["LOW", "MEDIUM", "HIGH"]:
        query = query.filter(ChargingStation.current_demand_level == demand_level.upper())
    if cpo_name:
        query = query.filter(ChargingStation.cpo_name.ilike(f"%{cpo_name}%"))

    stations = query.order_by(ChargingStation.id.asc()).offset(offset).limit(limit).all()
    return stations

@router.get("/states")
def get_unique_states(db: Session = Depends(get_db)):
    states = (
        db.query(ChargingStation.state)
        .filter(ChargingStation.state.isnot(None), ChargingStation.state != '')
        .distinct()
        .order_by(ChargingStation.state.asc())
        .all()
    )
    return [s[0] for s in states if s[0]]

@router.get("/cities")
def get_unique_cities(state: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ChargingStation.city).filter(ChargingStation.city.isnot(None), ChargingStation.city != '')
    if state:
        query = query.filter(ChargingStation.state.ilike(f"%{state}%"))
    cities = query.distinct().order_by(ChargingStation.city.asc()).limit(150).all()
    return [c[0] for c in cities if c[0]]

@router.get("/{station_id}")
def get_station_details(
    station_id: int,
    db: Session = Depends(get_db)
):
    station = db.query(ChargingStation).filter(ChargingStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    # Fetch live weather for station coordinates
    weather = get_live_weather(station.latitude, station.longitude)

    # Fetch live traffic for station coordinates
    traffic = get_live_traffic(station.latitude, station.longitude)

    # Generate hourly demand pattern based on technical capacity and historical profile
    base_demand = 1.2 if station.current_demand_level == "LOW" else (3.8 if station.current_demand_level == "MEDIUM" else 7.5)
    hourly_trend = []
    peak_hours = [9, 10, 11, 17, 18, 19, 20]
    for h in range(24):
        mult = 1.7 if h in peak_hours else (0.4 if h < 6 else 1.0)
        hourly_trend.append({
            "hour": f"{h:02d}:00",
            "demand_sessions": round(base_demand * mult, 1)
        })

    return {
        "station": {
            "id": station.id,
            "station_id": station.station_id,
            "name": station.name,
            "cpo_name": station.cpo_name,
            "govt_private": station.govt_private,
            "state": station.state,
            "city": station.city,
            "location": station.location,
            "latitude": station.latitude,
            "longitude": station.longitude,
            "total_power_kw": station.total_power_kw,
            "piles_num": station.piles_num,
            "dc_piles_num": station.dc_piles_num,
            "ac_piles_num": station.ac_piles_num,
            "charging_gun_num": station.charging_gun_num,
            "dc_charging_gun_num": station.dc_charging_gun_num,
            "ac_charging_gun_num": station.ac_charging_gun_num,
            "charger_types": station.charger_types,
            "charger_rating": station.charger_rating,
            "connector_rating": station.connector_rating,
            "no_of_connectors": station.no_of_connectors,
            "construction_site": station.construction_site,
            "current_demand_level": station.current_demand_level,
            "is_operational": station.is_operational,
            "notes": station.notes
        },
        "weather": weather,
        "traffic": traffic,
        "hourly_demand_trend": hourly_trend
    }
