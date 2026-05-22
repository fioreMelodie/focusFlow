from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

class TaskStatus(str, enum.Enum):
    pendiente = "pendiente"
    en_progreso = "en progreso"
    completada = "completada"

task_tag = Table(
    "task_tag",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    tasks = relationship("Task", back_populates="owner")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    due_date = Column(DateTime)
    status = Column(Enum(TaskStatus), default=TaskStatus.pendiente)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")
    tags = relationship("Tag", secondary=task_tag, back_populates="tasks")
    pomodoro_sessions = relationship("PomodoroSession", back_populates="task")
    reminders = relationship("Reminder", back_populates="task")

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, nullable=False)
    tasks = relationship("Task", secondary=task_tag, back_populates="tags")

class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    start_time = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    task = relationship("Task", back_populates="pomodoro_sessions")

class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    reminder_time = Column(DateTime, nullable=False)
    sent_status = Column(Boolean, default=False)
    task = relationship("Task", back_populates="reminders")
