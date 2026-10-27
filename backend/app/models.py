from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    city = Column(String(100), nullable=True)
    role = Column(String(20), default="user", index=True)  # 'user', 'operator', 'admin'
    approval_status = Column(String(20), default="approved", index=True)  # 'approved', 'pending', 'rejected'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    operator_profile = relationship("OperatorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    favorites = relationship("FavoriteStation", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    station_assignments = relationship("OperatorStationAssignment", back_populates="operator", foreign_keys="OperatorStationAssignment.operator_id")

class OperatorProfile(Base):
    __tablename__ = "operator_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    organization_name = Column(String(150), nullable=False)
    company_details = Column(Text, nullable=True)
    city = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    state = Column(String(100), nullable=False)
    business_reg_info = Column(String(100), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="operator_profile")

class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    cpo_name = Column(String(100), index=True, nullable=True)
    govt_private = Column(String(50), default="Govt.")
    state = Column(String(100), index=True, nullable=True)
    city = Column(String(100), index=True, nullable=True)
    location = Column(String(300), nullable=True)
    latitude = Column(Float, index=True, nullable=False)
    longitude = Column(Float, index=True, nullable=False)
    total_power_kw = Column(Float, default=60.0)
    piles_num = Column(Float, default=2.0)
    dc_piles_num = Column(Float, default=1.0)
    ac_piles_num = Column(Float, default=1.0)
    charging_gun_num = Column(Float, default=4.0)
    dc_charging_gun_num = Column(Float, default=2.0)
    ac_charging_gun_num = Column(Float, default=2.0)
    charger_types = Column(String(150), default="Type-II AC, CCS2")
    charger_rating = Column(String(50), default="50 kW")
    connector_rating = Column(String(50), default="50 kW")
    no_of_connectors = Column(String(50), default="2")
    construction_site = Column(String(100), default="Public")
    geocoding = Column(String(50), nullable=True)
    current_demand_level = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH
    is_operational = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assignments = relationship("OperatorStationAssignment", back_populates="station", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="station", cascade="all, delete-orphan")
    favorites = relationship("FavoriteStation", back_populates="station", cascade="all, delete-orphan")

class OperatorStationAssignment(Base):
    __tablename__ = "operator_station_assignments"

    id = Column(Integer, primary_key=True, index=True)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=False, index=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    operator = relationship("User", foreign_keys=[operator_id], back_populates="station_assignments")
    station = relationship("ChargingStation", back_populates="assignments")

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=False, index=True)
    target_date = Column(String(20), nullable=False)
    hour = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False)
    temperature_c = Column(Float, nullable=True)
    humidity_pct = Column(Float, nullable=True)
    precipitation_mm = Column(Float, nullable=True)
    traffic_level = Column(Float, nullable=True)
    predicted_demand = Column(Float, nullable=False)
    demand_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    historical_mean = Column(Float, nullable=True)
    model_version = Column(String(100), default="SmartCharge-RF-Demand-v1.0")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="predictions")
    station = relationship("ChargingStation", back_populates="predictions")

class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # 'LOGIN', 'SEARCH_STATIONS', 'VIEW_STATION', 'PREDICT_DEMAND', 'SAVE_FAVORITE'
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="activities")

class OperatorActivity(Base):
    __tablename__ = "operator_activities"

    id = Column(Integer, primary_key=True, index=True)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AdminActivity(Base):
    __tablename__ = "admin_activities"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    target_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class FavoriteStation(Base):
    __tablename__ = "favorite_stations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("charging_stations.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    station = relationship("ChargingStation", back_populates="favorites")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # 'info', 'success', 'warning', 'alert'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")

class ModelTrainingHistory(Base):
    __tablename__ = "model_training_history"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    algorithm = Column(String(100), default="RandomForestRegressor")
    record_count = Column(Integer, nullable=False)
    train_samples = Column(Integer, nullable=False)
    test_samples = Column(Integer, nullable=False)
    features_json = Column(Text, nullable=False)
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2 = Column(Float, nullable=False)
    trained_by = Column(String(100), default="System Admin")
    status = Column(String(50), default="completed")
    duration_seconds = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
