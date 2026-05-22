from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Reminder, Task, User
from app.schemas.reminder import ReminderCreate, ReminderResponse
from app.api.routes.auth import get_current_user
from typing import List

router = APIRouter(prefix="/reminders", tags=["reminders"])

@router.post("/", response_model=ReminderResponse, status_code=201)
def create_reminder(data: ReminderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == data.task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    reminder = Reminder(task_id=data.task_id, reminder_time=data.reminder_time)
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder

@router.get("/", response_model=List[ReminderResponse])
def get_reminders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Reminder).join(Task).filter(Task.user_id == current_user.id).all()
