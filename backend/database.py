from pymongo import MongoClient
from datetime import datetime

# ===========================
# 🔗 CONNECT TO MONGODB
# ===========================
# Machi, connection string-ah check panniko, localhost default 27017
client = MongoClient("mongodb://localhost:27017/")

# ===========================
# 📂 DATABASE
# ===========================
db = client["talent_db"]

# ===========================
# 📂 COLLECTIONS
# ===========================
users = db["users"]
tasks_db = db["tasks"] # Machi, app.py kooda sync aaga idhu tasks_db nu mathitaen
notifications = db["notifications"]

# ===========================
# 🆕 👤 USER STRUCTURE
# ===========================
"""
{
    "name": "Siva",
    "email": "siva@gmail.com",
    "password": "hashed_password",
    "role": "admin",             # (admin / employee)
    "job": "Full Stack Dev",     # Optional job profile
    "is_verified": True,         # For OTP verification
    "created_at": datetime.now()
}
"""

# ===========================
# 🧠 TASK STRUCTURE (ADVANCED)
# ===========================
"""
{
    "id": 123456789,             # Unique Integer ID (Timestamp based)
    "group_id": 987654,          # To identify multi-employee assignments
    "title": "Build UI",
    "description": "Clean Glass UI",
    
    "assigned_to": "emp@gmail.com",
    "assigned_by": "admin@gmail.com",
    
    "pdf_url": "filename.pdf",   # Path to the assigned PDF task
    "status": "pending",         # (pending / completed)
    
    "proof_link": None,          # Submitted by employee (Live link)
    "github_link": None,         # Submitted by employee (Code link)
    
    "created_at": "YYYY-MM-DD",
    "completed_at": None
}
"""

# ===========================
# 🆕 HELPER FUNCTIONS
# ===========================

# 🔹 CREATE USER
def create_user(name, email, password, role="employee", job=None):
    return users.insert_one({
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "job": job,
        "is_verified": False, # Default-ah false, OTP verify aana dhaan true
        "created_at": datetime.now()
    })

# 🔹 GET USER BY EMAIL
def get_user_by_email(email):
    return users.find_one({"email": email})

# 🔹 CREATE TASK (Advanced with ID and PDF)
def create_advanced_task(task_data):
    # Machi, indha fields ellam app.py-le irundhu accurate-ah varum
    if "status" not in task_data:
        task_data["status"] = "pending"
    if "created_at" not in task_data:
        task_data["created_at"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return tasks_db.insert_one(task_data)

# 🔹 UPDATE TASK STATUS (Employee Submission)
def update_task_completion(task_id, proof_link, github_link):
    return tasks_db.update_one(
        {"id": task_id},
        {
            "$set": {
                "status": "completed",
                "proof_link": proof_link,
                "github_link": github_link,
                "completed_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        }
    )

# 🔹 CREATE NOTIFICATION
def create_notification(user_email, message, task_id=None):
    return notifications.insert_one({
        "user_email": user_email,
        "message": message,
        "task_id": task_id,
        "created_at": datetime.now(),
        "read": False
    })

# 🔹 GET USER NOTIFICATIONS (Latest First)
def get_notifications(user_email):
    return list(notifications.find({"user_email": user_email}).sort("created_at", -1))

# 🔹 CLEANUP/MIGRATION: ADD ROLE TO OLD USERS
def fix_missing_roles():
    users.update_many(
        {"role": {"$exists": False}},
        {"$set": {"role": "employee"}}
    )

# ==========================================
# Machi, database logic ready! 
# Run panna idhu automatic-ah collections create pannidum.