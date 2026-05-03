#!/bin/bash

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <user_id> <amount> <lat,lon>"
    exit 1
fi

USER_ID=$1
AMOUNT=$2
LOCATION=$3

LAT=$(echo $LOCATION | cut -d',' -f1)
LON=$(echo $LOCATION | cut -d',' -f2)

echo "Sending data: User $USER_ID, Amount: $AMOUNT, Location: ($LAT, $LON)"

curl -s -X POST http://localhost:8000/ \
     -H "Content-Type: application/json" \
     -d "{\"user_id\": $USER_ID, \"amount\": $AMOUNT, \"location\": {\"lat\": $LAT, \"lon\": $LON}}"

echo ""