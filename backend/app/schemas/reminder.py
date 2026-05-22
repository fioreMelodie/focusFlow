from pydantic import BaseModel
from datetime import datetime

class ReminderCreate(BaseModel):
    task_id: int
    reminder_time: datetime

class ReminderResponse(BaseModel):
    id: int
    task_id: int
    reminder_time: datetime
    sent_status: bool

    class Config:
        from_attributes = True
