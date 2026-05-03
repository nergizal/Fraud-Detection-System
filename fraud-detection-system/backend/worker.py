import json
import pika
import time
import sys
from datetime import datetime
from app.database import transactions_collection, anomalies_collection
from app.utils import check_fraud_rules 

def callback(ch, method, properties, body):
    print(f"Message received, processing.")
    sys.stdout.flush()
    
    try:
        data = json.loads(body)
        
        is_fraud, reasons = check_fraud_rules(data)
        status = "FRAUD" if is_fraud else "OK"
        
        location_data = data.get("location")
        if isinstance(location_data, dict):
            location_str = f"{location_data.get('lat', 0)},{location_data.get('lon', 0)}"
        else:
            location_str = str(location_data)

        tx_record = {
            "user_id": data.get("user_id"),
            "amount": data.get("amount"),
            "location": location_str,
            "timestamp": datetime.utcnow(),
            "status": status
        }
        
        result = transactions_collection.insert_one(tx_record)
        tx_id = str(result.inserted_id)
        
        if status == "FRAUD":
            anomaly_record = {
                "transaction_id": tx_id,
                "user_id": data.get("user_id"),
                "reason": ", ".join(reasons),
                "timestamp": datetime.utcnow()
            }
            anomalies_collection.insert_one(anomaly_record)
            
        print(f"Processed: User {data.get('user_id')} -> {status}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f" Processing error: {e}")
    finally:
        sys.stdout.flush()

def start_worker():
    while True:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', heartbeat=600))
            channel = connection.channel()
            channel.queue_declare(queue='transactions', durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(
                queue='transactions', 
                on_message_callback=callback,
                auto_ack=False
            )
            
            print(" Worker ACTIVE! Waiting for messages...")
            sys.stdout.flush()
            channel.start_consuming()
        except Exception as e:
            print(f" Connection error: {e}. Retrying...")
            time.sleep(5)
            sys.stdout.flush()

if __name__ == "__main__":
    print("MONGO CONNECTED ")
    sys.stdout.flush()
    start_worker()