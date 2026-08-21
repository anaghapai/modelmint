from pydantic import BaseModel

class ModelListing(BaseModel):
    id: str
    name: str
    task_type: str
    hf_endpoint: str
    description: str
    price_tier: str

class PersonaResult(BaseModel):
    persona_name: str
    score: float
    rationale: str
    flags: list[str] = []

class TrustEvaluation(BaseModel):
    model_id: str
    accuracy: PersonaResult
    safety: PersonaResult
    reliability: PersonaResult
    trust_score: float