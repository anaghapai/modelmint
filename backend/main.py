from fastapi import FastAPI
from backend.routes import evaluate

app = FastAPI()

app.include_router(evaluate.router)
