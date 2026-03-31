from database import tasks_db, users
from bson.objectid import ObjectId
import time

# =========================================================
# 📝 UPDATED TASK MODEL LOGIC (VERSION 4.0 🔥🔥)
# =========================================================

class TaskModel:
    
    # =========================================================
    # 🔥 HELPER: OVERDUE CHECK
    # =========================================================
    @staticmethod
    def is_overdue(task):
        try:
            if task.get("dueDate") and task.get("status") != "completed":
                due_time = time.mktime(time.strptime(task["dueDate"], "%Y-%m-%d"))
                return time.time() > due_time
        except:
            return False
        return False

    # =========================================================
    # 🔥 CREATE TASK
    # =========================================================
    @staticmethod
    def create_task(data, pdf_filename=None):
        assigned_emails = data.get("assigned_to", [])
        
        if isinstance(assigned_emails, str):
            assigned_emails = [assigned_emails]

        group_id = int(time.time())
        created_tasks = []

        for email in assigned_emails:
            task_id = int(time.time() * 1000) + hash(email) % 1000
            
            new_task = {
                "id": task_id,
                "group_id": group_id,
                "title": data.get("title"),
                "description": data.get("description"),

                # STATUS SYSTEM
                "status": "pending",
                "progress": 0,

                "dueDate": data.get("dueDate", "No deadline"),
                "assigned_to": email,
                "assigned_by": data.get("assigned_by"),

                "pdf_url": pdf_filename,

                # DAILY TRACKING
                "daily_updates": [],

                # EXISTING
                "blocker": None,
                "blocker_reported_at": None,
                "created_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                "completed_at": None,
                "proof_link": None,
                "github_link": None
            }
            
            tasks_db.insert_one(new_task)
            created_tasks.append(new_task)
            
        return created_tasks

    # =========================================================
    # 🔥 GET ALL TASKS (WITH OVERDUE FLAG)
    # =========================================================
    @staticmethod
    def get_all_tasks():
        tasks = list(tasks_db.find({}, {"_id": 0}))
        for t in tasks:
            t["isOverdue"] = TaskModel.is_overdue(t)
        return tasks

    # =========================================================
    # 🔥 GET TASKS BY USER
    # =========================================================
    @staticmethod
    def get_tasks_by_user(email):
        tasks = list(tasks_db.find({"assigned_to": email}, {"_id": 0}))
        for t in tasks:
            t["isOverdue"] = TaskModel.is_overdue(t)
        return tasks

    # =========================================================
    # 🔥 FILTER TASKS
    # =========================================================
    @staticmethod
    def filter_tasks(status=None, assigned_to=None):
        query = {}

        if status:
            query["status"] = status
        if assigned_to:
            query["assigned_to"] = assigned_to

        tasks = list(tasks_db.find(query, {"_id": 0}))
        for t in tasks:
            t["isOverdue"] = TaskModel.is_overdue(t)

        return tasks

    # =========================================================
    # 🔥 COMPLETE TASK
    # =========================================================
    @staticmethod
    def update_task_status(task_id, completion_data):
        result = tasks_db.update_one(
            {"id": int(task_id)},
            {"$set": {
                "status": "completed",
                "progress": 100,
                "proof_link": completion_data.get("proof_link"),
                "github_link": completion_data.get("github_link"),
                "completed_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                "blocker": None
            }}
        )
        return result.modified_count > 0

    # =========================================================
    # 🔥 DAILY PROGRESS UPDATE (WITH BLOCKER LOGIC)
    # =========================================================
    @staticmethod
    def update_progress(task_id, progress, update_text):

        # Fetch existing task
        task = tasks_db.find_one({"id": int(task_id)})

        if not task:
            return False

        # STATUS LOGIC
        if task.get("blocker"):
            status = "blocked"
        elif progress == 0:
            status = "pending"
        elif progress < 100:
            status = "in_progress"
        else:
            status = "completed"

        update_entry = {
            "date": time.strftime('%Y-%m-%d %H:%M:%S'),
            "update": update_text,
            "progress": progress
        }

        result = tasks_db.update_one(
            {"id": int(task_id)},
            {
                "$set": {
                    "progress": progress,
                    "status": status
                },
                "$push": {
                    "daily_updates": update_entry
                }
            }
        )

        return result.modified_count > 0

    # =========================================================
    # 🔥 REPORT BLOCKER
    # =========================================================
    @staticmethod
    def report_blocker(task_id, blocker_msg):
        result = tasks_db.update_one(
            {"id": int(task_id)},
            {"$set": {
                "blocker": blocker_msg,
                "blocker_reported_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                "status": "blocked"  # 🔥 NEW
            }}
        )
        return result.modified_count > 0

    # =========================================================
    # 🔥 DELETE TASK
    # =========================================================
    @staticmethod
    def delete_task(task_id):
        result = tasks_db.delete_one({"id": int(task_id)})
        return result.deleted_count > 0

    # =========================================================
    # 🔥 DASHBOARD STATS
    # =========================================================
    @staticmethod
    def get_dashboard_stats():
        total = tasks_db.count_documents({})
        completed = tasks_db.count_documents({"status": "completed"})
        pending = tasks_db.count_documents({"status": "pending"})
        in_progress = tasks_db.count_documents({"status": "in_progress"})
        blocked = tasks_db.count_documents({"status": "blocked"})
        active_blockers = tasks_db.count_documents({"blocker": {"$ne": None}})
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress,
            "blocked": blocked,
            "active_blockers": active_blockers
        }

    # =========================================================
    # 🔥 ANALYTICS
    # =========================================================
    @staticmethod
    def get_analytics():
        tasks = list(tasks_db.find({}, {"_id": 0}))

        total = len(tasks)
        completed = len([t for t in tasks if t.get("status") == "completed"])

        avg_progress = 0
        if total > 0:
            avg_progress = sum(t.get("progress", 0) for t in tasks) / total

        completion_rate = (completed / total * 100) if total > 0 else 0

        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "completion_rate": completion_rate,
            "average_progress": avg_progress
        }