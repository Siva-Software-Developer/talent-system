from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import users, notifications, tasks_db 
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
import re
import random
import time
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ================= STORAGE CONFIG =================
UPLOAD_FOLDER = 'uploads/task_pdfs'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ================= MAIL CONFIG =================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'rynixsoftintern@gmail.com'
app.config['MAIL_PASSWORD'] = 'bbkdtalmklbxhpav'
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

mail = Mail(app)

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

otp_store = {}

def send_otp(email, otp):
    try:
        msg = Message(
            subject="Your OTP Code - Talent OS",
            recipients=[email],
            body=f"Your OTP for verification is: {otp}"
        )
        mail.send(msg)
        return True
    except Exception as e:
        print("MAIL ERROR:", e)
        return False

def send_task_notification(email, title):
    try:
        msg = Message(
            subject="New Task Assigned",
            recipients=[email],
            body=f"New task '{title}' assigned to you."
        )
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
            "role": user["role"]
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


# ================= TASK =================

@app.route('/tasks', methods=['GET'])
def get_tasks():
    all_tasks = list(tasks_db.find({}, {"_id": 0}))
    return jsonify(all_tasks), 200


@app.route('/admin/assign-task', methods=['POST'])
def admin_assign_task():
    title = request.form.get("title")
    description = request.form.get("description")
    due_date = request.form.get("dueDate")
    assigned_by = request.form.get("assigned_by")
    assigned_emails = request.form.getlist("assigned_to")

    pdf_filename = None
    if 'task_file' in request.files:
        file = request.files['task_file']
        if file.filename != '':
            pdf_filename = secure_filename(f"{int(time.time())}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename))

    group_id = int(time.time())

    for email in assigned_emails:
        task_id = int(time.time() * 1000) + random.randint(1, 999)

        new_task = {
            "id": task_id,
            "group_id": group_id,
            "title": title,
            "description": description,
            "status": "pending",
            "dueDate": due_date,
            "assigned_to": email,
            "assigned_by": assigned_by,
            "pdf_url": pdf_filename,
            "created_at": time.strftime('%Y-%m-%d %H:%M:%S'),
            "completed_at": None,
            "proof_link": None,
            "github_link": None
        }

        tasks_db.insert_one(new_task)

        notifications.insert_one({
            "user_email": email,
            "message": f"New Task: {title}",
            "task_id": task_id,
            "read": False
        })

        send_task_notification(email, title)

    return jsonify({"message": f"Task assigned to {len(assigned_emails)} employees"}), 201


@app.route('/employee/complete-task', methods=['POST'])
def complete_task():
    data = request.get_json()

    result = tasks_db.update_one(
        {"id": data.get("id")},
        {"$set": {
            "status": "completed",
            "proof_link": data.get("proof_link"),
            "github_link": data.get("github_link")
        }}
    )

    if result.modified_count:
        return jsonify({"message": "Completed"}), 200

    return jsonify({"message": "Task not found"}), 404


@app.route('/uploads/pdfs/<filename>')
def download_pdf(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route("/users", methods=["GET"])
def get_users():
    user_list = list(users.find({}, {"_id": 0, "password": 0}))
    return jsonify(user_list), 200
# ================= DELETE TASK =================

@app.route('/delete-task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        result = tasks_db.delete_one({"id": task_id})

        if result.deleted_count == 1:
            return jsonify({"message": "Task deleted successfully"}), 200
        else:
            return jsonify({"error": "Task not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= RUN =================

if __name__ == "__main__":
    app.run(debug=True, port=5000)