from flask import Flask, request, jsonify
from flask_cors import CORS
from database import users
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
import re, random

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------------- MAIL CONFIG ----------------
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'rynixsoftintern@gmail.com'
app.config['MAIL_PASSWORD'] = 'bbkdtalmklbxhpav'
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

mail = Mail(app)

# ---------------- VALIDATION ----------------
def is_strong_password(password):
    return (
        len(password) >= 8 and
        re.search(r"[A-Z]", password) and
        re.search(r"[a-z]", password) and
        re.search(r"[0-9]", password) and
        re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)
    )

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

otp_store = {}

# ---------------- SEND OTP ----------------
def send_otp(email, otp):
    try:
        msg = Message(
            subject="Your OTP Code",
            recipients=[email],
            body=f"Your OTP is {otp}"
        )
        mail.send(msg)
    except Exception as e:
        print("MAIL ERROR:", e)
        print("FALLBACK OTP:", otp)

# ---------------- REGISTER STEP 1 ----------------
@app.route("/register-send-otp", methods=["POST"])
def register_send_otp():
    data = request.get_json()
    email = data.get("email")

    if not is_valid_email(email):
        return jsonify({"message": "Invalid email format"}), 400

    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    otp = str(random.randint(1000, 9999))
    otp_store[email] = otp

    send_otp(email, otp)

    return jsonify({"message": "OTP sent"}), 200

# ---------------- REGISTER VERIFY ----------------
@app.route("/register-verify", methods=["POST"])
def register_verify():
    data = request.get_json()

    if otp_store.get(data.get("email")) != data.get("otp"):
        return jsonify({"message": "Invalid OTP"}), 400

    password = data.get("password")

    if not is_strong_password(password):
        return jsonify({
            "message": "Weak password! Use uppercase, lowercase, number & special char"
        }), 400

    users.insert_one({
        "name": data.get("name"),
        "email": data.get("email"),
        "dob": data.get("dob"),
        "password": generate_password_hash(password)
    })

    return jsonify({"message": "Registered successfully"}), 201

# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    user = users.find_one({"email": data.get("email")})

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user["password"], data.get("password")):
        return jsonify({"message": "Invalid password"}), 401

    return jsonify({"message": "Login success"}), 200

# ---------------- FORGOT SEND OTP ----------------
@app.route("/forgot-send-otp", methods=["POST"])
def forgot_send():
    data = request.get_json()
    email = data.get("email")

    if not users.find_one({"email": email}):
        return jsonify({"message": "User not found"}), 404

    otp = str(random.randint(1000, 9999))
    otp_store[email] = otp

    send_otp(email, otp)

    return jsonify({"message": "OTP sent"}), 200

# ---------------- RESET PASSWORD ----------------
@app.route("/reset-password", methods=["POST"])
def reset():
    data = request.get_json()

    if otp_store.get(data.get("email")) != data.get("otp"):
        return jsonify({"message": "Invalid OTP"}), 400

    password = data.get("password")

    if not is_strong_password(password):
        return jsonify({"message": "Weak password"}), 400

    users.update_one(
        {"email": data.get("email")},
        {"$set": {"password": generate_password_hash(password)}}
    )

    return jsonify({"message": "Password reset success"}), 200


# ================= TASK MANAGEMENT =================

tasks = []

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()

    task = {
        "id": len(tasks) + 1,
        "title": data.get("title"),
        "description": data.get("description"),
        "status": data.get("status", "pending"),
        "dueDate": data.get("dueDate")
    }

    tasks.append(task)
    return jsonify({"message": "Task created", "task": task}), 201

@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.get_json()

    for task in tasks:
        if task["id"] == id:
            task["title"] = data.get("title")
            task["description"] = data.get("description")
            task["status"] = data.get("status")
            task["dueDate"] = data.get("dueDate")
            return jsonify({"message": "Task updated", "task": task})

    return jsonify({"message": "Task not found"}), 404

@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    global tasks
    tasks = [task for task in tasks if task["id"] != id]
    return jsonify({"message": "Task deleted"})

@app.route('/dashboard', methods=['GET'])
def dashboard():
    total = len(tasks)
    completed = len([t for t in tasks if t["status"] == "completed"])
    pending = len([t for t in tasks if t["status"] == "pending"])

    return jsonify({
        "total": total,
        "completed": completed,
        "pending": pending
    })


# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)