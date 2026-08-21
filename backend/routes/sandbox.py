from fastapi import APIRouter
from pydantic import BaseModel
from services.sandbox_service import run_sandbox

router = APIRouter(prefix="/api/sandbox", tags=["sandbox"])

class SandboxRequest(BaseModel):
    input_text: str

@router.post("/{model_id}/run")
def sandbox_run(model_id: str, body: SandboxRequest):
    return run_sandbox(model_id, body.input_text)
