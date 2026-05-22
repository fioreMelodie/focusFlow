from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import PomodoroSession, Task, User
from app.schemas.pomodoro import PomodoroCreate, PomodoroResponse
from app.api.routes.auth import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/pomodoro", tags=["pomodoro"])

@router.post("/sessions", response_model=PomodoroResponse, status_code=201)
def create_session(data: PomodoroCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == data.task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    session = PomodoroSession(
        task_id=data.task_id,
        start_time=data.start_time,
        duration=data.duration,
        completed=data.completed
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions", response_model=List[PomodoroResponse])
def get_sessions(task_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(PomodoroSession).join(Task).filter(Task.user_id == current_user.id)
    if task_id:
        query = query.filter(PomodoroSession.task_id == task_id)
    return query.all()
