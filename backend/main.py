from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes import models, sandbox

app = FastAPI(title="ModelMint API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"status": "ok", "service": "ModelMint API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(models.router)
app.include_router(sandbox.router)
