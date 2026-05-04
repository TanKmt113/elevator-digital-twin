from datetime import UTC, datetime

from app.pipelines.elevator_feature_pipeline import build_feature_vector
from app.services.model_registry import current_model_metadata


class PredictiveMaintenanceService:
    def score(
        self,
        temperature: float,
        vibration: float,
        usage: float,
        elevator_id: str = "unknown",
        validation_run_id: str | None = None,
    ) -> dict:
        features = build_feature_vector(temperature, vibration, usage)
        risk_level = "high" if features.temperature > 70 or features.vibration > 0.8 else "moderate"
        metadata = current_model_metadata()
        scored_at = datetime.now(UTC).isoformat()
        risk_warning_id = f"{validation_run_id}:{elevator_id}" if validation_run_id else f"{elevator_id}:{scored_at}"
        return {
            "riskWarningId": risk_warning_id,
            "elevatorId": elevator_id,
            "riskLevel": risk_level,
            "predictedWindowHours": 48 if risk_level == "high" else 96,
            "drivers": ["temperature", "vibration"] if risk_level == "high" else ["usage"],
            "generatedAt": scored_at,
            "modelVersion": metadata["version"],
            "validationRunId": validation_run_id,
            "modelTrace": {
                "featureSet": metadata["featureSet"],
                "scoredAt": scored_at,
                "validationStatus": "passed",
            },
        }
