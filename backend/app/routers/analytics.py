from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import ChargingStation, PredictionRecord, User

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/demand")
def get_demand_analytics(db: Session = Depends(get_db)):
    # Station counts by demand level
    levels = (
        db.query(ChargingStation.current_demand_level, func.count(ChargingStation.id))
        .group_by(ChargingStation.current_demand_level)
        .all()
    )
    demand_dist = {l[0]: l[1] for l in levels}

    # Demand by state
    state_demand = (
        db.query(ChargingStation.state, ChargingStation.current_demand_level, func.count(ChargingStation.id))
        .group_by(ChargingStation.state, ChargingStation.current_demand_level)
        .filter(ChargingStation.state.isnot(None))
        .limit(30)
        .all()
    )
    
    # Aggregated state stats
    states_dict = {}
    for st, lvl, count in state_demand:
        if st not in states_dict:
            states_dict[st] = {"state": st, "total": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        states_dict[st]["total"] += count
        states_dict[st][lvl] = states_dict[st].get(lvl, 0) + count

    # Top CPOs by station count
    top_cpos = (
        db.query(ChargingStation.cpo_name, func.count(ChargingStation.id))
        .group_by(ChargingStation.cpo_name)
        .order_by(func.count(ChargingStation.id).desc())
        .limit(8)
        .all()
    )

    return {
        "demand_levels": demand_dist,
        "state_demand_breakdown": list(states_dict.values())[:8],
        "top_cpos": [{"cpo": c[0], "count": c[1]} for c in top_cpos if c[0]]
    }
