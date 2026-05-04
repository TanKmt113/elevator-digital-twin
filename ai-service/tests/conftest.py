from pathlib import Path
import sys
from typing import Any

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@pytest.fixture
def curated_high_risk_payload() -> dict[str, Any]:
    return {
        "elevator_id": "E1",
        "temperature": 82.0,
        "vibration": 0.91,
        "usage": 128.0,
    }
