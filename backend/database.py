from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional

class ModelListingDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    task_type: str
    hf_endpoint: str
    description: str
    price_tier: str

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
