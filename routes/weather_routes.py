import traceback
import requests
from flask import Blueprint, jsonify, request
from middleware.auth_middleware import token_required

weather_bp = Blueprint("weather", __name__)

WEATHER_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    56: "Light Freezing Drizzle", 57: "Dense Freezing Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    66: "Light Freezing Rain", 67: "Heavy Freezing Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    77: "Snow grains",
    80: "Slight Rain Showers", 81: "Moderate Rain Showers", 82: "Violent Rain Showers",
    85: "Slight Snow Showers", 86: "Heavy Snow Showers",
    95: "Slight Thunderstorm",
    96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
}

def get_condition(code):
    return WEATHER_CODE_MAP.get(code, "Unknown")

def fetch_weather_by_coords(lat, lon, city_name=None):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto"
    res = requests.get(url)
    res.raise_for_status()
    data = res.json()
    
    current = data.get("current", {})
    daily = data.get("daily", {})
    hourly = data.get("hourly", {})
    
    forecast_5day = []
    if "time" in daily:
        for i in range(min(5, len(daily["time"]))):
            forecast_5day.append({
                "date": daily["time"][i],
                "max_temp": daily["temperature_2m_max"][i],
                "min_temp": daily["temperature_2m_min"][i],
                "condition": get_condition(daily["weather_code"][i])
            })
            
    hourly_forecast = []
    if "time" in hourly:
        # Get next 24 hours of forecast
        for i in range(24):
            hourly_forecast.append({
                "time": hourly["time"][i],
                "temp": hourly["temperature_2m"][i],
                "condition": get_condition(hourly["weather_code"][i]),
                "precipitation_probability": hourly.get("precipitation_probability", [0] * 24)[i]
            })
            
    return {
        "city": city_name or "Your Location",
        "current": {
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "wind_speed": current.get("wind_speed_10m"),
            "condition": get_condition(current.get("weather_code"))
        },
        "forecast_5day": forecast_5day,
        "hourly_forecast": hourly_forecast
    }

@weather_bp.route("/api/weather/coords", methods=["GET"])
@token_required
def weather_coords():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if not lat or not lon:
        return jsonify({"error": "Latitude and longitude required"}), 400
        
    try:
        data = fetch_weather_by_coords(lat, lon)
        return jsonify(data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch weather data: " + str(e)}), 500

@weather_bp.route("/api/weather/city", methods=["GET"])
@token_required
def weather_city():
    city = request.args.get("q")
    if not city:
        return jsonify({"error": "City name required"}), 400
        
    try:
        # Geocode via open-meteo
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        geo_res = requests.get(geo_url)
        geo_res.raise_for_status()
        geo_data = geo_res.json()
        
        results = geo_data.get("results")
        if not results:
            return jsonify({"error": "City not found"}), 404
            
        lat = results[0]["latitude"]
        lon = results[0]["longitude"]
        resolved_name = f"{results[0].get('name')}, {results[0].get('country', '')}".strip(", ")
        
        data = fetch_weather_by_coords(lat, lon, resolved_name)
        return jsonify(data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch city data: " + str(e)}), 500
