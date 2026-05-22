from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PomodoroCreate(BaseModel):
    task_id: int
    start_time: datetime
    duration: int
    completed: bool = False

class PomodoroResponse(BaseModel):
    id: int
    task_id: int
    start_time: datetime
    duration: int
    completed: bool

    class Config:
        from_attributes = True
