from fastapi import APIRouter, Query
from services.search_service import search_models

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    results = search_models(q)
    return {"query": q, "results": results}
