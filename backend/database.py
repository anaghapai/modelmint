from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional
import json

class ModelListingDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    task_type: str
    hf_endpoint: str
    description: str
    price_tier: str
    test_cases_json: str = Field(default="[]")
    adversarial_cases_json: str = Field(default="[]")

    def get_test_cases(self):
        return json.loads(self.test_cases_json)

    def get_adversarial_cases(self):
        return json.loads(self.adversarial_cases_json)

class UserDB(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str

engine = create_engine("sqlite:///modelmint.db")

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
