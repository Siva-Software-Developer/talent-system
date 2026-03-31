from pymongo import MongoClient
from datetime import datetime
import time

# ===========================
# 🔗 CONNECT TO MONGODB
# ===========================
client = MongoClient("mongodb://localhost:27017/")

# ===========================
# 📂 DATABASE
# ===========================
db = client["talent_db"]

# ===========================
# 📂 COLLECTIONS (EXISTING + NEW 🔥)
# ===========================
users = db["users"]
tasks_db = db["tasks"]
notifications = db["notifications"]
sod_db = db["sod"]              # 🆕 SOD Collection
eod_db = db["eod"]              # 🆕 EOD Collection
messages_db = db["messages"]    # 🆕 Chat Collection
help_tickets = db["help_tickets"] # 🆕 Support Collection

# ===========================
# 🆕 👤 USER STRUCTURE
# ===========================
"""
{
    "name": "Siva",
    "email": "siva@gmail.com",
    "password": "hashed_password",
    "role": "admin",
    "job": "Full Stack Dev",
    "is_verified": True,
    "created_at": datetime.now()
}
"""

# ===========================
# 🧠 TASK STRUCTURE (UPDATED 🔥)
# ===========================
"""
{
    "id": 123456789,
    "group_id": 987654,
    "title": "Build UI",
    "description": "Clean Glass UI",
    "assigned_to": "emp@gmail.com",
    "assigned_by": "admin@gmail.com",
    "pdf_url": "filename.pdf",
    "status": "pending",            # pending / in_progress / completed / blocked
    "progress": 0,                  # 🔥 NEW
    "daily_updates": [],            # 🔥 NEW
    "dueDate": "YYYY-MM-DD",        # 🔥 NEW
    "blocker": None,                # 🔥 NEW
    "blocker_reported_at": None,    # 🔥 NEW
    "proof_link": None,
    "github_link": None,
    "created_at": "YYYY-MM-DD",
    "completed_at": None
}
"""

# ===========================
# 🔥 HELPER: OVERDUE CHECK
# ===========================
def is_overdue(task):
    try:
        if task.get("dueDate") and task.get("status") != "completed":
            due_time = time.mktime(time.strptime(task["dueDate"], "%Y-%m-%d"))
            return time.time() > due_time
    except:
        return False
    return False


# ===========================
# 🆕 USER & AUTH HELPERS
# ===========================

def create_user(name, email, password, role="employee", job=None):
    return users.insert_one({
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "job": job,
        "is_verified": False,
        "created_at": datetime.now()
    })

def get_user_by_email(email):
    return users.find_one({"email": email})


# ===========================
# 🛠️ TASK HELPERS (UPDATED)
# ===========================

def create_advanced_task(task_data):
    if "status" not in task_data:
        task_data["status"] = "pending"

    task_data.setdefault("progress", 0)
    task_data.setdefault("daily_updates", [])
    task_data.setdefault("blocker", None)
    task_data.setdefault("blocker_reported_at", None)

    if "created_at" not in task_data:
        task_data["created_at"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    return tasks_db.insert_one(task_data)

def update_task_completion(task_id, proof_link, github_link):
    return tasks_db.update_one(
        {"id": task_id},
        {
            "$set": {
                "status": "completed",
                "progress": 100,
                "proof_link": proof_link,
                "github_link": github_link,
                "completed_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        }
    )

def update_task_progress(task_id, progress, update_text):
    task = tasks_db.find_one({"id": task_id})
    if not task: return False

    if task.get("blocker"):
        status = "blocked"
    elif progress == 0:
        status = "pending"
    elif progress < 100:
        status = "in_progress"
    else:
        status = "completed"

    return tasks_db.update_one(
        {"id": task_id},
        {
            "$set": {"progress": progress, "status": status},
            "$push": {
                "daily_updates": {
                    "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    "update": update_text,
                    "progress": progress
                }
            }
        }
    )

def report_blocker(task_id, blocker_msg):
    return tasks_db.update_one(
        {"id": task_id},
        {
            "$set": {
                "blocker": blocker_msg,
                "blocker_reported_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "status": "blocked"
            }
        }
    )

def get_filtered_tasks(status=None, assigned_to=None):
    query = {}
    if status: query["status"] = status
    if assigned_to: query["assigned_to"] = assigned_to
    tasks = list(tasks_db.find(query, {"_id": 0}))
    for t in tasks: t["isOverdue"] = is_overdue(t)
    return tasks

# ===========================
# 📈 ANALYTICS & NOTIFS
# ===========================

def get_task_analytics():
    tasks = list(tasks_db.find({}, {"_id": 0}))
    total = len(tasks)
    completed = len([t for t in tasks if t.get("status") == "completed"])
    avg_progress = (sum(t.get("progress", 0) for t in tasks) / total) if total > 0 else 0
    completion_rate = (completed / total * 100) if total > 0 else 0
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "completion_rate": completion_rate,
        "average_progress": avg_progress
    }

def create_notification(user_email, message, task_id=None):
    return notifications.insert_one({
        "user_email": user_email,
        "message": message,
        "task_id": task_id,
        "created_at": datetime.now(),
        "read": False
    })

# ===========================
# 🆕 HELP & SUPPORT HELPERS
# ===========================

def raise_ticket(email, name, message):
    return help_tickets.insert_one({
        "ticket_id": int(time.time()),
        "email": email,
        "name": name,
        "message": message,
        "status": "open",
        "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })

def get_all_tickets():
    return list(help_tickets.find({}, {"_id": 0}))

# ===========================
# 🛠️ MIGRATION & MAINTENANCE
# ===========================

def fix_missing_roles():
    users.update_many({"role": {"$exists": False}}, {"$set": {"role": "employee"}})

def migrate_old_tasks():
    tasks_db.update_many(
        {},
        {
            "$set": {
                "progress": 0,
                "daily_updates": [],
                "blocker": None,
                "blocker_reported_at": None
            }
        }
    )

# Machi, ithu run panna migration correct-ah aagum.
if __name__ == "__main__":
    print("Database connected and collections initialized, Machi! 🚀")