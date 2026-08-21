from sentence_transformers import SentenceTransformer
import numpy as np
from sqlmodel import Session, select
from database import engine, ModelListingDB

_model = None

def get_embedder():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def search_models(query: str, top_k: int = 6):
    embedder = get_embedder()

    with Session(engine) as session:
        listings = session.exec(select(ModelListingDB)).all()

    if not listings:
        return []

    corpus = [f"{m.name}. {m.description}. Task: {m.task_type}" for m in listings]
    corpus_embeddings = embedder.encode(corpus)
    query_embedding = embedder.encode([query])[0]

    def cosine_sim(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)

    scored = [
        (listing, float(cosine_sim(query_embedding, emb)))
        for listing, emb in zip(listings, corpus_embeddings)
    ]
    scored.sort(key=lambda x: x[1], reverse=True)

    return [
        {
            "id": m.id,
            "name": m.name,
            "task_type": m.task_type,
            "description": m.description,
            "price_tier": m.price_tier,
            "relevance_score": round(score, 4),
        }
        for m, score in scored[:top_k]
    ]
