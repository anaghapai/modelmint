import json
from sqlmodel import Session
from database import engine, init_db, ModelListingDB

def seed():
    init_db()
    with open("seed_data.json", "r", encoding="utf-8-sig") as f:
        models = json.load(f)

    with Session(engine) as session:
        for m in models:
            existing = session.get(ModelListingDB, m["id"])
            if existing:
                session.delete(existing)
                session.commit()
            listing = ModelListingDB(
                id=m["id"],
                name=m["name"],
                task_type=m["task_type"],
                hf_endpoint=m["hf_endpoint"],
                description=m["description"],
                price_tier=m["price_tier"],
                test_cases_json=json.dumps(m.get("test_cases", [])),
                adversarial_cases_json=json.dumps(m.get("adversarial_cases", [])),
            )
            session.add(listing)
        session.commit()
    print(f"Seeded {len(models)} models.")

if __name__ == "__main__":
    seed()

