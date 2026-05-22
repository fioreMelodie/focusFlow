from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.scheduler import register_connection, remove_connection

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    register_connection(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        remove_connection(user_id)
