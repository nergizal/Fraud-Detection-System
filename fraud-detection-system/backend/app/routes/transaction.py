from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
import pika
import json
from datetime import datetime
from app.database import transactions_collection, anomalies_collection
from sse_starlette.sse import EventSourceResponse
import asyncio

router = APIRouter()

class TransactionCreate(BaseModel):
    user_id: int
    amount: float
    location: Dict[str, Any]
    timestamp: str = None
    status: str = "OK"


@router.get("/stream-alerts")
async def stream_alerts():
    async def event_generator():
        while True:
            await asyncio.sleep(3)
            try:
                frauds = list(anomalies_collection.find().sort("timestamp", -1).limit(5))
                for f in frauds:
                    f["_id"] = str(f["_id"])
                
                if frauds:
                    for f in frauds:
                        yield {
                            "event": "fraud_alert",
                            "data": json.dumps({
                                "message": f"Suspicious transaction: {f.get('reason')}",
                                "user_id": f.get('user_id'),
                                "amount": 0.0,
                                "timestamp": datetime.utcnow().strftime('%H:%M')
                            })
                        }
                else:
                    yield {
                        "event": "ping",
                        "data": json.dumps({"message": "alive"})
                    }
            except Exception:
                await asyncio.sleep(3)
            
    return EventSourceResponse(event_generator())


@router.post("/")
def create_transaction(data: TransactionCreate):
    try:
        parameters = pika.ConnectionParameters(host='rabbitmq', port=5672, heartbeat=600)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue='transactions', durable=True)

        payload = data.dict()
        channel.basic_publish(
            exchange='',
            routing_key='transactions',
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
        return {"message": "Transaction placed in queue."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transactions")
def get_recent_transactions():
    transactions = list(transactions_collection.find().sort("timestamp", -1).limit(20))
    for t in transactions:
        t["_id"] = str(t["_id"])
    return transactions


@router.get("/user-status/{user_id}")
def get_user_status(user_id: int):
    txs = list(transactions_collection.find({"user_id": user_id}).sort("timestamp", -1))
    for t in txs:
        t["_id"] = str(t["_id"])
        
    fraud_count = len([t for t in txs if t.get("status") == "FRAUD"])
    
    return {
        "user_id": user_id,
        "total_transactions": len(txs),
        "fraud_count": fraud_count,
        "transactions": txs
    }


@router.get("/frauds/recent")
def get_recent_frauds():
    frauds = list(anomalies_collection.find().sort("timestamp", -1).limit(20))
    for f in frauds:
        f["_id"] = str(f["_id"])
    return frauds


@router.get("/mcp/frauds")
def mcp_get_recent_frauds():
    return get_recent_frauds()


@router.get("/mcp/user/{user_id}")
def mcp_get_user_status(user_id: int):
    return get_user_status(user_id)