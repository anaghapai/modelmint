import time
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json
from sqlmodel import Session
from database import engine, ModelListingDB
from services.hf_client import call_hf_model
from services.persona_prompts import (
    run_accuracy_auditor,
    run_safety_checker,
    run_reliability_checker,
)

router = APIRouter()

def build_hf_call_data(hf_endpoint: str, test_cases: list[dict]):
    """Calls the real HF model for each test case, capturing latency and raw output."""
    timestamps = []
    outputs = []
    enriched_cases = []

    for case in test_cases:
        start = time.time()
        result = call_hf_model(hf_endpoint, {"inputs": case["input"]})
        elapsed = time.time() - start
        timestamps.append(elapsed)

        if result["success"]:
            outputs.append(result["data"])
            enriched_cases.append({
                "input": case["input"],
                "expected": case.get("expected", ""),
                "actual": result["data"],
            })
        else:
            outputs.append({"error": result["error"]})
            enriched_cases.append({
                "input": case["input"],
                "expected": case.get("expected", ""),
                "actual": f"ERROR: {result['error']}",
            })

    return enriched_cases, {"timestamps": timestamps, "outputs": outputs}

def run_adversarial_calls(hf_endpoint: str, adversarial_cases: list[dict]):
    """Calls the real HF model with adversarial inputs, capturing raw output."""
    enriched = []
    for case in adversarial_cases:
        result = call_hf_model(hf_endpoint, {"inputs": case["input"]})
        actual = result["data"] if result["success"] else f"ERROR: {result['error']}"
        enriched.append({"input": case["input"], "actual": actual})
    return enriched

def evaluate_stream(model_id: str, test_cases: list[dict], adversarial_cases: list[dict], hf_call_data: dict):
    try:
        accuracy_result = run_accuracy_auditor(test_cases)
        yield f"data: {json.dumps({'stage': 'accuracy', 'result': accuracy_result})}\n\n"
    except Exception as e:
        accuracy_result = {"score": 0, "error": str(e)}
        yield f"data: {json.dumps({'stage': 'accuracy', 'error': str(e)})}\n\n"
    try:
        safety_result = run_safety_checker(adversarial_cases)
        yield f"data: {json.dumps({'stage': 'safety', 'result': safety_result})}\n\n"
    except Exception as e:
        safety_result = {"score": 0, "error": str(e)}
        yield f"data: {json.dumps({'stage': 'safety', 'error': str(e)})}\n\n"
    try:
        reliability_result = run_reliability_checker(
            hf_call_data.get("timestamps", []),
            hf_call_data.get("outputs", [])
        )
        yield f"data: {json.dumps({'stage': 'reliability', 'result': reliability_result})}\n\n"
    except Exception as e:
        reliability_result = {"score": 0, "error": str(e)}
        yield f"data: {json.dumps({'stage': 'reliability', 'error': str(e)})}\n\n"
    trust_score = round(
        0.4 * accuracy_result.get("score", 0)
        + 0.3 * safety_result.get("score", 0)
        + 0.3 * reliability_result.get("score", 0),
        1
    )
    final = {
        "model_id": model_id,
        "accuracy": accuracy_result,
        "safety": safety_result,
        "reliability": reliability_result,
        "trust_score": trust_score,
    }
    yield f"data: {json.dumps({'stage': 'final', 'result': final})}\n\n"

@router.post("/api/models/{model_id:path}/evaluate")
async def evaluate_model(model_id: str):
    with Session(engine) as session:
        listing = session.get(ModelListingDB, model_id)

    if not listing:
        raise HTTPException(status_code=404, detail="Model not found")

    test_cases = listing.get_test_cases()
    adversarial_cases_raw = listing.get_adversarial_cases()

    if not test_cases:
        raise HTTPException(
            status_code=400,
            detail=f"No test cases available for '{model_id}' (likely a non-text model)"
        )

    enriched_test_cases, hf_call_data = build_hf_call_data(listing.hf_endpoint, test_cases)
    enriched_adversarial = run_adversarial_calls(listing.hf_endpoint, adversarial_cases_raw)

    return StreamingResponse(
        evaluate_stream(model_id, enriched_test_cases, enriched_adversarial, hf_call_data),
        media_type="text/event-stream"
    )
