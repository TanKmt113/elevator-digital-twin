from dataclasses import dataclass


@dataclass
class ElevatorFeatureVector:
    temperature: float
    vibration: float
    usage: float


def build_feature_vector(temperature: float, vibration: float, usage: float) -> ElevatorFeatureVector:
    return ElevatorFeatureVector(temperature=temperature, vibration=vibration, usage=usage)
