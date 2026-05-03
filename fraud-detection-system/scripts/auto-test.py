import requests
import random
import time
import argparse

def run_test(duration, rate, anomaly_chance):
    start_time = time.time()
    print(f"Test started: running for {duration} seconds at {rate} requests/sec")
    
    url = "http://127.0.0.1:8000/"
    user_pool = list(range(1, 20))
    
    while time.time() - start_time < duration:
        is_anomaly = random.random() < (anomaly_chance / 100)
        user_id = random.choice(user_pool)
        
        if is_anomaly:
            amount = random.uniform(5000, 10000)
        else:
            amount = random.uniform(10, 500)
            
        payload = {
            "user_id": user_id,
            "amount": amount,
            "location": {
                "lat": random.uniform(36, 42),
                "lon": random.uniform(26, 45)
            },
            "status": "OK"
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                print(f"User {payload['user_id']} -> Success (Amount: {payload['amount']:.1f})")
            else:
                print(f"Server error: {response.status_code}")
        except Exception as e:
            print(f"Error detail: {e}")
            
        if rate > 0:
            time.sleep(1 / rate)
        else:
            time.sleep(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--duration", type=int, default=30, help="Test duration in seconds")
    parser.add_argument("--rate", type=int, default=2, help="Requests per second")
    parser.add_argument("--anomaly-chance", type=float, default=10.0, help="Anomaly generation chance in percent")
    args = parser.parse_args()
    
    run_test(args.duration, args.rate, args.anomaly_chance)