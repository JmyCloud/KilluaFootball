from fastapi import FastAPI
from service.routers import health, predict

app = FastAPI(
    title="KilluaFootball Model Service",
    description="Football prediction and signal generation service",
    version="0.1.0",
)

app.include_router(health.router, tags=["health"])
app.include_router(predict.router, prefix="/predict", tags=["predictions"])
