import math
from datetime import datetime, timedelta
from .redis_client import redis_client
from .database import transactions_collection 

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371 
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def check_fraud_rules(data): 
    user_id = data.get("user_id")
    amount = float(data.get("amount", 0))
    current_loc = data.get("location")
    reasons = []
    violation_count = 0

    redis_key = f"tx_count:{user_id}"
    tx_count = redis_client.incr(redis_key)
    if tx_count == 1:
        redis_client.expire(redis_key, 60)
    
    if tx_count > 5:
        violation_count += 1
        reasons.append("Velocity Violation (1 min > 5 transactions)")

    yesterday = datetime.utcnow() - timedelta(hours=24)
    
    cursor = transactions_collection.find(
        {"user_id": user_id, "timestamp": {"$gte": yesterday}}
    )
    amounts = [tx.get("amount") for tx in cursor]
    
    if amounts:
        mean = sum(amounts) / len(amounts)
        if amount > (mean * 3):
            violation_count += 1
            reasons.append(f"Amount Violation (3 times the average: {amount} > {mean*3:.2f})")

    last_tx = transactions_collection.find_one(
        {"user_id": user_id},
        sort=[("timestamp", -1)] 
    )
    
    if last_tx and last_tx.get("location"):
        try:
            loc_str = last_tx.get("location")
            if isinstance(loc_str, str) and "," in loc_str:
                old_lat_str, old_lon_str = loc_str.split(',')
                old_lat, old_lon = float(old_lat_str), float(old_lon_str)
            else:
                old_lat, old_lon = 0.0, 0.0
                
            dist = calculate_distance(old_lat, old_lon, current_loc['lat'], current_loc['lon'])
            time_diff = (datetime.utcnow() - last_tx.get("timestamp")).total_seconds() / 60 
            
            if time_diff > 0 and (dist / (time_diff / 60)) > 500:
                violation_count += 1
                reasons.append(f"Location Violation (Impossible speed: {dist:.1f}km / {time_diff:.1f}min)")
        except: 
            pass

    return violation_count >= 2, reasons