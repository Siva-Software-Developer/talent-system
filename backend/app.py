from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import users, notifications, tasks_db, db # db added for help collections
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
import re
import random
import time
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ================= STORAGE CONFIG =================
UPLOAD_FOLDER = 'uploads/task_pdfs'
PROFILE_FOLDER = 'uploads/profiles' # 🆕 Added profile picture folder

for folder in [UPLOAD_FOLDER, PROFILE_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROFILE_FOLDER'] = PROFILE_FOLDER # 🆕 Save profile pictures here

# ================= MAIL CONFIG =================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'rynixsoftintern@gmail.com'
app.config['MAIL_PASSWORD'] = 'bbkdtalmklbxhpav'
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

mail = Mail(app)

# ================= 🆕 FILE UPLOAD UTILS (INTEGRATED) =================

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, folder):
    """Helper to handle secure saving of files"""
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{int(time.time())}_{file.filename}")
        file.save(os.path.join(folder, filename))
        return filename
    return None

# ================= UTILS =================

def is_strong_password(password):
    if len(password) < 8: return False
    if not re.search(r"[A-Z]", password): return False
    if not re.search(r"[a-z]", password): return False
    if not re.search(r"[0-9]", password): return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password): return False
    return True

def is_valid_email(email):
    pattern = r"[^@]+@[^@]+\.[^@]+"
    return re.match(pattern, email) is not None

def check_overdue(task):
    try:
        if task.get("dueDate"):
            due_time = time.mktime(time.strptime(task["dueDate"], "%Y-%m-%d"))
            return time.time() > due_time and task.get("status") != "completed"
    except:
        return False
    return False

otp_store = {}

def send_otp(email, otp):
    try:
        msg = Message("Your OTP Code - Talent OS",
                      recipients=[email],
                      body=f"Your OTP for verification is: {otp}")
        mail.send(msg)
        return True
    except Exception as e:
        print("MAIL ERROR:", e)
        return False

def send_task_notification(email, title):
    try:
        msg = Message("New Task Assigned",
                      recipients=[email],
                      body=f"New task '{title}' assigned to you.")
        mail.send(msg)
    except Exception as e:
        print("NOTIF ERROR:", e)

# ================= AUTH =================

@app.route("/register-send-otp", methods=["POST"])
def register_send_otp():
    data = request.get_json()
    email = data.get("email")

    if not email or not is_valid_email(email):
        return jsonify({"message": "Invalid email"}), 400

    if users.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 400

    otp = str(random.randint(1000, 9999))
    otp_store[email] = {"otp": otp, "time": time.time()}

    if send_otp(email, otp):
        return jsonify({"message": "OTP sent"}), 200
    return jsonify({"message": "OTP failed"}), 500


@app.route("/register-verify", methods=["POST"])
def register_verify():
    data = request.get_json()
    email = data.get("email")
    user_otp = data.get("otp")
    password = data.get("password")

    stored = otp_store.get(email)
    if not stored:
        return jsonify({"message": "No OTP"}), 400

    if time.time() - stored["time"] > 300:
        del otp_store[email]
        return jsonify({"message": "OTP expired"}), 400

    if stored["otp"] != user_otp:
        return jsonify({"message": "Wrong OTP"}), 400

    if not is_strong_password(password):
        return jsonify({"message": "Weak password"}), 400

    users.insert_one({
        "name": data.get("name"),
        "email": email,
        "password": generate_password_hash(password),
        "role": data.get("role", "employee"),
        "job": data.get("job"),
        "profile_pic": None, # 🆕 Added profile field
        "dob": None,         # 🆕 Added DOB field
        "is_verified": True
    })

    del otp_store[email]
    return jsonify({"message": "Registered"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users.find_one({"email": data.get("email")})

    if not user:
        return jsonify({"message": "No user"}), 404

    if not check_password_hash(user["password"], data.get("password")):
        return jsonify({"message": "Wrong password"}), 401

    return jsonify({
        "message": "Login success",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "profile_pic": user.get("profile_pic"), # 🆕 Return profile image
            "dob": user.get("dob")                   # 🆕 Return DOB
        }
    }), 200


# ================= FORGOT PASSWORD =================

@app.route("/forgot-send-otp", methods=["POST"])
def forgot_send_otp():
    data = request.get_json()
    email = data.get("email")

    if not email or not is_valid_email(email):
        return jsonify({"message": "Invalid email"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    otp = str(random.randint(1000, 9999))
    otp_store[email] = {"otp": otp, "time": time.time()}

    if send_otp(email, otp):
        return jsonify({"message": "OTP sent successfully"}), 200

    return jsonify({"message": "Failed to send OTP"}), 500


@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    user_otp = data.get("otp")
    new_password = data.get("password")

    stored = otp_store.get(email)

    if not stored:
        return jsonify({"message": "No OTP found"}), 400

    if time.time() - stored["time"] > 300:
        del otp_store[email]
        return jsonify({"message": "OTP expired"}), 400

    if stored["otp"] != user_otp:
        return jsonify({"message": "Invalid OTP"}), 400

    if not is_strong_password(new_password):
        return jsonify({"message": "Weak password"}), 400

    users.update_one(
        {"email": email},
        {"$set": {"password": generate_password_hash(new_password)}}
    )

    del otp_store[email]

    return jsonify({"message": "Password reset successful"}), 200


# 🆕 ================= PHASE 1: USER PROFILE UPDATE =================

@app.route('/api/user/profile/update', methods=['POST'])
def update_profile():
    try:
        email = request.form.get("email")
        name = request.form.get("name")
        dob = request.form.get("dob")
        
        update_data = {}
        if name: update_data["name"] = name
        if dob: update_data["dob"] = dob

        if 'profile_pic' in request.files:
            file = request.files['profile_pic']
            # Using integrated helper
            filename = save_uploaded_file(file, app.config['PROFILE_FOLDER'])
            if filename:
                update_data["profile_pic"] = filename

        users.update_one({"email": email}, {"$set": update_data})
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= TASK MANAGEMENT =================

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = list(tasks_db.find({}, {"_id": 0}))
    for t in tasks:
        t["isOverdue"] = check_overdue(t)
    return jsonify(tasks), 200


@app.route('/tasks/filter', methods=['GET'])
def filter_tasks():
    try:
        status = request.args.get("status")
        assigned_to = request.args.get("assigned_to")

        query = {}
        if status:
            query["status"] = status
        if assigned_to:
            query["assigned_to"] = assigned_to

        tasks = list(tasks_db.find(query, {"_id": 0}))
        for t in tasks:
            t["isOverdue"] = check_overdue(t)

        return jsonify(tasks), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/tasks/user/<email>', methods=['GET'])
def get_tasks_by_user(email):
    tasks = list(tasks_db.find({"assigned_to": email}, {"_id": 0}))
    for t in tasks:
        t["isOverdue"] = check_overdue(t)
    return jsonify(tasks), 200


@app.route('/admin/assign-task', methods=['POST'])
def admin_assign_task():
    try:
        title = request.form.get("title")
        description = request.form.get("description")
        due_date = request.form.get("dueDate")
        assigned_by = request.form.get("assigned_by")
        assigned_emails = request.form.getlist("assigned_to")

        pdf_filename = None
        if 'task_file' in request.files:
            file = request.files['task_file']
            # Using integrated helper
            pdf_filename = save_uploaded_file(file, app.config['UPLOAD_FOLDER'])

        group_id = int(time.time())

        for email in assigned_emails:
            task_id = int(time.time()*1000)+random.randint(1,999)

            tasks_db.insert_one({
                "id": task_id,
                "group_id": group_id,
                "title": title,
                "description": description,
                "status": "pending",
                "progress": 0,
                "daily_updates": [],
                "dueDate": due_date,
                "assigned_to": email,
                "assigned_by": assigned_by,
                "pdf_url": pdf_filename,
                "created_at": time.strftime('%Y-%m-%d %H:%M:%S'),
                "proof_link": None,
                "github_link": None,
                "blocker": None # 🆕 Ensure blocker field exists
            })

            notifications.insert_one({
                "user_email": email,
                "message": f"New Task: {title}",
                "task_id": task_id,
                "read": False
            })

            send_task_notification(email, title)

        return jsonify({"message": "Task assigned"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/update-progress', methods=['POST'])
def update_progress():
    try:
        data = request.get_json()
        task_id = int(data.get("taskId"))
        progress = int(data.get("progress"))
        update_text = data.get("update")
        blocker_msg = data.get("blocker") # 🆕 Added support for blocker reports

        status = "pending" if progress == 0 else "completed" if progress == 100 else "in_progress"
        if blocker_msg:
            status = "blocked"

        update_payload = {
            "$set": {"progress": progress, "status": status},
            "$push": {
                "daily_updates": {
                    "date": time.strftime('%Y-%m-%d %H:%M:%S'),
                    "update": update_text,
                    "progress": progress
                }
            }
        }

        if blocker_msg:
            update_payload["$set"]["blocker"] = blocker_msg

        tasks_db.update_one({"id": task_id}, update_payload)
        return jsonify({"message": "Progress updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/dashboard', methods=['GET'])
def admin_dashboard():
    tasks = list(tasks_db.find({}, {"_id": 0}))
    stats = {"total": len(tasks), "completed":0,"pending":0,"in_progress":0,"blocked":0}
    employee_data = {}

    for t in tasks:
        stats[t.get("status","pending")] += 1
        emp = t.get("assigned_to")
        employee_data.setdefault(emp, []).append(t)

    return jsonify({"stats": stats, "employee_tasks": employee_data}), 200


@app.route('/admin/analytics', methods=['GET'])
def analytics():
    tasks = list(tasks_db.find({}, {"_id": 0}))
    total = len(tasks)
    completed = len([t for t in tasks if t["status"]=="completed"])
    avg = sum(t.get("progress",0) for t in tasks)/total if total else 0

    return jsonify({
        "total_tasks": total,
        "completion_rate": (completed/total*100 if total else 0),
        "average_progress": avg
    }), 200


@app.route('/employee/complete-task', methods=['POST'])
def complete_task():
    data = request.get_json()
    tasks_db.update_one(
        {"id": data.get("id")},
        {"$set": {
            "status": "completed",
            "progress": 100,
            "proof_link": data.get("proof_link"),
            "github_link": data.get("github_link"),
            "completed_at": time.strftime('%Y-%m-%d %H:%M:%S')
        }}
    )
    return jsonify({"message": "Completed"}), 200


@app.route('/delete-task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks_db.delete_one({"id": task_id})
    return jsonify({"message": "Deleted"}), 200


@app.route('/update-task/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    tasks_db.update_one(
        {"id": task_id},
        {"$set": {
            "title": request.form.get("title"),
            "description": request.form.get("description"),
            "dueDate": request.form.get("dueDate")
        }}
    )
    return jsonify({"message": "Updated"}), 200


@app.route('/uploads/pdfs/<filename>')
def download_pdf(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/uploads/profiles/<filename>')
def view_profile_pic(filename):
    return send_from_directory(app.config['PROFILE_FOLDER'], filename)


@app.route("/users", methods=["GET"])
def get_users():
    return jsonify(list(users.find({}, {"_id": 0, "password": 0}))), 200


# ================= 🟢 ATTENDANCE (SOD / EOD) =================

@app.route('/sod', methods=['POST'])
def submit_sod():
    try:
        data = request.json
        db.sod.insert_one(data)
        return jsonify({"message": "SOD saved"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/eod', methods=['POST'])
def submit_eod():
    try:
        data = request.json
        db.eod.insert_one(data)
        return jsonify({"message": "EOD saved"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/sod', methods=['GET'])
def get_sod():
    try:
        data = list(db.sod.find({}, {"_id": 0}))
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/eod', methods=['GET'])
def get_eod():
    try:
        data = list(db.eod.find({}, {"_id": 0}))
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🆕 ================= PHASE 2: ATTENDANCE FILTERING (ADMIN) =================

@app.route('/api/admin/attendance', methods=['GET'])
def admin_attendance_filter():
    try:
        email = request.args.get("email")
        date = request.args.get("date")
        
        query = {}
        if email: query["email"] = email
        if date: query["date"] = date

        sod_records = list(db.sod.find(query, {"_id": 0}))
        eod_records = list(db.eod.find(query, {"_id": 0}))

        return jsonify({"sod": sod_records, "eod": eod_records}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= 📢 ALL CHAT (UPDATED WITH REPLIES) =================

@app.route('/messages', methods=['POST'])
def send_message():
    try:
        data = request.json
        if "message_id" not in data:
            data["message_id"] = int(time.time() * 1000)
        
        if "reactions" not in data:
            data["reactions"] = {}

        db.messages.insert_one(data)
        return jsonify({"message": "Message sent", "message_id": data["message_id"]}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/messages', methods=['GET'])
def get_messages():
    try:
        messages = list(db.messages.find({}, {"_id": 0}).sort("timestamp", 1))
        return jsonify(messages), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/messages/react', methods=['POST'])
def react_to_message():
    try:
        data = request.json
        message_id = data.get("message_id")
        email = data.get("email").replace(".", "_") # MongoDB keys cannot contain dots
        emoji = data.get("emoji")

        db.messages.update_one(
            {"message_id": message_id},
            {"$set": {f"reactions.{email}": emoji}}
        )
        return jsonify({"status": "success", "message": "Reaction updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= 💡 HELP & SUPPORT =================

@app.route('/help/raise-ticket', methods=['POST'])
def raise_ticket():
    try:
        data = request.get_json()
        ticket_id = int(time.time() * 1000)
        
        ticket_obj = {
            "ticket_id": ticket_id,
            "employee_name": data.get("name"),
            "employee_email": data.get("email"),
            "message": data.get("message"),
            "status": "open",
            "priority": "medium",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        db.help_tickets.insert_one(ticket_obj)
        
        return jsonify({"message": "Support ticket raised successfully!", "ticket_id": ticket_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/help/tickets', methods=['GET'])
def get_tickets():
    try:
        tickets = list(db.help_tickets.find({}, {"_id": 0}))
        return jsonify(tickets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/help/tickets/update', methods=['POST'])
def update_ticket_status():
    try:
        data = request.get_json()
        db.help_tickets.update_one(
            {"ticket_id": data.get("ticket_id")},
            {"$set": {"status": data.get("status")}}
        )
        return jsonify({"message": "Ticket status updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🆕 ================= PHASE 3: GLOBAL SETTINGS (ADMIN) =================

@app.route('/api/admin/settings', methods=['GET', 'POST'])
def admin_settings():
    try:
        if request.method == 'POST':
            data = request.json
            # Using an upsert to keep global configs in one document
            db.settings.update_one({"type": "global_config"}, {"$set": data}, upsert=True)
            return jsonify({"message": "Settings updated"}), 200

        settings = db.settings.find_one({"type": "global_config"}, {"_id": 0})
        return jsonify(settings or {}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True, port=5000)