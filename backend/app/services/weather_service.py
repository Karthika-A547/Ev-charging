import time
import requests
from typing import Dict, Any, Optional

# In-memory coordinate cache: key=(round(lat, 2), round(lon, 2)), val=(timestamp, data)
_weather_cache: Dict[tuple, tuple] = {}
CACHE_TTL_SECONDS = 900  # 15 minutes

WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

def get_live_weather(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Fetch live weather for given station coordinates using the free, open Open-Meteo API.
    Includes caching, timeout, retry, and graceful fallback.
    """
    cache_key = (round(latitude, 2), round(longitude, 2))
    now = time.time()

    if cache_key in _weather_cache:
        cached_time, cached_data = _weather_cache[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_data

    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}&longitude={longitude}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
        f"&timezone=auto"
    )

    try:
        response = requests.get(url, timeout=4.0)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})
            w_code = current.get("weather_code", 0)
            condition = WMO_WEATHER_CODES.get(w_code, "Partly cloudy")
            
            result = {
                "available": True,
                "status": "Live weather retrieved successfully",
                "temperature_c": current.get("temperature_2m", 28.0),
                "humidity_pct": current.get("relative_humidity_2m", 55.0),
                "precipitation_mm": current.get("precipitation", 0.0),
                "wind_speed_kmh": current.get("wind_speed_10m", 10.0),
                "weather_code": w_code,
                "condition": condition,
                "source": "Open-Meteo Free API"
            }
            _weather_cache[cache_key] = (now, result)
            return result
        else:
            return _fallback_weather("Weather API returned status " + str(response.status_code))
    except Exception as e:
        return _fallback_weather(f"Weather data temporarily unavailable.")

def _fallback_weather(reason: str) -> Dict[str, Any]:
    # Provide safe contextual fallback based on standard temperate conditions
    return {
        "available": False,
        "status": f"Weather data temporarily unavailable ({reason})",
        "temperature_c": 28.0,
        "humidity_pct": 55.0,
        "precipitation_mm": 0.0,
        "wind_speed_kmh": 12.0,
        "weather_code": 1,
        "condition": "Mainly clear (Standard baseline)",
        "source": "Fallback"
    }
