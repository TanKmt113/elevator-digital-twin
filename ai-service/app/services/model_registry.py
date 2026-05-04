from typing import Any


def current_model_metadata() -> dict[str, Any]:
    return {
        "version": "model-v1",
        "featureSet": "elevator-phase2-risk",
    }


def current_model_version() -> str:
    return current_model_metadata()["version"]
