from pydantic import BaseModel

class TagCreate(BaseModel):
    name: str
    color: str

class TagResponse(BaseModel):
    id: int
    name: str
    color: str

    class Config:
        from_attributes = True
