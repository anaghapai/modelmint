from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import init_db
from routes import models, sandbox, auth, evaluate, chat
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from limiter_instance import limiter

app = FastAPI(title="ModelMint API", version="0.1.0")
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded, slow down"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://modelmint-xi.vercel.app",
        "https://modelmint-lef5uw4wi-a-5c04.vercel.app",
    ],
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    from seed import seed
    seed()

@app.get("/")
def root():
    return {"status": "ok", "service": "ModelMint API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(models.router)
app.include_router(sandbox.router)
app.include_router(auth.router)
app.include_router(evaluate.router)
app.include_router(chat.router)
