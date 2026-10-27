from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ChargingStation, PredictionRecord, User, OperatorStationAssignment, UserActivity
from ..schemas import PredictionRequest, PredictionOut, PredictionHistoryOut
from ..dependencies import get_current_user
from ..services.ml_service import run_prediction_for_station

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.post("", response_model=PredictionOut)
def create_prediction(
    req: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Lookup station by ID (integer) or station_id code (string like ST_000001)
    station = None
    if req.station_id.isdigit():
        station = db.query(ChargingStation).filter(ChargingStation.id == int(req.station_id)).first()
    if not station:
        station = db.query(ChargingStation).filter(ChargingStation.station_id == req.station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail=f"Charging station '{req.station_id}' not found.")

    target_date = req.target_date or datetime.utcnow().strftime("%Y-%m-%d")

    res = run_prediction_for_station(
        db=db,
        station=station,
        user=current_user,
        target_date_str=target_date,
        hour=req.hour,
        temp_override=req.temperature,
        humidity_override=req.humidity,
        precip_override=req.precipitation,
        traffic_override=req.traffic_level,
        fetch_live_api=req.fetch_live_api if req.fetch_live_api is not None else True
    )

    # Activity log
    act = UserActivity(
        user_id=current_user.id,
        action="PREDICT_DEMAND",
        details=f"Predicted demand for {station.name} on {target_date} at {req.hour:02d}:00 -> {res['predicted_demand_sessions']} sessions ({res['demand_level']})"
    )
    db.add(act)
    db.commit()

    return res

@router.get("/history", response_model=List[PredictionHistoryOut])
def get_prediction_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PredictionRecord)

    # Role-based filtering:
    # Admin sees system-wide
    # Operator sees assigned stations
    # Normal user sees only their own
    if current_user.role == "admin":
        pass
    elif current_user.role == "operator":
        assignments = db.query(OperatorStationAssignment.station_id).filter(
            OperatorStationAssignment.operator_id == current_user.id
        ).all()
        assigned_ids = [a[0] for a in assignments]
        query = query.filter((PredictionRecord.user_id == current_user.id) | (PredictionRecord.station_id.in_(assigned_ids)))
    else:
        query = query.filter(PredictionRecord.user_id == current_user.id)

    records = query.order_by(PredictionRecord.created_at.desc()).limit(limit).all()

    res = []
    for r in records:
        st = db.query(ChargingStation).filter(ChargingStation.id == r.station_id).first()
        res.append({
            "id": r.id,
            "station_id": r.station_id,
            "station_code": st.station_id if st else "ST_UNKNOWN",
            "station_name": st.name if st else "Unknown Station",
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
