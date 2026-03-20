from pymongo import MongoClient

# MongoDB 
client = MongoClient("mongodb://localhost:27017/")

# Database name
db = client["talent_db"]

# Collection name
users = db["users"]