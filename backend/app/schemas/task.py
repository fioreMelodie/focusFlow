from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.tag import TagResponse

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = "pendiente"
    tag_ids: Optional[List[int]] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    tag_ids: Optional[List[int]] = None

class TaskStatusUpdate(BaseModel):
    status: str

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    status: str
    user_id: int
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True
