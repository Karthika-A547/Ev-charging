import os
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

# Add project root to sys.path so ml module can be imported
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.predict import predict_charging_demand, get_model_and_metadata, classify_demand
from ml.train import train_demand_model
from ..models import ChargingStation, PredictionRecord, Notification, ModelTrainingHistory, User
from .weather_service import get_live_weather
from .traffic_service import get_live_traffic

def run_prediction_for_station(
    db: Session,
    station: ChargingStation,
    user: Optional[User],
    target_date_str: str,
    hour: int,
    temp_override: Optional[float] = None,
    humidity_override: Optional[float] = None,
    precip_override: Optional[float] = None,
    traffic_override: Optional[float] = None,
    fetch_live_api: bool = True
) -> Dict[str, Any]:
    # 1. Parse date to get day_of_week and day
    try:
        dt = datetime.strptime(target_date_str, "%Y-%m-%d")
        day_of_week = dt.weekday()
        day = dt.day
    except Exception:
        dt = datetime.utcnow()
        day_of_week = dt.weekday()
        day = dt.day
        target_date_str = dt.strftime("%Y-%m-%d")

    # 2. Resolve weather
    weather_info = {"status": "User specified / Default"}
    if temp_override is not None and humidity_override is not None:
        temp = temp_override
        humidity = humidity_override
        precip = precip_override or 0.0
    elif fetch_live_api:
        weather_info = get_live_weather(station.latitude, station.longitude)
        temp = weather_info.get("temperature_c", 28.0)
        humidity = weather_info.get("humidity_pct", 55.0)
        precip = weather_info.get("precipitation_mm", 0.0)
    else:
        temp = 28.0
        humidity = 55.0
        precip = 0.0

    # 3. Resolve traffic
    traffic_info = {"status": "User specified / Default"}
    if traffic_override is not None:
        traffic_val = traffic_override
    elif fetch_live_api:
        traffic_info = get_live_traffic(station.latitude, station.longitude)
        traffic_val = traffic_info.get("traffic_level_numeric", 1.2)
    else:
        traffic_val = 1.2

    # 4. Run ML Model prediction
    pred_res = predict_charging_demand(
        station_id=station.station_id,
        hour=hour,
        day_of_week=day_of_week,
        day=day,
        station_total_power_kw=station.total_power_kw or 60.0,
        piles_num=station.piles_num or 2.0,
        charging_gun_num=station.charging_gun_num or 4.0,
        dc_charging_gun_num=station.dc_charging_gun_num or 2.0,
        ac_charging_gun_num=station.ac_charging_gun_num or 2.0,
        temperature=temp,
        humidity=humidity,
        precipitation=precip,
        traffic_level=traffic_val
    )

    pred_demand = pred_res["predicted_demand_sessions"]
    demand_level = pred_res["demand_level"]

    # 5. Persist prediction record
    record = PredictionRecord(
        user_id=user.id if user else None,
        station_id=station.id,
        target_date=target_date_str,
        hour=hour,
        day_of_week=day_of_week,
        temperature_c=temp,
        humidity_pct=humidity,
        precipitation_mm=precip,
        traffic_level=traffic_val,
        predicted_demand=pred_demand,
        demand_level=demand_level,
        historical_mean=pred_res["historical_mean_demand"],
        model_version=pred_res["model_version"]
    )
    db.add(record)

    # 6. If high demand, create notification
    if user and demand_level == "HIGH":
        notif = Notification(
            user_id=user.id,
            title="High EV Demand Alert",
            message=f"Predicted high charging demand ({pred_demand} sessions) at {station.name} for {target_date_str} at {hour:02d}:00.",
            type="warning"
        )
        db.add(notif)

    # Update station's current_demand_level indicator
    station.current_demand_level = demand_level
    db.commit()
    db.refresh(record)

    return {
        "station_id": station.station_id,
        "station_name": station.name,
        "target_date": target_date_str,
        "hour": hour,
        "day_of_week": day_of_week,
        "predicted_demand_sessions": pred_demand,
        "demand_level": demand_level,
        "historical_mean_demand": pred_res["historical_mean_demand"],
        "weather_inputs": {
            "temperature_c": temp,
            "humidity_pct": humidity,
            "precipitation_mm": precip,
            "condition": weather_info.get("condition", "Standard"),
            "source": weather_info.get("source", "Configured")
        },
        "traffic_inputs": {
            "traffic_level_numeric": traffic_val,
            "traffic_level_name": traffic_info.get("traffic_level_name", "Normal"),
            "source": traffic_info.get("source", "Configured")
        },
        "weather_status": weather_info.get("status", "Available"),
        "traffic_status": traffic_info.get("status", "Available"),
        "model_version": pred_res["model_version"],
        "timestamp": record.created_at
    }

def train_model_service(db: Session, admin_name: str, max_records: int = 500000, n_estimators: int = 60) -> Dict[str, Any]:
    meta = train_demand_model(max_rows=max_records, n_estimators=n_estimators)
    
    # Save training event in DB
    history = ModelTrainingHistory(
        model_name=meta["model_name"],
        algorithm=meta["algorithm"],
        record_count=meta["total_records_processed"],
        train_samples=meta["train_samples"],
        test_samples=meta["test_samples"],
        features_json=json.dumps(meta["features"]),
        mae=meta["metrics"]["mae"],
        rmse=meta["metrics"]["rmse"],
        r2=meta["metrics"]["r2"],
        trained_by=admin_name,
        status="completed",
        duration_seconds=meta["training_duration_seconds"]
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return meta
