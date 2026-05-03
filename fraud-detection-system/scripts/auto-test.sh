#!/bin/bash

DURATION=10
RATE=1
ANOMALY_CHANCE=10

for i in "$@"; do
    case $i in
        --duration=*)
        DURATION="${i#*=}"
        shift
        ;;
        --rate=*)
        RATE="${i#*=}"
        shift
        ;;
        --anomaly-chance=*)
        ANOMALY_CHANCE="${i#*=}"
        shift
        ;;
    esac
done

echo "Simulation started. Duration: ${DURATION}s, Rate: ${RATE} req/sec, Anomaly Chance: ${ANOMALY_CHANCE}%"

python3 -c "
import requests
import time
import random

start_time = time.time()
duration = $DURATION
rate = $RATE
anomaly_chance = $ANOMALY_CHANCE

while time.time() - start_time < duration:
    user_id = random.randint(1, 10)
    is_anomaly = random.random() < (anomaly_chance / 100)
    
    if is_anomaly:
        amount = random.uniform(1000.0, 6000.0)
        lat, lon = 36.8841, 30.7056
    else:
        amount = random.uniform(50.0, 500.0)
        lat, lon = 41.0082, 28.9784
        
    payload = {
        'user_id': user_id,
        'amount': amount,
        'location': {'lat': lat, 'lon': lon}
    }
    
    try:
        requests.post('http://localhost:8000/', json=payload)
    except:
        pass
        
    if rate > 0:
        time.sleep(1 / rate)
    else:
        time.sleep(1)
"