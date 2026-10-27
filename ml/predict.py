import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))
MODEL_PATH = os.path.join(MODELS_DIR, "demand_rf_model.joblib")
META_PATH = os.path.join(MODELS_DIR, "metadata.json")
STATS_PATH = os.path.join(MODELS_DIR, "station_stats.json")

_model = None
_metadata = None
_station_stats = None

def get_model_and_metadata():
    global _model, _metadata, _station_stats
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    if _metadata is None:
        if os.path.exists(META_PATH):
            with open(META_PATH, "r", encoding="utf-8") as f:
                _metadata = json.load(f)
        else:
            _metadata = {}
    if _station_stats is None:
        if os.path.exists(STATS_PATH):
            with open(STATS_PATH, "r", encoding="utf-8") as f:
                _station_stats = json.load(f)
        else:
            _station_stats = {}
    return _model, _metadata, _station_stats

def classify_demand(demand_value: float) -> str:
    """Classify hourly charging sessions into transparent tiers."""
    if demand_value <= 2.0:
        return "LOW"
    elif demand_value <= 6.0:
        return "MEDIUM"
    else:
        return "HIGH"

def predict_charging_demand(
    station_id: str,
    hour: int,
    day_of_week: int,
    day: int = 15,
    station_total_power_kw: float = 120.0,
    piles_num: float = 4.0,
    charging_gun_num: float = 6.0,
    dc_charging_gun_num: float = 4.0,
    ac_charging_gun_num: float = 2.0,
    temperature: float = 28.0,
    humidity: float = 60.0,
    precipitation: float = 0.0,
    traffic_level: float = 1.0
):
    model, metadata, stats = get_model_and_metadata()
    st_stat = stats.get(station_id, {})
    hist_mean = st_stat.get("hist_mean_demand", 1.8)
    hist_total = st_stat.get("hist_total_tx", 25.0)

    is_weekend = 1 if day_of_week >= 5 else 0

    features = pd.DataFrame([{
        'hour': hour,
        'day_of_week': day_of_week,
        'is_weekend': is_weekend,
        'day': day,
        'station_total_power_kw': station_total_power_kw,
        'piles_num': piles_num,
        'charging_gun_num': charging_gun_num,
        'dc_charging_gun_num': dc_charging_gun_num,
        'ac_charging_gun_num': ac_charging_gun_num,
        'station_hist_mean': hist_mean,
        'station_hist_total': hist_total,
        'temperature': temperature,
        'humidity': humidity,
        'precipitation': precipitation,
        'traffic_level': traffic_level
    }])

    pred = float(model.predict(features)[0])
    pred_rounded = max(0.0, round(pred, 1))
    demand_level = classify_demand(pred_rounded)

    return {
        "predicted_demand_sessions": pred_rounded,
        "demand_level": demand_level,
        "station_id": station_id,
        "hour": hour,
        "day_of_week": day_of_week,
        "is_weekend": bool(is_weekend),
        "historical_mean_demand": round(hist_mean, 2),
        "weather_inputs": {
            "temperature_c": temperature,
            "humidity_pct": humidity,
            "precipitation_mm": precipitation
        },
        "traffic_inputs": {
            "traffic_level": traffic_level
        },
        "model_version": metadata.get("model_name", "SmartCharge-RF-Demand-v1.0"),
        "metrics": metadata.get("metrics", {})
    }

if __name__ == "__main__":
    res = predict_charging_demand(
        station_id="ST_005238",
        hour=18,
        day_of_week=2,
        temperature=31.5,
        humidity=55.0,
        precipitation=0.0,
        traffic_level=2.2
    )
    print("Test Prediction Output:\n", json.dumps(res, indent=2))
