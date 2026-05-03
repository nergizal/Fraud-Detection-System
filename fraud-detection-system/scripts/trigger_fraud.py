import requests
import time

BASE_URL = "http://localhost:8000"

def test_fraud_trigger():
    print("Step 1: Recording historical transaction (Normal condition)")
    payload_normal = {
        "user_id": 777,
        "amount": 100.0,
        "location": {"lat": 41.0082, "lon": 28.9784}
    }
    r = requests.post(f"{BASE_URL}/", json=payload_normal)
    print(f"   Result: {r.status_code} - {r.text}")
    
    print("\nWaiting for the worker to process (3 seconds)")
    time.sleep(3)
    
    print("\nStep 2: Sending suspicious transaction (Fraud)")
    payload_fraud = {
        "user_id": 777,
        "amount": 5000.0,
        "location": {"lat": 36.8841, "lon": 30.7056}
    }
    r_fraud = requests.post(f"{BASE_URL}/", json=payload_fraud)
    print(f"   Result: {r_fraud.status_code} - {r_fraud.text}")
    
    print("\nWaiting 3 seconds for anomaly processing")
    time.sleep(3)
    
    print("\nStep 3: Checking recent frauds...")
    try:
        r_frauds = requests.get(f"{BASE_URL}/frauds/recent")
        frauds = r_frauds.json()
        print(f"   Found {len(frauds)} recent fraud records.")
        if frauds:
            print(f"   Latest reason: {frauds[0]['reason']}")
    except Exception as e:
        print("   Failed to fetch anomalies:", e)

if __name__ == "__main__":
    test_fraud_trigger()