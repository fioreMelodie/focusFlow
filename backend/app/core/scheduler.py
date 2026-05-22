from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
from app.db.database import SessionLocal
from app.models.models import Reminder, Task

scheduler = AsyncIOScheduler()
active_connections = {}

def register_connection(user_id: int, websocket):
    active_connections[user_id] = websocket

def remove_connection(user_id: int):
    active_connections.pop(user_id, None)

async def check_reminders():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        pending = db.query(Reminder).filter(
            Reminder.sent_status == False,
            Reminder.reminder_time <= now
        ).all()
        for reminder in pending:
            task = db.query(Task).filter(Task.id == reminder.task_id).first()
            if task and task.user_id in active_connections:
                ws = active_connections[task.user_id]
                try:
                    await ws.send_json({
                        "type": "reminder",
                        "task_id": task.id,
                        "title": task.title,
                        "message": f"Recordatorio: {task.title} vence pronto"
                    })
                except:
                    remove_connection(task.user_id)
            reminder.sent_status = True
            db.commit()
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(check_reminders, "interval", minutes=1)
    scheduler.start()
