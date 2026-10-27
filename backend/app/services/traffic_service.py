import time
import requests
from typing import Dict, Any
from ..config import settings

_traffic_cache: Dict[tuple, tuple] = {}
CACHE_TTL_SECONDS = 600  # 10 minutes

def get_live_traffic(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Fetch traffic conditions for given station coordinates using open mapping services (OSRM/Overpass)
    or commercial API key (e.g. TomTom) if TRAFFIC_API_KEY is configured.
    """
    cache_key = (round(latitude, 3), round(longitude, 3))
    now = time.time()

    if cache_key in _traffic_cache:
        cached_time, cached_data = _traffic_cache[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_data

    # If TomTom or Here API key is provided
    if settings.TRAFFIC_API_KEY:
        try:
            url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point={latitude},{longitude}&key={settings.TRAFFIC_API_KEY}"
            resp = requests.get(url, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json().get("flowSegmentData", {})
                current_speed = data.get("currentSpeed", 30)
                free_flow_speed = data.get("freeFlowSpeed", 40)
                confidence = data.get("confidence", 0.9)
                ratio = current_speed / max(1, free_flow_speed)
                
                if ratio < 0.5:
                    level = "HEAVY"
                    numeric_level = 3.2
                elif ratio < 0.8:
                    level = "MODERATE"
                    numeric_level = 2.0
                else:
                    level = "FLOWING"
                    numeric_level = 1.0

                result = {
                    "available": True,
                    "status": "Live traffic retrieved",
                    "traffic_level_name": level,
                    "traffic_level_numeric": numeric_level,
                    "current_speed_kmh": round(current_speed, 1),
                    "free_flow_speed_kmh": round(free_flow_speed, 1),
                    "congestion_ratio": round(1.0 - ratio, 2),
                    "source": "TomTom Traffic API"
                }
                _traffic_cache[cache_key] = (now, result)
                return result
        except Exception:
            pass

    # Open fallback using OSRM open routing service to query local travel impedance
    try:
        # Sample two points ~1.5km apart along latitude offset to measure travel delay
        lat2 = latitude + 0.012
        lon2 = longitude + 0.012
        osrm_url = f"https://router.project-osrm.org/route/v1/driving/{longitude},{latitude};{lon2},{lat2}?overview=false"
        resp = requests.get(osrm_url, timeout=3.5)
        if resp.status_code == 200:
            route_data = resp.json().get("routes", [{}])[0]
            duration_s = route_data.get("duration", 180)
            distance_m = route_data.get("distance", 1500)
            avg_speed_kmh = (distance_m / max(1, duration_s)) * 3.6
            
            if avg_speed_kmh < 18:
                level = "HEAVY"
                numeric_level = 2.8
            elif avg_speed_kmh < 35:
                level = "MODERATE"
                numeric_level = 1.8
            else:
                level = "LOW / FLOWING"
                numeric_level = 1.0

            result = {
                "available": True,
                "status": "Live route flow calculated",
                "traffic_level_name": level,
                "traffic_level_numeric": numeric_level,
                "estimated_speed_kmh": round(avg_speed_kmh, 1),
                "source": "OSRM Open Routing Network"
            }
            _traffic_cache[cache_key] = (now, result)
            return result
    except Exception:
        pass

    # Safe default if network is disconnected
    return {
        "available": False,
        "status": "Traffic data temporarily unavailable (Standard flow assumed)",
        "traffic_level_name": "NORMAL",
        "traffic_level_numeric": 1.2,
        "source": "Fallback baseline"
    }
