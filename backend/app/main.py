import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Ensure app is discoverable on python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.config import settings
from backend.app.database import SessionLocal, engine, Base
from backend.app.services.data_service import init_database_and_seed
from backend.app.routers import (
    auth, users, operators, admin, stations, predictions, analytics, weather, traffic
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartChargeAI")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables are created and datasets/demo accounts seeded
    logger.info("Initializing SmartCharge AI database and dataset seeding...")
    db = SessionLocal()
    try:
        init_database_and_seed(db)
        logger.info("Database initialization and real dataset seeding complete!")
    except Exception as e:
        logger.error(f"Error during startup data initialization: {e}")
    finally:
        db.close()
    yield
    logger.info("SmartCharge AI backend shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SmartCharge AI – EV Charging Demand Prediction & Intelligent Charging Management Platform",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers for clean production-style responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal service error occurred. Please try again or contact support."}
    )

# Include API Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(operators.router)
app.include_router(admin.router)
app.include_router(stations.router)
app.include_router(predictions.router)
app.include_router(analytics.router)
app.include_router(weather.router)
app.include_router(traffic.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
