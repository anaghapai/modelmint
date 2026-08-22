from sqlmodel import Session, select
from database import engine, ModelListingDB

def search_models(query: str, top_k: int = 6):
    with Session(engine) as session:
        listings = session.exec(select(ModelListingDB)).all()

    if not listings or not query.strip():
        return []

    query_terms = [t for t in query.lower().split() if len(t) > 2]
    scored = []

    for m in listings:
        haystack = f"{m.name} {m.description} {m.task_type}".lower()
        score = 0
        for term in query_terms:
            root = term[:max(4, len(term) - 2)]
            if root in haystack:
                score += 1
        if score > 0:
            scored.append((score, m))

    scored.sort(key=lambda x: x[0], reverse=True)

    results = []
    for score, listing in scored[:top_k]:
        results.append({
            "id": listing.id,
            "name": listing.name,
            "task_type": listing.task_type,
            "description": listing.description,
            "score": score
        })
    return results
