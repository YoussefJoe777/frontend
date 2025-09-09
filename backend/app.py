from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from werkzeug.utils import secure_filename
import time

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ----------------- Database -----------------
DB_NAME = "recipes.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            ingredients TEXT,
            image TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()  # تأكد إن الجدول موجود

# ----------------- Routes -----------------
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/recipes", methods=["GET"])
def get_recipes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recipes")
    rows = cursor.fetchall()
    recipes = [dict(row) for row in rows]
    conn.close()
    return jsonify(recipes)

@app.route("/recipes", methods=["POST"])
def add_recipe():
    try:
        title = request.form.get("title")
        description = request.form.get("description")
        category = request.form.get("category")
        ingredients = request.form.get("ingredients")
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
            "INSERT INTO recipes (title, description, category, ingredients, image) VALUES (?, ?, ?, ?, ?)",
            (title, description, category, ingredients, filename)
        )
        conn.commit()
        recipe_id = cursor.lastrowid
        conn.close()

        return jsonify({
            "id": recipe_id,
            "title": title,
            "description": description,
            "category": category,
            "ingredients": ingredients,
            "image": filename
        })
    except Exception as e:
        print("Error in POST /recipes:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/recipes/<int:recipe_id>", methods=["PUT"])
def update_recipe(recipe_id):
    try:
        title = request.form.get("title")
        description = request.form.get("description")
        category = request.form.get("category")
        ingredients = request.form.get("ingredients")
        image = request.files.get("image")

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT image FROM recipes WHERE id=?", (recipe_id,))
        old_row = cursor.fetchone()
        if not old_row:
            return jsonify({"error": "Recipe not found"}), 404

        old_image = old_row["image"]
        filename = old_image

        if image:
            # حذف الصورة القديمة لو موجودة
            if old_image:
                old_path = os.path.join(app.config["UPLOAD_FOLDER"], old_image)
                if os.path.exists(old_path):
                    os.remove(old_path)

            filename = f"{int(time.time())}_{secure_filename(image.filename)}"
            image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        cursor.execute(
            "UPDATE recipes SET title=?, description=?, category=?, ingredients=?, image=? WHERE id=?",
            (title, description, category, ingredients, filename, recipe_id)
        )
        conn.commit()
        conn.close()

        return jsonify({
            "id": recipe_id,
            "title": title,
            "description": description,
            "category": category,
            "ingredients": ingredients,
            "image": filename
        })
    except Exception as e:
        print("Error in PUT /recipes:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/recipes/<int:recipe_id>", methods=["DELETE"])
def delete_recipe(recipe_id):
    conn = get_db()
    cursor = conn.cursor()
    # جلب اسم الصورة قبل الحذف
    cursor.execute("SELECT image FROM recipes WHERE id=?", (recipe_id,))
    row = cursor.fetchone()
    if row and row["image"]:
        image_path = os.path.join(app.config["UPLOAD_FOLDER"], row["image"])
        if os.path.exists(image_path):
            os.remove(image_path)

    cursor.execute("DELETE FROM recipes WHERE id=?", (recipe_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "id": recipe_id})

# ----------------- Run App -----------------
if __name__ == "__main__":
    app.run(debug=True)
