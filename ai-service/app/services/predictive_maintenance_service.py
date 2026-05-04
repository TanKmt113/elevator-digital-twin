from app.pipelines.elevator_feature_pipeline import build_feature_vector


class PredictiveMaintenanceService:
    def score(self, temperature: float, vibration: float, usage: float) -> dict:
        features = build_feature_vector(temperature, vibration, usage)
        risk_level = "high" if features.temperature > 70 or features.vibration > 0.8 else "moderate"
        return {
            "riskLevel": risk_level,
            "predictedWindowHours": 48 if risk_level == "high" else 96,
            "drivers": ["temperature", "vibration"] if risk_level == "high" else ["usage"],
        }
