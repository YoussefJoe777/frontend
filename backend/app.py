from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from werkzeug.utils import secure_filename
import time

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # السماح للـ React

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# قاعدة البيانات
def get_db():
    conn = sqlite3.connect("recipes.db")
    conn.row_factory = sqlite3.Row
    return conn

# خدمة الملفات المرفوعة
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# جلب كل الوصفات
@app.route("/recipes", methods=["GET"])
def get_recipes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recipes")
    rows = cursor.fetchall()
    recipes = [dict(row) for row in rows]
    conn.close()
    return jsonify(recipes)

# إضافة وصفة
@app.route("/recipes", methods=["POST"])
def add_recipe():
    title = request.form.get("title")
    description = request.form.get("description")
    category = request.form.get("category")
    image = request.files.get("image")

    if not title or not description or not category:
        return jsonify({"error": "Title, Description and Category are required"}), 400

    filename = None
    if image:
        filename = f"{int(time.time())}_{secure_filename(image.filename)}"
        image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO recipes (title, description, category, image) VALUES (?, ?, ?, ?)",
        (title, description, category, filename)
    )
    conn.commit()
    recipe_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "id": recipe_id,
        "title": title,
        "description": description,
        "category": category,
        "image": filename
    })

# تعديل وصفة
@app.route("/recipes/<int:recipe_id>", methods=["PUT"])
def update_recipe(recipe_id):
    title = request.form.get("title")
    description = request.form.get("description")
    category = request.form.get("category")
    image = request.files.get("image")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT image FROM recipes WHERE id=?", (recipe_id,))
    old_image = cursor.fetchone()["image"]
    filename = old_image

    if image:
        filename = f"{int(time.time())}_{secure_filename(image.filename)}"
        image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

    cursor.execute(
        "UPDATE recipes SET title=?, description=?, category=?, image=? WHERE id=?",
        (title, description, category, filename, recipe_id)
    )
    conn.commit()
    conn.close()

    return jsonify({
        "id": recipe_id,
        "title": title,
        "description": description,
        "category": category,
        "image": filename
    })

# حذف وصفة
@app.route("/recipes/<int:recipe_id>", methods=["DELETE"])
def delete_recipe(recipe_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM recipes WHERE id=?", (recipe_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "id": recipe_id})

if __name__ == "__main__":
    app.run(debug=True)
