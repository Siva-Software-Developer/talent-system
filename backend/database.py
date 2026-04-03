from pymongo import MongoClient
from datetime import datetime
import time

# =================================================================
# 🔗 DATABASE CONNECTION & INITIALIZATION
# =================================================================
client = MongoClient("mongodb://localhost:27017/")
db = client["talent_db"]

# 📂 COLLECTIONS
users = db["users"]
tasks_db = db["tasks"]
notifications = db["notifications"]
sod_db = db["sod"]
eod_db = db["eod"]
messages_db = db["messages"]
help_tickets = db["help_tickets"]
settings_db = db["settings"]

# =================================================================
# 👤 USER MANAGEMENT (ENHANCED WITH PROFILE SETTINGS)
# =================================================================

def create_user(name, email, password, role="employee", job=None):
    """Creates a new user with extended profile schema."""
    user_data = {
        "name": name,
        "email": email,
        "password": password,
        "role": role,
        "job": job,

        # 🔥 NEW PROFILE FIELDS
        "profile_pic": None,
        "dob": None,
        "phone": None,
        "address": None,

        "is_verified": False,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    return users.insert_one(user_data)


def get_user_by_email(email):
    return users.find_one({"email": email})


def get_user_profile(email):
    """Returns user profile (for Profile Settings Page)."""
    return users.find_one(
        {"email": email},
        {"_id": 0, "password": 0}  # Hide sensitive data
    )


def update_user_profile(email, update_data):
    """Updates profile details like Name, DOB, Profile Pic."""
    update_data["updated_at"] = datetime.now()

    return users.update_one(
        {"email": email},
        {"$set": update_data}
    )

# =================================================================
# 🧠 TASK MANAGEMENT (NO BREAKING CHANGES)
# =================================================================

def create_advanced_task(task_data):
    defaults = {
        "status": "pending",
        "progress": 0,
        "daily_updates": [],
        "blocker": None,
        "blocker_reported_at": None,
        "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "completed_at": None,
        "proof_link": None,
        "github_link": None
    }

    for key, value in defaults.items():
        task_data.setdefault(key, value)

    return tasks_db.insert_one(task_data)


def update_task_progress(task_id, progress, update_text):
    task = tasks_db.find_one({"id": task_id})
    if not task:
        return False

    if task.get("blocker"):
        status = "blocked"
    elif progress == 0:
        status = "pending"
    elif progress < 100:
        status = "in_progress"
    else:
        status = "completed"

    update_payload = {
        "$set": {
            "progress": progress,
            "status": status
        },
        "$push": {
            "daily_updates": {
                "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "update": update_text,
                "progress": progress
            }
        }
    }

    if progress == 100:
        update_payload["$set"]["completed_at"] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    return tasks_db.update_one({"id": task_id}, update_payload)


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


def is_overdue(task):
    try:
        if task.get("dueDate") and task.get("status") != "completed":
            due_time = time.mktime(time.strptime(task["dueDate"], "%Y-%m-%d"))
            return time.time() > due_time
    except:
        return False
    return False


def get_filtered_tasks(status=None, assigned_to=None):
    query = {}
    if status:
        query["status"] = status
    if assigned_to:
        query["assigned_to"] = assigned_to

    tasks = list(tasks_db.find(query, {"_id": 0}))
    for t in tasks:
        t["isOverdue"] = is_overdue(t)
    return tasks

# =================================================================
# 📊 ADMIN ATTENDANCE (NEW FEATURE - PHASE 2 READY)
# =================================================================

def get_attendance_records(email=None, start_date=None, end_date=None):
    """Admin attendance filter API support."""

    query = {}

    if email:
        query["email"] = email

    if start_date and end_date:
        query["timestamp"] = {
            "$gte": datetime.strptime(start_date, "%Y-%m-%d"),
            "$lte": datetime.strptime(end_date, "%Y-%m-%d")
        }

    sod_records = list(sod_db.find(query, {"_id": 0}))
    eod_records = list(eod_db.find(query, {"_id": 0}))

    return {
        "sod": sod_records,
        "eod": eod_records
    }

# =================================================================
# 💬 CHAT SYSTEM
# =================================================================

def save_message(sender_email, sender_name, text, parent_id=None, reply_to_text=None):
    return messages_db.insert_one({
        "message_id": int(time.time() * 1000),
        "sender_email": sender_email,
        "sender_name": sender_name,
        "text": text,
        "parent_id": parent_id,
        "reply_to_text": reply_to_text,
        "reactions": {},
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })


def add_message_reaction(message_id, user_email, emoji):
    safe_email = user_email.replace(".", "_")
    return messages_db.update_one(
        {"message_id": message_id},
        {"$set": {f"reactions.{safe_email}": emoji}}
    )


def get_all_messages():
    return list(messages_db.find({}, {"_id": 0}).sort("message_id", 1))

# =================================================================
# 🔔 NOTIFICATIONS
# =================================================================

def create_notification(user_email, message, task_id=None):
    return notifications.insert_one({
        "user_email": user_email,
        "message": message,
        "task_id": task_id,
        "created_at": datetime.now(),
        "read": False
    })


def get_notifications(user_email):
    return list(notifications.find({"user_email": user_email}).sort("created_at", -1))

# =================================================================
# 🛠️ ATTENDANCE + SUPPORT
# =================================================================

def log_sod(email, name, mood, tasks_planned):
    return sod_db.insert_one({
        "email": email,
        "name": name,
        "mood": mood,
        "tasks_planned": tasks_planned,
        "timestamp": datetime.now()
    })


def log_eod(email, name, tasks_completed, blockers_faced, hours_worked):
    return eod_db.insert_one({
        "email": email,
        "name": name,
        "tasks_completed": tasks_completed,
        "blockers": blockers_faced,
        "hours": hours_worked,
        "timestamp": datetime.now()
    })


def raise_ticket(email, name, message):
    return help_tickets.insert_one({
        "ticket_id": int(time.time()),
        "email": email,
        "name": name,
        "message": message,
        "status": "open",
        "created_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })

# =================================================================
# ⚙️ SYSTEM SETTINGS (PHASE 3 READY)
# =================================================================

def get_settings():
    return settings_db.find_one({}, {"_id": 0})


def update_settings(data):
    return settings_db.update_one({}, {"$set": data}, upsert=True)

# =================================================================
# 🚀 MIGRATIONS (SAFE UPDATE)
# =================================================================

def run_migrations():
    print("Running migrations...")

    users.update_many(
        {"profile_pic": {"$exists": False}},
        {"$set": {"profile_pic": None, "dob": None}}
    )

    tasks_db.update_many(
        {"progress": {"$exists": False}},
        {"$set": {"progress": 0, "daily_updates": []}}
    )

    messages_db.update_many(
        {"reactions": {"$exists": False}},
        {"$set": {"reactions": {}}}
    )

    print("✅ Database upgraded successfully, Machi 🔥")

if __name__ == "__main__":
    run_migrations()