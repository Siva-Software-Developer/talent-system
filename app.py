from flask import Flask, request, jsonify
from flask_cors import CORS
from database import users
from werkzeug.security import generate_password_hash, check_password_hash
import re

app = Flask(__name__)
CORS(app)

# ---------------- PASSWORD VALIDATION ----------------
def is_strong_password(password):
    if (len(password) >= 8 and
        re.search(r"[A-Z]", password) and
        re.search(r"[a-z]", password) and
        re.search(r"[0-9]", password) and
        re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)):
        return True
    return False

# ---------------- HOME ----------------
@app.route("/")
def home():
    return jsonify({"message": "Backend running 🔥"})

# ---------------- REGISTER ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    
    if not name or not email or not password:
        return jsonify({"message": "All fields required "}), 400

    
    if not is_strong_password(password):
        return jsonify({
            "message": "Password must contain uppercase, lowercase, number, special character and be at least 8 characters "
        }), 400

    
    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists "}), 409


    hashed_password = generate_password_hash(password)

    
    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User Registered Successfully "}), 201

# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})


    if not user:
        return jsonify({"message": "User not found "}), 404

    
    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid Credentials "}), 401

    return jsonify({"message": "Login Success "}), 200

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)