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
# 🆕 👤 USER STRUCTURE (UPDATED WITH ROLE)
# ===========================
"""
{
    "name": "Siva",
    "email": "siva@gmail.com",
    "password": "hashed_password",

    "role": "admin",   # 🔥 NEW (admin / employee)

    "created_at": datetime.now()
}
"""


# ===========================
# 🧠 TASK STRUCTURE (REFERENCE)
# ===========================
"""
{
    "title": "Complete Project",
    "description": "Finish the frontend UI",
    
    "assigned_to": "employee@gmail.com",
    "assigned_by": "admin@gmail.com",
    
    "status": "pending",
    
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


# ===========================
# 🆕 HELPER FUNCTIONS (VERY IMPORTANT)
# ===========================

# 🔹 CREATE USER WITH ROLE
def create_user(name, email, password, role="employee"):
    return users.insert_one({
        "name": name,
        "email": email,
        "password": password,
        "role": role,  # 🔥 ROLE ADDED
        "created_at": datetime.now()
    })


# 🔹 GET USER BY EMAIL
def get_user_by_email(email):
    return users.find_one({"email": email})


# 🔹 UPDATE OLD USERS (ADD ROLE DEFAULT)
def add_role_to_existing_users():
    users.update_many(
        {"role": {"$exists": False}},
        {"$set": {"role": "employee"}}
    )


# 🔹 CREATE TASK
def create_task(task_data):
    task_data["created_at"] = datetime.now()
    task_data["completed_at"] = None
    task_data["status"] = "pending"
    return tasks.insert_one(task_data)


# 🔹 MARK TASK COMPLETED
def complete_task(task_id):
    return tasks.update_one(
        {"_id": task_id},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.now()
            }
        }
    )


# 🔹 CREATE NOTIFICATION
def create_notification(user_email, message, task_title):
    return notifications.insert_one({
        "user_email": user_email,
        "message": message,
        "task_title": task_title,
        "created_at": datetime.now(),
        "read": False
    })


# 🔹 GET USER NOTIFICATIONS
def get_notifications(user_email):
    return list(notifications.find({"user_email": user_email}))