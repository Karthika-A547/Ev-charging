from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import (
    User, ChargingStation, OperatorStationAssignment, 
    PredictionRecord, OperatorActivity
)
from ..schemas import ChargingStationOut, ChargingStationUpdate, PredictionHistoryOut, ActivityOut
from ..dependencies import require_operator

router = APIRouter(prefix="/api/operators", tags=["Operators"])

@router.get("/me/stations", response_model=List[ChargingStationOut])
def get_my_assigned_stations(
    current_user: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    """Retrieve all charging stations assigned specifically to this approved operator."""
    assignments = db.query(OperatorStationAssignment).filter(
        OperatorStationAssignment.operator_id == current_user.id
    ).all()
    station_ids = [a.station_id for a in assignments]
    
    stations = db.query(ChargingStation).filter(ChargingStation.id.in_(station_ids)).all()
    return stations

@router.get("/me/stations/{station_id}", response_model=ChargingStationOut)
def get_operator_station(
    station_id: int,
    current_user: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    # Enforce assignment check strictly on backend!
    assignment = db.query(OperatorStationAssignment).filter(
        OperatorStationAssignment.operator_id == current_user.id,
        OperatorStationAssignment.station_id == station_id
    ).first()

    if not assignment and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view or manage this station. It is not assigned to your account."
        )

    station = db.query(ChargingStation).filter(ChargingStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    # Log viewed station action
    act = OperatorActivity(
        operator_id=current_user.id,
        station_id=station.id,
        action="VIEW_ASSIGNED_STATION",
        details=f"Viewed operational profile for {station.name}"
    )
    db.add(act)
    db.commit()

    return station

@router.put("/me/stations/{station_id}", response_model=ChargingStationOut)
def update_operator_station(
    station_id: int,
    req: ChargingStationUpdate,
    current_user: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    # Enforce assignment check strictly on backend!
    assignment = db.query(OperatorStationAssignment).filter(
        OperatorStationAssignment.operator_id == current_user.id,
        OperatorStationAssignment.station_id == station_id
    ).first()

    if not assignment and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this station."
        )

    station = db.query(ChargingStation).filter(ChargingStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    if req.name is not None:
        station.name = req.name
    if req.location is not None:
        station.location = req.location
    if req.total_power_kw is not None:
        station.total_power_kw = req.total_power_kw
    if req.piles_num is not None:
        station.piles_num = req.piles_num
    if req.charging_gun_num is not None:
        station.charging_gun_num = req.charging_gun_num
    if req.is_operational is not None:
        station.is_operational = req.is_operational
    if req.notes is not None:
        station.notes = req.notes

    station.updated_at = datetime.utcnow()

    # Log update action
    act = OperatorActivity(
        operator_id=current_user.id,
        station_id=station.id,
        action="UPDATE_STATION_PROFILE",
        details=f"Updated operational specs for {station.name} (Operational: {station.is_operational})"
    )
    db.add(act)
    db.commit()
    db.refresh(station)

    return station

@router.get("/me/analytics")
def get_operator_analytics(
    current_user: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    """Analytics for operator's assigned stations."""
    assignments = db.query(OperatorStationAssignment).filter(
        OperatorStationAssignment.operator_id == current_user.id
    ).all()
    station_ids = [a.station_id for a in assignments]

    stations = db.query(ChargingStation).filter(ChargingStation.id.in_(station_ids)).all()
    
    total_stations = len(stations)
    active_stations = sum(1 for s in stations if s.is_operational)
    total_power = sum(s.total_power_kw or 0 for s in stations)
    total_guns = sum(s.charging_gun_num or 0 for s in stations)

    # Predictions for operator's stations
    predictions = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.station_id.in_(station_ids))
        .all()
    ) if station_ids else []

    high_demand_count = sum(1 for p in predictions if p.demand_level == "HIGH")
    med_demand_count = sum(1 for p in predictions if p.demand_level == "MEDIUM")
    low_demand_count = sum(1 for p in predictions if p.demand_level == "LOW")

    # Hourly distribution of predicted demand
    hourly_distribution = [0] * 24
    hourly_counts = [0] * 24
    for p in predictions:
        h = p.hour % 24
        hourly_distribution[h] += p.predicted_demand
        hourly_counts[h] += 1
    
    avg_hourly = []
    for h in range(24):
        avg = round(hourly_distribution[h] / max(1, hourly_counts[h]), 1) if hourly_counts[h] > 0 else 0
        avg_hourly.append({"hour": f"{h:02d}:00", "predicted_sessions": avg})

    return {
        "total_assigned_stations": total_stations,
        "active_stations": active_stations,
        "total_capacity_kw": round(total_power, 1),
        "total_charging_guns": int(total_guns),
        "total_predictions_generated": len(predictions),
        "demand_breakdown": {
            "high": high_demand_count,
            "medium": med_demand_count,
            "low": low_demand_count
        },
        "hourly_demand_curve": avg_hourly,
        "stations_summary": [
            {
                "id": s.id,
                "station_id": s.station_id,
                "name": s.name,
                "city": s.city,
                "state": s.state,
                "current_demand_level": s.current_demand_level,
                "power_kw": s.total_power_kw,
                "is_operational": s.is_operational
            }
            for s in stations[:10]
        ]
    }

@router.get("/me/predictions", response_model=List[PredictionHistoryOut])
def get_operator_predictions(
    limit: int = 50,
    current_user: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    assignments = db.query(OperatorStationAssignment).filter(
        OperatorStationAssignment.operator_id == current_user.id
    ).all()
    station_ids = [a.station_id for a in assignments]

    if not station_ids:
        return []

    records = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.station_id.in_(station_ids))
        .order_by(PredictionRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    res = []
    for r in records:
        station = db.query(ChargingStation).filter(ChargingStation.id == r.station_id).first()
        res.append({
            "id": r.id,
            "station_id": r.station_id,
            "station_code": station.station_id if station else "ST_UNKNOWN",
            "station_name": station.name if station else "Unknown Station",
            "target_date": r.target_date,
            "hour": r.hour,
            "day_of_week": r.day_of_week,
            "temperature_c": r.temperature_c,
            "humidity_pct": r.humidity_pct,
            "traffic_level": r.traffic_level,
            "predicted_demand": r.predicted_demand,
            "demand_level": r.demand_level,
            "historical_mean": r.historical_mean,
            "model_version": r.model_version,
            "created_at": r.created_at
        })
    return res

@router.get("/me/history")
def get_operator_history(
    action: Optional[str] = None,
    station_id: Optional[int] = None,
    limit: int = 50,
    current_user: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    """Retrieve filtered operator activity history."""
    query = db.query(OperatorActivity).filter(OperatorActivity.operator_id == current_user.id)
    if action:
        query = query.filter(OperatorActivity.action == action)
    if station_id:
        query = query.filter(OperatorActivity.station_id == station_id)
    
    logs = query.order_by(OperatorActivity.created_at.desc()).limit(limit).all()
    return logs
