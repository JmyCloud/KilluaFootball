from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PredictionRequest(BaseModel):
    fixture_id: int
    features: dict


class PredictionResponse(BaseModel):
    fixture_id: int
    market: str
    poisson: float | None = None
    dixon_coles: float | None = None
    catboost: float | None = None
    lightgbm: float | None = None
    xgboost: float | None = None
    ensemble: float | None = None
    calibrated: float | None = None


@router.post("/1x2", response_model=list[PredictionResponse])
async def predict_1x2(request: PredictionRequest):
    # TODO: Load models and run inference
    return [
        PredictionResponse(
            fixture_id=request.fixture_id,
            market="1X2",
        )
    ]


@router.post("/ou25", response_model=list[PredictionResponse])
async def predict_ou25(request: PredictionRequest):
    # TODO: Load models and run inference
    return [
        PredictionResponse(
            fixture_id=request.fixture_id,
            market="OU25",
        )
    ]


@router.post("/btts", response_model=list[PredictionResponse])
async def predict_btts(request: PredictionRequest):
    # TODO: Load models and run inference
    return [
        PredictionResponse(
            fixture_id=request.fixture_id,
            market="BTTS",
        )
    ]
