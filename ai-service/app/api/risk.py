from fastapi import APIRouter

from app.services.predictive_maintenance_service import PredictiveMaintenanceService

router = APIRouter(prefix="/risk", tags=["risk"])
service = PredictiveMaintenanceService()


@router.get("")
def get_risk_prediction(temperature: float, vibration: float, usage: float) -> dict:
    return service.score(temperature=temperature, vibration=vibration, usage=usage)
