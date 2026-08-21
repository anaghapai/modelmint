import requests
import os
from sqlmodel import Session, select
from database import engine, ModelListingDB

HF_TOKEN = os.environ.get("HF_API_KEY")

def run_sandbox(model_id: str, input_text: str):
    with Session(engine) as session:
        listing = session.get(ModelListingDB, model_id)

    if not listing:
        return {"error": "model not found"}

    url = f"https://router.huggingface.co/hf-inference/models/{listing.hf_endpoint}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    response = requests.post(url, headers=headers, json={"inputs": input_text})
    response.raise_for_status()

    return {
        "model_id": model_id,
        "input": input_text,
        "output": response.json()
    }
