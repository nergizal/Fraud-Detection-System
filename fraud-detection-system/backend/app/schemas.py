from pydantic import BaseModel
from typing import Dict, Any

class Location(BaseModel):
    lat: float
    lon: float

class TransactionCreate(BaseModel):
    user_id: int
    amount: float
    location: Dict[str, Any] 
    timestamp: str = None
    status: str = "OK"

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    status: str

    class Config:
        from_attributes = True