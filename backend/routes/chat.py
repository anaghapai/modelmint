from fastapi import APIRouter
from pydantic import BaseModel
from services.groq_client import call_groq

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

SYSTEM_CONTEXT = """You are the ModelMint assistant. ModelMint is an AI model marketplace where a multi-persona AI panel (Accuracy, Safety, Reliability) evaluates Hugging Face models with real test calls, producing a Trust Score. Help users understand models, trust scores, and how to use the platform. Keep answers short and helpful."""

@router.post("")
def chat(req: ChatRequest):
    history_text = "\n".join([f"{h['role']}: {h['content']}" for h in req.history[-6:]])
    prompt = f"{SYSTEM_CONTEXT}\n\nConversation so far:\n{history_text}\n\nUser: {req.message}\n\nReply in plain text, no JSON, no markdown formatting, 2-3 sentences max."
    result = call_groq(prompt, expect_json=False)
    reply = result.get("text") or "Sorry, I could not generate a response right now."
    return {"reply": reply}
