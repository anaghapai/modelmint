from sqlmodel import SQLModel, Field, create_engine, Session

class ModelListingDB(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    task_type: str
    hf_endpoint: str
    description: str
    price_tier: str

engine = create_engine("sqlite:///modelmint.db")

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
