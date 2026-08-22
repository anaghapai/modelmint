from fastapi import APIRouter, Query, HTTPException
from sqlmodel import Session
from database import engine, ModelListingDB
from services.search_service import search_models
from services.groq_client import get_recommendation

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    results = search_models(q)
    return {"query": q, "results": results}

@router.get("/recommend")
def recommend(q: str = Query(..., min_length=1)):
    results = search_models(q)
    recommendation = get_recommendation(q, results)
    return {"query": q, "results": results, "recommendation": recommendation}

@router.get("/{model_id}")
def get_model(model_id: str):
    with Session(engine) as session:
        listing = session.get(ModelListingDB, model_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Model not found")
    return listing
