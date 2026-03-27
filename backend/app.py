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
# Machi, security-kaga resources handle pannalaam
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

# ================= UTILS & VALIDATION =================

def is_strong_password(password):
    if len(password) < 8: return False
    if not re.search(r"[A-Z]", password): return False
    if not re.search(r"[a-z]", password): return False
    if not re.search(r"[0-9]", password): return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password): return False
    return True

def is_valid_email(email):
    pattern = r"[^@]+@[^@]+\.[^@]+"
    result = re.match(pattern, email)
    return result is not None

otp_store = {}

def send_otp(email, otp):
    try:
        msg = Message(
            subject="Your OTP Code - Talent OS",
            recipients=[email],
            body=f"Your Secure OTP for registration is: {otp}. This code is valid for 5 minutes."
        )
        mail.send(msg)
        return True
    except Exception as e:
        print("CRITICAL MAIL ERROR:", e)
        return False

def send_task_notification(email, title):
    try:
        msg = Message(
            subject="New Task Assigned - Talent OS",
            recipients=[email],
            body=f"Hi, a new task '{title}' has been assigned to you. Please check your dashboard for details and the PDF document."
        )
        mail.send(msg)
    except Exception as e:
        print("NOTIF MAIL ERROR:", e)

# ================= AUTH ROUTES =================

@app.route("/register-send-otp", methods=["POST"])
def register_send_otp():
    data = request.get_json()
    email = data.get("email")
    
    if not email or not is_valid_email(email):
        return jsonify({"message": "Invalid email format provided"}), 400
        
    existing_user = users.find_one({"email": email})
    if existing_user:
        return jsonify({"message": "Email already registered with us"}), 400
        
    otp = str(random.randint(1000, 9999))
    otp_store[email] = {
        "otp": otp,
        "time": time.time()
    }
    
    sent = send_otp(email, otp)
    if sent:
        return jsonify({"message": "OTP sent successfully to your email"}), 200
    else:
        return jsonify({"message": "Failed to send OTP. Please try again later"}), 500

@app.route("/register-verify", methods=["POST"])
def register_verify():
    data = request.get_json()
    email = data.get("email")
    user_otp = data.get("otp")
    password = data.get("password")
    
    stored_data = otp_store.get(email)
    
    if not stored_data:
        return jsonify({"message": "No OTP session found. Please request again"}), 400
        
    current_time = time.time()
    time_diff = current_time - stored_data["time"]
    
    if time_diff > 300:
        del otp_store[email]
        return jsonify({"message": "OTP has expired. Maximum 5 minutes allowed"}), 400
        
    if stored_data["otp"] != user_otp:
        return jsonify({"message": "Invalid OTP entered"}), 400
        
    if not is_strong_password(password):
        return jsonify({"message": "Password must be stronger (8+ chars, upper, lower, digit, symbol)"}), 400
    
    users.insert_one({
        "name": data.get("name"),
        "email": email,
        "dob": data.get("dob"),
        "password": generate_password_hash(password),
        "role": data.get("role", "employee"),
        "job": data.get("job"),
        "created_at": time.time(),
        "is_verified": True
    })
    
    if email in otp_store:
        del otp_store[email]
        
    return jsonify({"message": "Account created and verified successfully!"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    user = users.find_one({"email": email})
    
    if not user:
        return jsonify({"message": "Account not found"}), 404
        
    if not user.get("is_verified"):
        return jsonify({"message": "Account exists but email not verified"}), 403
        
    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid password entered"}), 401
        
    return jsonify({
        "message": "Login success",
        "user": {
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "job": user.get("job")
        }
    }), 200

# ================= TASK SYSTEM (ADVANCED) =================

@app.route('/tasks', methods=['GET'])
def get_tasks():
    # Admin-um Employee-um live status pakkalaam
    all_tasks = list(tasks_db.find({}, {"_id": 0}))
    return jsonify(all_tasks), 200

@app.route('/admin/assign-task', methods=['POST'])
def admin_assign_task():
    # Multi-Employee & PDF Logic
    title = request.form.get("title")
    description = request.form.get("description")
    due_date = request.form.get("dueDate")
    assigned_by = request.form.get("assigned_by")
    
    # Frontend-la irundhu vara employee list
    assigned_emails = request.form.getlist("assigned_to")
    
    # PDF File Handling
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
        
        # Notification System
        notifications.insert_one({
            "user_email": email,
            "message": f"New Task Alert: {title}",
            "task_id": task_id,
            "created_at": time.time(),
            "read": False
        })
        # Instant Mail Alert
        send_task_notification(email, title)

    return jsonify({"message": f"Task successfully assigned to {len(assigned_emails)} employees"}), 201

@app.route('/employee/complete-task', methods=['POST'])
def employee_complete_task():
    data = request.get_json()
    task_id = data.get("id")
    
    result = tasks_db.update_one(
        {"id": task_id},
        {"$set": {
            "status": "completed",
            "completed_at": time.strftime('%Y-%m-%d %H:%M:%S'),
            "proof_link": data.get("proof_link"),
            "github_link": data.get("github_link")
        }}
    )
    
    if result.modified_count:
        return jsonify({"message": "Completion data submitted for review!"}), 200
    return jsonify({"message": "Target Task not found"}), 404

@app.route('/uploads/pdfs/<filename>')
def download_pdf(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route("/users", methods=["GET"])
def get_users():
    try:
        user_cursor = users.find({}, {"_id": 0, "password": 0})
        user_list = list(user_cursor)
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/delete-task/<int:id>', methods=['DELETE'])
def delete_task(id):
    result = tasks_db.delete_one({"id": id})
    if result.deleted_count:
        return jsonify({"message": "Task successfully removed"}), 200
    return jsonify({"message": "Task ID not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)