from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.rank import router as rank_router

app = FastAPI(title="Doctor Ranking MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)

app.include_router(rank_router, prefix="/v1", tags=["rank"])

@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
