from database import tasks_db, users
from bson.objectid import ObjectId
import time

# =========================================================
# 📝 UPDATED TASK MODEL LOGIC (VERSION 2.0)
# =========================================================

class TaskModel:
    
    @staticmethod
    def create_task(data, pdf_filename=None):
        """
        Machi, idhu dhaan Admin multiple employees-ku task assign panra primary logic.
        Ippo idhu multiple emails-ah handle pannum and creation time-ah track pannum.
        """
        assigned_emails = data.get("assigned_to", [])
        
        # String-ah vandha list-ah mathiko (Single employee case)
        if isinstance(assigned_emails, str):
            assigned_emails = [assigned_emails]

        group_id = int(time.time())
        created_tasks = []

        for email in assigned_emails:
            # Unique ID for every employee's task copy
            task_id = int(time.time() * 1000) + hash(email) % 1000
            
            new_task = {
                "id": task_id,
                "group_id": group_id,
                "title": data.get("title"),
                "description": data.get("description"),
                "status": "pending",
                "dueDate": data.get("dueDate", "No deadline"),
                "assigned_to": email,
                "assigned_by": data.get("assigned_by"),
                "pdf_url": pdf_filename, 
                "blocker": None,                # Machi, New Field: Issues report panna
                "blocker_reported_at": None,    # Time tracking for issues
                "created_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                "completed_at": None,
                "proof_link": None,
                "github_link": None
            }
            
            tasks_db.insert_one(new_task)
            created_tasks.append(new_task)
            
        return created_tasks

    @staticmethod
    def get_all_tasks():
        """Admin dashboard-la status track panna ellathaiyum fetch pannum"""
        return list(tasks_db.find({}, {"_id": 0}))

    @staticmethod
    def get_tasks_by_user(email):
        """Specific Employee-oda tasks-ah mattum filter pannum"""
        return list(tasks_db.find({"assigned_to": email}, {"_id": 0}))

    @staticmethod
    def update_task_status(task_id, completion_data):
        """
        Employee work-ah submit panna status 'completed'-ku maarum.
        Proof links and GitHub links store aagum.
        """
        result = tasks_db.update_one(
            {"id": int(task_id)},
            {"$set": {
                "status": "completed",
                "proof_link": completion_data.get("proof_link"),
                "github_link": completion_data.get("github_link"),
                "completed_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                "blocker": None # Task complete aitta issue clear aairuchi-nu artham
            }}
        )
        return result.modified_count > 0

    @staticmethod
    def report_blocker(task_id, blocker_msg):
        """
        Machi, idhu dhaan namma puthu logic. 
        Employee-ku issue irundha admin-ku inform panna field update pannum.
        """
        result = tasks_db.update_one(
            {"id": int(task_id)},
            {"$set": {
                "blocker": blocker_msg,
                "blocker_reported_at": time.strftime('%Y-%m-%d %H:%M:%S')
            }}
        )
        return result.modified_count > 0

    @staticmethod
    def delete_task(task_id):
        """Admin task-ah remove panna"""
        result = tasks_db.delete_one({"id": int(task_id)})
        return result.deleted_count > 0

    @staticmethod
    def get_dashboard_stats():
        """Dashboard overview-kaga counts edukka"""
        total = tasks_db.count_documents({})
        completed = tasks_db.count_documents({"status": "completed"})
        pending = tasks_db.count_documents({"status": "pending"})
        active_blockers = tasks_db.count_documents({"blocker": {"$ne": None}})
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "active_blockers": active_blockers # Stats-layum blocker count kaatum
        }