import json
from sqlmodel import Session
from database import engine, init_db, ModelListingDB

def seed():
    init_db()
    with open("seed_data.json", "r") as f:
        models = json.load(f)

    with Session(engine) as session:
        for m in models:
            existing = session.get(ModelListingDB, m["id"])
            if existing:
                continue
            session.add(ModelListingDB(**m))
        session.commit()
    print(f"Seeded {len(models)} models.")

if __name__ == "__main__":
    seed()
