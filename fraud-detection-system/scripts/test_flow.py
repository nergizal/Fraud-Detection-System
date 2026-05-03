import requests
import time

BASE_URL = "http://localhost:8000"

def test_flow():
    print("Step 1: Checking API and service status")
    try:
        r = requests.get(f"{BASE_URL}/")
        print("   API Connection Successful:", r.json())
    except Exception as e:
        print("   Could not reach the API. Make sure the server is running:", e)
        return

    print("\nStep 2: Sending normal transaction to the system")
    payload = {
        "user_id": 999,
        "amount": 200.0,
        "location": {"lat": 41.0082, "lon": 28.9784}
    }
    r = requests.post(f"{BASE_URL}/", json=payload)
    print(f"   Result: {r.status_code} - {r.text}")
    
    print("\nWaiting for the worker to process (3 seconds)")
    time.sleep(3)

    print("\nStep 3: Checking database (MongoDB)...")
    try:
        r_recent = requests.get(f"{BASE_URL}/transactions")
        transactions = r_recent.json()
        print(f"   Found {len(transactions)} records in the last 20 transactions.")
        if transactions:
            print(f"   Last user: {transactions[0]['user_id']} - Status: {transactions[0]['status']}")
    except Exception as e:
        print("   Failed to fetch transactions:", e)

if __name__ == "__main__":
    test_flow()