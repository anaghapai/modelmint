from fastapi import FastAPI
from backend.routes import evaluate
# ...any other imports/routers you already have

app = FastAPI()

app.include_router(evaluate.router)
# ...any other app.include_router(...) lines you already havegit add backend\main.py backend\routes\evaluate.py