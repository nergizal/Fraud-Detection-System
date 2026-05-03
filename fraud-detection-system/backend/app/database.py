import os
from pymongo import MongoClient


MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
client = MongoClient(MONGO_URL)


db = client["fraud_detection_db"]
transactions_collection = db["transactions"]
anomalies_collection = db["anomalies"]