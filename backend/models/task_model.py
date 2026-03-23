from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB Config
app.config["MONGO_URI"] = "mongodb://localhost:27017/task_manager"
mongo = PyMongo(app)

# ================= CREATE TASK =================
@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json

    task = {
        "title": data.get("title"),
        "description": data.get("description"),
        "status": data.get("status", "pending"),
        "dueDate": data.get("dueDate")
    }

    result = mongo.db.tasks.insert_one(task)
    return jsonify({"message": "Task created", "id": str(result.inserted_id)})

# ================= GET ALL TASKS =================
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = []
    for task in mongo.db.tasks.find():
        task["_id"] = str(task["_id"])
        tasks.append(task)
    return jsonify(tasks)

# ================= UPDATE TASK =================
@app.route('/tasks/<id>', methods=['PUT'])
def update_task(id):
    data = request.json

    mongo.db.tasks.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "title": data.get("title"),
            "description": data.get("description"),
            "status": data.get("status"),
            "dueDate": data.get("dueDate")
        }}
    )

    return jsonify({"message": "Task updated"})

# ================= DELETE TASK =================
@app.route('/tasks/<id>', methods=['DELETE'])
def delete_task(id):
    mongo.db.tasks.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Task deleted"})

# ================= DASHBOARD =================
@app.route('/dashboard', methods=['GET'])
def dashboard():
    total = mongo.db.tasks.count_documents({})
    completed = mongo.db.tasks.count_documents({"status": "completed"})
    pending = mongo.db.tasks.count_documents({"status": "pending"})

    return jsonify({
        "total": total,
        "completed": completed,
        "pending": pending
    })

# ================= RUN =================
if __name__ == '__main__':
    app.run(debug=True)