from pymongo import MongoClient
from datetime import datetime
import time

# ============================================================
# 🔗 DATABASE CONNECTION
# ============================================================

client = MongoClient("mongodb://localhost:27017/")
db = client["talent_db"]

# ============================================================
# 📂 COLLECTIONS (IMPORTANT - SAME NAME USED IN app.py)
# ============================================================

users = db["users"]
tasks_db = db["tasks"]
notifications = db["notifications"]

# ✅ IMPORTANT FIX (used in app.py directly)
sod = db["sod"]
eod = db["eod"]
messages = db["messages"]
help_tickets = db["help_tickets"]
settings = db["settings"]

# ============================================================
# 👤 USER MANAGEMENT
# ============================================================

def create_user(name, email, password, role="employee", job=None):
    return users.insert_one({
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "job": job,
        "profile_pic": None,
        "dob": None,
        "mobile": None,          # ✨ New Field Added
        "domain": "Engineering", # ✨ New Field Added
        "joinedDate": datetime.now().strftime('%Y-%m-%d'), # ✨ New Field Added
        "phone": None,
        "address": None,
        "is_verified": False,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    })


def get_user(email):
    return users.find_one({"email": email})


def update_user(email, data):
    """
    Machi, intha function dhaan Profile Settings data-va 
    permanent-ah database-la save pannum.
    """
    data["updated_at"] = datetime.now()
    return users.update_one({"email": email}, {"$set": data})

# ============================================================
# 🧠 TASK MANAGEMENT
# ============================================================

def create_task(task_data):
    task_data.setdefault("status", "pending")
    task_data.setdefault("progress", 0)
    task_data.setdefault("daily_updates", [])
    task_data.setdefault("blocker", None)
    task_data.setdefault("created_at", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    return tasks_db.insert_one(task_data)


def update_task(task_id, update_data):
    return tasks_db.update_one({"id": task_id}, {"$set": update_data})


def update_progress(task_id, progress, text):
    status = "pending" if progress == 0 else "completed" if progress == 100 else "in_progress"

    return tasks_db.update_one(
        {"id": task_id},
        {
            "$set": {"progress": progress, "status": status},
            "$push": {
                "daily_updates": {
                    "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    "update": text,
                    "progress": progress
                }
            }
        }
    )


def complete_task(task_id, proof_link=None, github_link=None):
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


def is_overdue(task):
    try:
        if task.get("dueDate") and task.get("status") != "completed":
            due_time = time.mktime(time.strptime(task["dueDate"], "%Y-%m-%d"))
            return time.time() > due_time
    except:
        return False
    return False

# ============================================================
# 📊 ATTENDANCE (SOD / EOD)
# ============================================================

def log_sod(data):
    return sod.insert_one(data)


def log_eod(data):
    return eod.insert_one(data)


def get_sod():
    return list(sod.find({}, {"_id": 0}))


def get_eod():
    return list(eod.find({}, {"_id": 0}))

# ============================================================
# 💬 CHAT SYSTEM
# ============================================================

def save_message(data):
    data["message_id"] = int(time.time() * 1000)
    data["timestamp"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    data.setdefault("reactions", {})

    return messages.insert_one(data)


def get_messages():
    return list(messages.find({}, {"_id": 0}).sort("timestamp", 1))


def react_message(message_id, email, emoji):
    safe_email = email.replace(".", "_")

    return messages.update_one(
        {"message_id": message_id},
        {"$set": {f"reactions.{safe_email}": emoji}}
    )

# ============================================================
# 🔔 NOTIFICATIONS
# ============================================================

def create_notification(email, message, task_id=None):
    return notifications.insert_one({
        "user_email": email,
        "message": message,
        "task_id": task_id,
        "read": False,
        "created_at": datetime.now()
    })


def get_notifications(email):
    return list(notifications.find({"user_email": email}))

# ============================================================
# 🛠️ HELP & SUPPORT
# ============================================================

def raise_ticket(data):
    data["ticket_id"] = int(time.time() * 1000)
    data["status"] = "open"
    data["created_at"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    return help_tickets.insert_one(data)


def get_tickets():
    return list(help_tickets.find({}, {"_id": 0}))


def update_ticket(ticket_id, status):
    return help_tickets.update_one(
        {"ticket_id": ticket_id},
        {"$set": {"status": status}}
    )

# ============================================================
# ⚙️ SETTINGS
# ============================================================

def get_settings():
    return settings.find_one({}, {"_id": 0})


def update_settings(data):
    return settings.update_one({}, {"$set": data}, upsert=True)

# ============================================================
# 🚀 MIGRATION (SAFE INIT)
# ============================================================

def run_migrations():
    print("Running DB migrations...")

    # ✨ Updated Migration to include new Profile Fields
    users.update_many(
        {"profile_pic": {"$exists": False}},
        {"$set": {
            "profile_pic": None, 
            "dob": None, 
            "mobile": None, 
            "domain": "Engineering", 
            "joinedDate": "2024-01-01"
        }}
    )

    tasks_db.update_many(
        {"progress": {"$exists": False}},
        {"$set": {"progress": 0, "daily_updates": []}}
    )

    messages.update_many(
        {"reactions": {"$exists": False}},
        {"$set": {"reactions": {}}}
    )

    print("✅ DB Ready 🔥 Puthiya Fields Ellam Add Panniyaachu Machi!")

# ============================================================
# ▶ RUN
# ============================================================

if __name__ == "__main__":
    run_migrations()