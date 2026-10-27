from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ================= AUTH & USER SCHEMAS =================
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    city: Optional[str] = None

class UserRegister(UserBase):
    password: str
    confirm_password: str

class OperatorRegister(UserBase):
    password: str
    confirm_password: str
    organization_name: str
    company_details: Optional[str] = None
    state: str
    address: Optional[str] = None
    business_reg_info: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    approval_status: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class OperatorProfileOut(BaseModel):
    id: int
    organization_name: str
    company_details: Optional[str] = None
    city: str
    state: str
    address: Optional[str] = None
    business_reg_info: Optional[str] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    role: str
    approval_status: str
    is_active: bool
    created_at: datetime
    operator_profile: Optional[OperatorProfileOut] = None

    class Config:
        from_attributes = True

# ================= STATION SCHEMAS =================
class ChargingStationBase(BaseModel):
    name: str
    cpo_name: Optional[str] = None
    govt_private: Optional[str] = "Govt."
    state: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    latitude: float
    longitude: float
    total_power_kw: Optional[float] = 60.0
    piles_num: Optional[float] = 2.0
    charging_gun_num: Optional[float] = 4.0
    charger_types: Optional[str] = "Type-II AC, CCS2"
    charger_rating: Optional[str] = "50 kW"
    current_demand_level: Optional[str] = "LOW"
    is_operational: Optional[bool] = True
    notes: Optional[str] = None

class ChargingStationCreate(ChargingStationBase):
    station_id: str

class ChargingStationUpdate(BaseModel):
    name: Optional[str] = None
    cpo_name: Optional[str] = None
    location: Optional[str] = None
    total_power_kw: Optional[float] = None
    piles_num: Optional[float] = None
    charging_gun_num: Optional[float] = None
    is_operational: Optional[bool] = None
    notes: Optional[str] = None

class ChargingStationOut(ChargingStationBase):
    id: int
    station_id: str
    dc_piles_num: Optional[float] = 0.0
    ac_piles_num: Optional[float] = 0.0
    dc_charging_gun_num: Optional[float] = 0.0
    ac_charging_gun_num: Optional[float] = 0.0
    construction_site: Optional[str] = None
    created_at: datetime
    is_favorite: Optional[bool] = False

    class Config:
        from_attributes = True

# ================= PREDICTION SCHEMAS =================
class PredictionRequest(BaseModel):
    station_id: str  # Can be DB ID (as string) or station_id string (e.g. ST_005238)
    target_date: Optional[str] = None  # YYYY-MM-DD
    hour: int = Field(ge=0, le=23)
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    precipitation: Optional[float] = None
    traffic_level: Optional[float] = None
    fetch_live_api: Optional[bool] = True

class PredictionOut(BaseModel):
    station_id: str
    station_name: str
    target_date: str
    hour: int
    day_of_week: int
    predicted_demand_sessions: float
    demand_level: str
    historical_mean_demand: float
    weather_inputs: Dict[str, Any]
    traffic_inputs: Dict[str, Any]
    weather_status: str
    traffic_status: str
    model_version: str
    timestamp: datetime

class PredictionHistoryOut(BaseModel):
    id: int
    station_id: int
    station_code: str
    station_name: str
    target_date: str
    hour: int
    day_of_week: int
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    traffic_level: Optional[float] = None
    predicted_demand: float
    demand_level: str
    historical_mean: Optional[float] = None
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True

# ================= OPERATOR MANAGEMENT SCHEMAS =================
class OperatorApprovalAction(BaseModel):
    action: str  # 'approve' or 'reject'
    rejection_reason: Optional[str] = None

class AssignStationRequest(BaseModel):
    operator_id: int
    station_id: int

# ================= NOTIFICATION SCHEMAS =================
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ================= ADMIN & ML SCHEMAS =================
class ModelTrainRequest(BaseModel):
    max_records: Optional[int] = 500000
    n_estimators: Optional[int] = 60

class ModelStatusOut(BaseModel):
    model_name: str
    algorithm: str
    training_date: str
    total_records_processed: int
    features: List[str]
    metrics: Dict[str, float]
    status: str

# ================= ACTIVITY SCHEMAS =================
class ActivityOut(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    action: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
