from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import User, UserActivity, FavoriteStation, ChargingStation, PredictionRecord, Notification
from ..schemas import UserOut, ChargingStationOut, PredictionHistoryOut, NotificationOut, ActivityOut
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/history", response_model=List[ActivityOut])
def get_my_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve private user activity history for the current authenticated user only."""
    activities = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == current_user.id)
        .order_by(UserActivity.created_at.desc())
        .limit(limit)
        .all()
    )
    result = []
    for a in activities:
        result.append({
            "id": a.id,
            "user_id": a.user_id,
            "user_name": current_user.full_name,
            "user_email": current_user.email,
            "action": a.action,
            "details": a.details,
            "created_at": a.created_at
        })
    return result

@router.get("/me/predictions", response_model=List[PredictionHistoryOut])
def get_my_predictions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve private prediction requests performed by this user."""
    records = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == current_user.id)
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

@router.get("/me/favorites", response_model=List[ChargingStationOut])
def get_my_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favs = db.query(FavoriteStation).filter(FavoriteStation.user_id == current_user.id).all()
    station_ids = [f.station_id for f in favs]
    stations = db.query(ChargingStation).filter(ChargingStation.id.in_(station_ids)).all()
    for s in stations:
        s.is_favorite = True
    return stations

@router.post("/me/favorites/{station_id}")
def add_favorite(
    station_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    station = db.query(ChargingStation).filter(ChargingStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    existing = db.query(FavoriteStation).filter(
        FavoriteStation.user_id == current_user.id,
        FavoriteStation.station_id == station_id
    ).first()
    if not existing:
        fav = FavoriteStation(user_id=current_user.id, station_id=station_id)
        db.add(fav)
        
        # Log activity
        act = UserActivity(
            user_id=current_user.id,
            action="ADD_FAVORITE",
            details=f"Saved station {station.name} to favorites."
        )
        db.add(act)
        db.commit()

    return {"message": "Station added to favorites.", "station_id": station_id}

@router.delete("/me/favorites/{station_id}")
def remove_favorite(
    station_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fav = db.query(FavoriteStation).filter(
        FavoriteStation.user_id == current_user.id,
        FavoriteStation.station_id == station_id
    ).first()
    if fav:
        db.delete(fav)
        act = UserActivity(
            user_id=current_user.id,
            action="REMOVE_FAVORITE",
            details=f"Removed station ID {station_id} from favorites."
        )
        db.add(act)
        db.commit()
    return {"message": "Station removed from favorites."}

@router.get("/me/notifications", response_model=List[NotificationOut])
def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    return notifs

@router.put("/me/notifications/{id}/read")
def mark_notification_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read."}

@router.put("/me/notifications/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(Notification.user_id == current_user.id).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read."}
