from fastapi import APIRouter

from app.services.predictive_maintenance_service import PredictiveMaintenanceService

router = APIRouter(prefix="/risk", tags=["risk"])
service = PredictiveMaintenanceService()


@router.get("")
def get_risk_prediction(
    temperature: float,
    vibration: float,
    usage: float,
    elevator_id: str = "unknown",
    validation_run_id: str | None = None,
) -> dict:
    return service.score(
        temperature=temperature,
        vibration=vibration,
        usage=usage,
        elevator_id=elevator_id,
        validation_run_id=validation_run_id,
    )
