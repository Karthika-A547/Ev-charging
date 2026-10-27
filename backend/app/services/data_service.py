import os
import sys
import json
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session

from ..models import User, ChargingStation, ModelTrainingHistory, Notification
from ..auth import get_password_hash
from ..database import engine, Base

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

def init_database_and_seed(db: Session, force_reload: bool = False):
    """
    Initializes database tables, creates demo user & admin,
    and ingests real charging stations from datasets.
    """
    Base.metadata.create_all(bind=engine)

    # 1. Create Demo Admin if not exists
    admin = db.query(User).filter(User.email == "admin@smartcharge.ai").first()
    if not admin:
        print("[DB Seed] Creating preconfigured Admin account...")
        admin = User(
            full_name="System Administrator",
            email="admin@smartcharge.ai",
            phone="+91 9876543210",
            hashed_password=get_password_hash("Admin@123"),
            city="New Delhi",
            role="admin",
            approval_status="approved",
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    # 2. Create Demo Normal User if not exists
    demo_user = db.query(User).filter(User.email == "user@smartcharge.ai").first()
    if not demo_user:
        print("[DB Seed] Creating preconfigured Demo User account...")
        demo_user = User(
            full_name="Karthik EV Driver",
            email="user@smartcharge.ai",
            phone="+91 9123456780",
            hashed_password=get_password_hash("User@123"),
            city="Bengaluru",
            role="user",
            approval_status="approved",
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # Seed welcome notification
        welcome_notif = Notification(
            user_id=demo_user.id,
            title="Welcome to SmartCharge AI",
            message="Welcome to SmartCharge AI! Explore India's EV charging stations and predict charging demand before arriving.",
            type="info"
        )
        db.add(welcome_notif)
        db.commit()

    # 3. Check if charging stations are already seeded
    existing_stations_count = db.query(ChargingStation).count()
    if existing_stations_count > 0 and not force_reload:
        print(f"[DB Seed] Database already contains {existing_stations_count} stations. Skipping ingestion.")
        return

    # 4. Ingest real stations
    csv_path = os.path.join(DATASET_DIR, "charging_stations", "india_ev_charging_stations.csv")
    pq_path = os.path.join(DATASET_DIR, "ev_transactions", "stations_public.parquet")

    if not os.path.exists(csv_path):
        print(f"[DB Seed Warning] CSV not found at {csv_path}")
        return

    print("[DB Seed] Parsing real Indian EV stations CSV...")
    df_csv = pd.read_csv(csv_path, skiprows=1, on_bad_lines='skip', encoding='utf-8-sig', low_memory=False)
    df_csv.columns = [
        'cpo_name', 'govt_private', 'state', 'district_city', 'location', 
        'latitude', 'longitude', 'charger_type', 'charger_rating', 'connector_rating', 'no_of_connectors'
    ]
    df_csv = df_csv[df_csv['cpo_name'] != 'CPO Name']
    df_csv = df_csv[df_csv['charger_rating'] != 'Rating']

    # Forward fill to resolve Excel merged cells where coordinates were placed on sub-rows
    df_csv['state'] = df_csv['state'].ffill()
    df_csv['district_city'] = df_csv['district_city'].ffill()
    df_csv['cpo_name'] = df_csv['cpo_name'].ffill()

    df_csv['latitude'] = pd.to_numeric(df_csv['latitude'], errors='coerce')
    df_csv['longitude'] = pd.to_numeric(df_csv['longitude'], errors='coerce')

    # Filter to valid India coordinates
    df_valid = df_csv.dropna(subset=['latitude', 'longitude']).copy()
    df_valid = df_valid[
        (df_valid['latitude'] >= 6.0) & (df_valid['latitude'] <= 38.0) &
        (df_valid['longitude'] >= 68.0) & (df_valid['longitude'] <= 98.0)
    ]

    # Deduplicate by coordinates to get unique physical locations
    df_stations_unique = df_valid.drop_duplicates(subset=['latitude', 'longitude']).copy()
    print(f"[DB Seed] Found {len(df_stations_unique)} unique physical stations with valid coordinates.")

    # Standard Indian States and UTs
    STANDARD_STATES = [
        'Andaman & Nicobar', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
        'Chandigarh', 'Chhattisgarh', 'Dadra & Nagar Haveli and Daman & Diu', 'Delhi',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
        'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan',
        'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ]

    STATE_BOUNDS = [
        ('Andaman & Nicobar', 6.5, 14.0, 92.0, 94.5),
        ('Goa', 14.8, 15.9, 73.6, 74.4),
        ('Delhi', 28.38, 28.90, 76.80, 77.40),
        ('Chandigarh', 30.65, 30.82, 76.70, 76.85),
        ('Kerala', 8.15, 12.85, 74.85, 77.45),
        ('Tamil Nadu', 8.05, 13.55, 76.20, 80.35),
        ('Karnataka', 11.55, 18.45, 74.05, 78.60),
        ('Telangana', 15.80, 19.90, 77.20, 81.80),
        ('Andhra Pradesh', 12.60, 19.15, 76.75, 84.80),
        ('Maharashtra', 15.60, 22.05, 72.60, 80.90),
        ('Gujarat', 20.10, 24.70, 68.10, 74.50),
        ('Rajasthan', 23.05, 30.20, 69.50, 78.30),
        ('Punjab', 29.50, 32.50, 73.80, 76.95),
        ('Haryana', 27.60, 30.90, 74.45, 77.65),
        ('Himachal Pradesh', 30.35, 33.25, 75.55, 79.05),
        ('Jammu & Kashmir', 32.25, 36.00, 73.70, 77.60),
        ('Uttarakhand', 28.70, 31.45, 77.55, 81.05),
        ('Uttar Pradesh', 23.85, 30.45, 77.05, 84.65),
        ('Madhya Pradesh', 21.25, 26.90, 74.00, 82.80),
        ('Chhattisgarh', 17.75, 24.10, 80.25, 84.40),
        ('Bihar', 24.30, 27.55, 83.30, 88.30),
        ('Jharkhand', 21.95, 25.35, 83.30, 87.95),
        ('Odisha', 17.80, 22.60, 81.40, 87.55),
        ('West Bengal', 21.50, 27.25, 85.80, 89.90),
        ('Assam', 24.10, 28.25, 89.70, 96.00),
        ('Arunachal Pradesh', 26.50, 29.50, 91.50, 97.50),
        ('Tripura', 22.90, 24.55, 91.15, 92.35),
        ('Meghalaya', 25.00, 26.15, 89.80, 92.85),
        ('Manipur', 23.80, 25.70, 93.00, 94.80),
        ('Nagaland', 25.10, 27.05, 93.30, 95.25),
        ('Mizoram', 21.90, 24.55, 92.25, 93.45),
        ('Sikkim', 27.05, 28.15, 88.00, 88.95),
    ]

    # Major city & district to state authoritative dictionary
    CITY_STATE = {
        'bengaluru': 'Karnataka', 'bangalore': 'Karnataka', 'mysuru': 'Karnataka', 'mysore': 'Karnataka',
        'mangalore': 'Karnataka', 'mangaluru': 'Karnataka', 'hubballi': 'Karnataka', 'hubli': 'Karnataka',
        'dharwad': 'Karnataka', 'belagavi': 'Karnataka', 'belgaum': 'Karnataka', 'tumakuru': 'Karnataka',
        'tumkur': 'Karnataka', 'udupi': 'Karnataka', 'davangere': 'Karnataka', 'ballari': 'Karnataka',
        'chennai': 'Tamil Nadu', 'coimbatore': 'Tamil Nadu', 'madurai': 'Tamil Nadu', 'salem': 'Tamil Nadu',
        'tiruchirappalli': 'Tamil Nadu', 'trichy': 'Tamil Nadu', 'tiruppur': 'Tamil Nadu', 'erode': 'Tamil Nadu',
        'mumbai': 'Maharashtra', 'pune': 'Maharashtra', 'nagpur': 'Maharashtra', 'thane': 'Maharashtra',
        'nashik': 'Maharashtra', 'aurangabad': 'Maharashtra', 'sambhajinagar': 'Maharashtra', 'solapur': 'Maharashtra',
        'hyderabad': 'Telangana', 'secunderabad': 'Telangana', 'warangal': 'Telangana', 'nizamabad': 'Telangana',
        'visakhapatnam': 'Andhra Pradesh', 'vizag': 'Andhra Pradesh', 'vijayawada': 'Andhra Pradesh',
        'guntur': 'Andhra Pradesh', 'nellore': 'Andhra Pradesh', 'tirupati': 'Andhra Pradesh', 'kurnool': 'Andhra Pradesh',
        'delhi': 'Delhi', 'new delhi': 'Delhi', 'noida': 'Uttar Pradesh', 'ghaziabad': 'Uttar Pradesh',
        'gurgaon': 'Haryana', 'gurugram': 'Haryana', 'faridabad': 'Haryana',
        'ahmedabad': 'Gujarat', 'surat': 'Gujarat', 'vadodara': 'Gujarat', 'rajkot': 'Gujarat',
        'jaipur': 'Rajasthan', 'jodhpur': 'Rajasthan', 'kota': 'Rajasthan', 'bikaner': 'Rajasthan',
        'kolkata': 'West Bengal', 'howrah': 'West Bengal', 'siliguri': 'West Bengal',
        'lucknow': 'Uttar Pradesh', 'kanpur': 'Uttar Pradesh', 'varanasi': 'Uttar Pradesh', 'agra': 'Uttar Pradesh',
        'indore': 'Madhya Pradesh', 'bhopal': 'Madhya Pradesh', 'jabalpur': 'Madhya Pradesh', 'gwalior': 'Madhya Pradesh',
        'ludhiana': 'Punjab', 'amritsar': 'Punjab', 'jalandhar': 'Punjab', 'chandigarh': 'Chandigarh',
        'kochi': 'Kerala', 'thiruvananthapuram': 'Kerala', 'trivandrum': 'Kerala', 'kozhikode': 'Kerala',
        'patna': 'Bihar', 'bhubaneswar': 'Odisha', 'ranchi': 'Jharkhand', 'raipur': 'Chhattisgarh',
        'guwahati': 'Assam', 'dehradun': 'Uttarakhand', 'shimla': 'Himachal Pradesh', 'srinagar': 'Jammu & Kashmir',
        'panaji': 'Goa', 'margao': 'Goa', 'puducherry': 'Puducherry'
    }

    def resolve_station_state_city(raw_s, raw_c, raw_l, lat, lon):
        s_str = str(raw_s).strip() if pd.notna(raw_s) else ''
        c_str = str(raw_c).strip() if pd.notna(raw_c) else ''
        l_str = str(raw_l).strip() if pd.notna(raw_l) else ''
        full_text = f"{s_str} {c_str} {l_str}".lower()

        # Handle fragmented Arunachal Pradesh entries
        if 'arunachal pradesh' in full_text:
            district = s_str.replace('Arunachal Pradesh', '').strip() or c_str or 'Itanagar'
            return 'Arunachal Pradesh', district

        # Priority 1: Direct city/district keyword match
        for k, v in CITY_STATE.items():
            if k in full_text:
                city = c_str if c_str else k.title()
                return v, city

        # Priority 2: Standard state text match
        for st in STANDARD_STATES:
            if st.lower() in full_text:
                city = c_str if c_str and c_str.lower() != st.lower() else st
                return st, city

        # Priority 3: Coordinate bounding fallback
        for st_name, lat_min, lat_max, lon_min, lon_max in STATE_BOUNDS:
            if lat_min <= lat <= lat_max and lon_min <= lon <= lon_max:
                city = c_str if c_str else st_name
                return st_name, city

        return (s_str.title() if s_str else "National"), (c_str if c_str else "General Hub")

    # Load technical capacity specs from stations_public.parquet if available
    specs_dict = {}
    if os.path.exists(pq_path):
        df_specs = pd.read_parquet(pq_path)
        specs_dict = df_specs.set_index('station_id').to_dict(orient='index')

    station_records = []
    
    for idx, (_, row) in enumerate(df_stations_unique.iterrows()):
        station_code = f"ST_{idx+1:06d}"
        spec = specs_dict.get(station_code, {})

        cpo = str(row['cpo_name']).strip() if pd.notna(row['cpo_name']) and str(row['cpo_name']).strip() != '' else "SmartCharge Network"
        lat = float(row['latitude'])
        lon = float(row['longitude'])
        
        clean_state, clean_city = resolve_station_state_city(
            row['state'], row['district_city'], row['location'], lat, lon
        )
        
        raw_loc = str(row['location']).strip() if pd.notna(row['location']) and str(row['location']).strip() != '' else f"{cpo} Hub, {clean_city}"
        st_name = f"{cpo} - {raw_loc[:45]}"

        total_power = spec.get('station_total_power_kw', 120.0)
        piles = spec.get('piles_num', 4.0)
        dc_piles = spec.get('dc_piles_num', 2.0)
        ac_piles = spec.get('ac_piles_num', 2.0)
        guns = spec.get('charging_gun_num', 6.0)
        dc_guns = spec.get('dc_charging_gun_num', 4.0)
        ac_guns = spec.get('ac_charging_gun_num', 2.0)

        # Baseline demand level distribution
        demand_level = "LOW"
        if idx % 5 == 0:
            demand_level = "HIGH"
        elif idx % 2 == 0:
            demand_level = "MEDIUM"

        station = ChargingStation(
            station_id=station_code,
            name=st_name,
            cpo_name=cpo,
            govt_private=str(row['govt_private']) if pd.notna(row['govt_private']) else "Govt.",
            state=clean_state,
            city=clean_city,
            location=raw_loc,
            latitude=lat,
            longitude=lon,
            total_power_kw=float(total_power) if pd.notna(total_power) else 120.0,
            piles_num=float(piles) if pd.notna(piles) else 4.0,
            dc_piles_num=float(dc_piles) if pd.notna(dc_piles) else 2.0,
            ac_piles_num=float(ac_piles) if pd.notna(ac_piles) else 2.0,
            charging_gun_num=float(guns) if pd.notna(guns) else 6.0,
            dc_charging_gun_num=float(dc_guns) if pd.notna(dc_guns) else 4.0,
            ac_charging_gun_num=float(ac_guns) if pd.notna(ac_guns) else 2.0,
            charger_types=str(row['charger_type']) if pd.notna(row['charger_type']) else "Type-II AC, CCS2",
            charger_rating=str(row['charger_rating']) if pd.notna(row['charger_rating']) else "60 kW",
            connector_rating=str(row['connector_rating']) if pd.notna(row['connector_rating']) else "60 kW",
            no_of_connectors=str(row['no_of_connectors']) if pd.notna(row['no_of_connectors']) else "2",
            current_demand_level=demand_level,
            is_operational=True
        )
        station_records.append(station)

    print(f"[DB Seed] Committing {len(station_records)} real normalized stations to database...")
    db.bulk_save_objects(station_records)
    db.commit()
    print("[DB Seed] Stations ingestion successfully completed!")

    # 5. Check and seed initial ModelTrainingHistory
    history_count = db.query(ModelTrainingHistory).count()
    meta_path = os.path.join(BASE_DIR, "ml", "models", "metadata.json")
    if history_count == 0 and os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        hist = ModelTrainingHistory(
            model_name=meta.get("model_name", "SmartCharge-RF-Demand-v1.0"),
            algorithm=meta.get("algorithm", "RandomForestRegressor"),
            record_count=meta.get("total_records_processed", 202074),
            train_samples=meta.get("train_samples", 161659),
            test_samples=meta.get("test_samples", 40415),
            features_json=json.dumps(meta.get("features", [])),
            mae=meta.get("metrics", {}).get("mae", 0.8838),
            rmse=meta.get("metrics", {}).get("rmse", 1.5485),
            r2=meta.get("metrics", {}).get("r2", 0.7726),
            trained_by="System Admin",
            status="completed",
            duration_seconds=meta.get("training_duration_seconds", 35.0)
        )
        db.add(hist)
        db.commit()

if __name__ == "__main__":
    from ..database import SessionLocal
    db = SessionLocal()
    try:
        init_database_and_seed(db)
    finally:
        db.close()
