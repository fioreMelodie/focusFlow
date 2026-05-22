from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.db.database import engine
from app.models.models import Base
from app.api.routes.auth import router as auth_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.tags import router as tags_router

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FocusFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:80", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(tags_router)

@app.get("/")
def root():
    return {"message": "FocusFlow API corriendo"}

@app.get("/health")
def health():
    return {"status": "ok"}
