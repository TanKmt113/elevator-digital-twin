from app.pipelines.elevator_feature_pipeline import build_feature_vector
from app.services.predictive_maintenance_service import PredictiveMaintenanceService


def test_risk_pipeline_scores_high_risk():
    vector = build_feature_vector(temperature=80, vibration=0.9, usage=120)
    service = PredictiveMaintenanceService()
    result = service.score(
        temperature=vector.temperature, vibration=vector.vibration, usage=vector.usage
    )
    assert result["riskLevel"] == "high"
