from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from database import engine, ModelListingDB
from services.hf_client import call_hf_model

router = APIRouter(prefix="/api/sandbox", tags=["sandbox"])

class SandboxRequest(BaseModel):
    input_text: str

@router.post("/{model_id}/run")
def run_sandbox(model_id: str, req: SandboxRequest):
    with Session(engine) as session:
        listing = session.get(ModelListingDB, model_id)

    if not listing:
        raise HTTPException(status_code=404, detail="Model not found")

    result = call_hf_model(listing.hf_endpoint, {"inputs": req.input_text})

    if not result["success"]:
        raise HTTPException(status_code=502, detail=f"HF call failed: {result["error"]}")

    return {"model_id": model_id, "input": req.input_text, "output": result["data"]}
