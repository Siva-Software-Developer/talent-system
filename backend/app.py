from flask import Flask, request, jsonify
from flask_cors import CORS
from database import users, notifications 
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
import re
import random
import time

app = Flask(__name__)
# Machi, security-kaga resources handle pannalaam
CORS(app, resources={r"/*": {"origins": "*"}})

# ================= MAIL CONFIG =================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'rynixsoftintern@gmail.com'
app.config['MAIL_PASSWORD'] = 'bbkdtalmklbxhpav'
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

mail = Mail(app)

# ================= UTILS & VALIDATION (DETAILED) =================

def is_strong_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
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
    
    # Final User Insertion
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

# ================= SPRINT 2: TASK SYSTEM =================

tasks = [] 

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks), 200

@app.route('/admin/create-task', methods=['POST'])
def admin_create_task():
    data = request.get_json()
    
    # Machi, indha ID generation romba important unique-ah iruka
    task_id = int(time.time() * 1000)
    
    new_task = {
        "id": task_id,
        "title": data.get("title"),
        "description": data.get("description"),
        "status": "pending",
        "dueDate": data.get("dueDate", "No deadline"),
        "assigned_to": data.get("assigned_to"),
        "assigned_by": data.get("assigned_by"),
        "created_at": time.strftime('%Y-%m-%d %H:%M:%S'),
        "completed_at": None,
        "proof_link": None,
        "github_link": None
    }
    
    tasks.append(new_task)
    
    # Notification Database record
    notifications.insert_one({
        "user_email": new_task["assigned_to"],
        "message": f"New Task Alert: {new_task['title']}",
        "task_id": task_id,
        "created_at": time.time(),
        "read": False
    })
    
    return jsonify({
        "message": "Task assigned successfully to the employee",
        "task": new_task
    }), 201

@app.route('/admin/delete-task/<int:id>', methods=['DELETE'])
def delete_task(id):
    global tasks
    initial_length = len(tasks)
    tasks = [t for t in tasks if t["id"] != id]
    
    if len(tasks) < initial_length:
        return jsonify({"message": "Task successfully removed from system"}), 200
    else:
        return jsonify({"message": "Task ID not found"}), 404

@app.route('/employee/complete-task', methods=['POST'])
def employee_complete_task():
    data = request.get_json()
    task_id = data.get("id")
    
    for t in tasks:
        if t["id"] == task_id:
            t["status"] = "completed"
            t["completed_at"] = time.strftime('%Y-%m-%d %H:%M:%S')
            t["proof_link"] = data.get("proof_link")
            t["github_link"] = data.get("github_link")
            return jsonify({
                "message": "Completion data submitted for review!",
                "task": t
            }), 200
            
    return jsonify({"message": "Target Task not found in active list"}), 404

@app.route("/users", methods=["GET"])
def get_users():
    # Machi, fetching all users but hiding sensitive password hash
    try:
        user_cursor = users.find({}, {"_id": 0, "password": 0})
        user_list = list(user_cursor)
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)