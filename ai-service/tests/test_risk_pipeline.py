from app.pipelines.elevator_feature_pipeline import build_feature_vector
from app.services.model_registry import current_model_metadata
from app.services.predictive_maintenance_service import PredictiveMaintenanceService


def test_risk_pipeline_scores_high_risk():
    vector = build_feature_vector(temperature=80, vibration=0.9, usage=120)
    service = PredictiveMaintenanceService()
    result = service.score(
        temperature=vector.temperature, vibration=vector.vibration, usage=vector.usage
    )
    assert result["riskLevel"] == "high"


def test_risk_pipeline_prepares_traceable_warning(curated_high_risk_payload):
    payload = curated_high_risk_payload
    service = PredictiveMaintenanceService()

    result = service.score(
        elevator_id=payload["elevator_id"],
        temperature=payload["temperature"],
        vibration=payload["vibration"],
        usage=payload["usage"],
        validation_run_id="validation-001",
    )

    assert result["riskWarningId"] == "validation-001:E1"
    assert result["elevatorId"] == "E1"
    assert result["riskLevel"] == "high"
    assert result["modelVersion"] == current_model_metadata()["version"]
    assert result["validationRunId"] == "validation-001"
    assert result["modelTrace"]["featureSet"] == "elevator-phase2-risk"
    assert result["modelTrace"]["validationStatus"] == "passed"
