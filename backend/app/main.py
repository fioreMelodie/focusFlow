from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from app.db.database import engine
from app.models.models import Base
from app.api.routes.auth import router as auth_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.tags import router as tags_router
from app.api.routes.pomodoro import router as pomodoro_router
from app.api.routes.reminders import router as reminders_router
from app.api.routes.websocket import router as ws_router
from app.core.scheduler import start_scheduler

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    start_scheduler()
    yield

app = FastAPI(title="FocusFlow API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(tags_router)
app.include_router(pomodoro_router)
app.include_router(reminders_router)
app.include_router(ws_router)

@app.get("/")
def root():
    return {"message": "FocusFlow API corriendo"}

@app.get("/health")
def health():
    return {"status": "ok"}
