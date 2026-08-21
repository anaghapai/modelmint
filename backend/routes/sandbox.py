from fastapi import APIRouter, Depends, HTTPException, Header, Request
from pydantic import BaseModel
from services.sandbox_service import run_sandbox
from services.auth_service import decode_access_token
from limiter_instance import limiter

router = APIRouter(prefix="/api/sandbox", tags=["sandbox"])

class SandboxRequest(BaseModel):
    input_text: str

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing or invalid token")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="invalid or expired token")
    return payload["sub"]

@router.post("/{model_id}/run")
@limiter.limit("10/minute")
def sandbox_run(request: Request, model_id: str, body: SandboxRequest, user: str = Depends(get_current_user)):
    return run_sandbox(model_id, body.input_text)