from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from database import engine, UserDB
from services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

class AuthRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(body: AuthRequest):
    with Session(engine) as session:
        existing = session.exec(select(UserDB).where(UserDB.email == body.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="email already registered")

        user = UserDB(email=body.email, hashed_password=hash_password(body.password))
        session.add(user)
        session.commit()
        session.refresh(user)

    token = create_access_token({"sub": body.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
def login(body: AuthRequest):
    with Session(engine) as session:
        user = session.exec(select(UserDB).where(UserDB.email == body.email)).first()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="invalid email or password")

    token = create_access_token({"sub": body.email})
    return {"access_token": token, "token_type": "bearer"}
