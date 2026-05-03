from fastapi import FastAPI, Query
from datetime import datetime, timedelta
from app.database import transactions_collection, anomalies_collection

app = FastAPI(title="Fraud Detection MCP Server")

@app.get("/get_recent_frauds")
def get_recent_frauds(minutes: int = Query(default=60, description="Time window in minutes")):
    threshold = datetime.utcnow() - timedelta(minutes=minutes)
    
    frauds = list(anomalies_collection.find({"timestamp": {"$gte": threshold}}).sort("timestamp", -1))
    
    data = []
    for f in frauds:
        data.append({
            "user_id": f.get("user_id"),
            "reason": f.get("reason"),
            "at": f.get("timestamp").strftime('%H:%M') if f.get("timestamp") else ""
        })
        
    return {
        "fraud_count": len(data),
        "period": f"{minutes} min",
        "data": data
    }

@app.get("/check_user_status")
def check_user_status(user_id: int):
    txs = list(transactions_collection.find({"user_id": user_id}))
    f_count = len([t for t in txs if t.get("status") == "FRAUD"])
    
    return {
        "user_id": user_id,
        "risk_level": "HIGH" if f_count > 3 else "LOW",
        "total_fraud": f_count
    }