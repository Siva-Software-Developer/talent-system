from pymongo import MongoClient
from datetime import datetime

# ===========================
# 🔗 CONNECT TO MONGODB
# ===========================
client = MongoClient("mongodb://localhost:27017/")

# ===========================
# 📂 DATABASE
# ===========================
db = client["talent_db"]

# ===========================
# 👤 USERS COLLECTION
# ===========================
users = db["users"]

# ===========================
# 📋 TASKS COLLECTION (NEW)
# ===========================
tasks = db["tasks"]

# ===========================
# 🔔 NOTIFICATIONS COLLECTION (NEW)
# ===========================
notifications = db["notifications"]


# ===========================
# 🧠 TASK STRUCTURE (REFERENCE)
# ===========================
"""
{
    "title": "Complete Project",
    "description": "Finish the frontend UI",
    
    "assigned_to": "employee@gmail.com",   # 👤 who will do
    "assigned_by": "admin@gmail.com",      # 👨‍💼 who assigned
    
    "status": "pending",                   # pending / completed
    
    "created_at": datetime.now(),
    "completed_at": None
}
"""


# ===========================
# 🔔 NOTIFICATION STRUCTURE
# ===========================
"""
{
    "user_email": "employee@gmail.com",
    "message": "New task assigned by Admin",
    "task_title": "Complete Project",
    
    "created_at": datetime.now(),
    "read": False
}
"""