# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import time
import hashlib
import jwt
from werkzeug.utils import secure_filename
from functools import wraps
from datetime import datetime

created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# ---------- Configuration ----------
DB_NAME = "recipes.db"
UPLOAD_FOLDER = "uploads"
SECRET_KEY = os.environ.get("RECIPE_SECRET_KEY", "change_this_to_a_strong_secret_in_prod")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SECRET_KEY"] = SECRET_KEY

CORS(app, origins=[CORS_ORIGINS])

# ---------- Database helpers ----------
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    # users table
    # cur.execute("""
    #     CREATE TABLE IF NOT EXISTS users (
    #         id INTEGER PRIMARY KEY AUTOINCREMENT,
    #         username TEXT UNIQUE NOT NULL,
    #         email TEXT UNIQUE NOT NULL,
    #         password_hash TEXT NOT NULL
    #     )
    # """)
    # recipes table
    # cur.execute("""
    #     CREATE TABLE IF NOT EXISTS recipes (
    #         id INTEGER PRIMARY KEY AUTOINCREMENT,
    #         user_id INTEGER,
    #         title TEXT NOT NULL,
    #         description TEXT NOT NULL,
    #         category TEXT NOT NULL,
    #         ingredients TEXT,
    #         image TEXT,
    #         created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    #         FOREIGN KEY (user_id) REFERENCES users(id)
    #     )
    # """)
    conn.commit()
    conn.close()

init_db()

# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def create_token(user_id: int) -> str:
    payload = {"user_id": user_id, "iat": int(time.time())}
    token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")
    # pyjwt v2 returns str, older versions may return bytes
    return token if isinstance(token, str) else token.decode("utf-8")

def decode_token(token: str):
    try:
        return jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except Exception:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth:
            return jsonify({"error": "Authorization header missing"}), 401
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Invalid authorization header"}), 401
        token = auth.replace("Bearer ", "").strip()
        data = decode_token(token)
        if not data:
            return jsonify({"error": "Invalid or expired token"}), 401
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "Invalid token payload"}), 401
        return f(user_id, *args, **kwargs)
    return decorated

# ---------- Routes: auth ----------
@app.route("/register", methods=["POST"])
def register():
    """
    Expects JSON: { username, password }
    """
    try:
        data = request.get_json() or {}
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        conn = get_db()
        cur = conn.cursor()

        # check uniqueness
        cur.execute("SELECT id FROM users WHERE username=?", (username,))
        if cur.fetchone():
            conn.close()
            return jsonify({"error": "Username already taken"}), 400

        password_hash = hash_password(password)
        cur.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)",
                    (username, password_hash))
        conn.commit()
        user_id = cur.lastrowid
        conn.close()

        token = create_token(user_id)
        return jsonify({
            "id": user_id,
            "username": username,
            "token": token
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    """
    Expects JSON: { username, password }
    """
    try:
        data = request.get_json() or {}
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username=?", (username,))
        user = cur.fetchone()
        conn.close()

        if not user:
            return jsonify({"error": "Invalid username or password"}), 401

        if hash_password(password) != user["password_hash"]:
            return jsonify({"error": "Invalid username or password"}), 401

        token = create_token(user["id"])
        return jsonify({
            "token": token,
            "id": user["id"],
            "username": user["username"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/me", methods=["GET"])
@token_required
def get_me(user_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, username FROM users WHERE id=?", (user_id,))
    user = cur.fetchone()
    conn.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(user))


# ---------- Routes: recipes ----------
@app.route("/recipes", methods=["GET"])
def get_recipes():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT recipes.*, users.username 
            FROM recipes 
            JOIN users ON recipes.user_id = users.id
            ORDER BY recipes.created_at DESC
        """)
        rows = cur.fetchall()
        recipes = [dict(r) for r in rows]
        conn.close()
        return jsonify(recipes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/myrecipes", methods=["GET"])
@token_required
def my_recipes(user_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT recipes.*, users.username 
            FROM recipes 
            JOIN users ON recipes.user_id = users.id
            WHERE recipes.user_id=? 
            ORDER BY recipes.created_at DESC
        """, (user_id,))
        rows = cur.fetchall()
        recipes = [dict(r) for r in rows]
        conn.close()
        return jsonify(recipes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/recipes", methods=["POST"])
@token_required
def add_recipe(user_id):
    """
    Create recipe. Expects form-data:
      title, description, category, ingredients (optional), image (optional file)
    """
    try:
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        category = request.form.get("category", "").strip()
        ingredients = request.form.get("ingredients", "").strip()
        image = request.files.get("image")

        if not title or not description or not category:
            return jsonify({"error": "title, description and category are required"}), 400

        filename = None
        if image:
            filename = f"{int(time.time())}_{secure_filename(image.filename)}"
            image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO recipes (user_id, title, description, category, ingredients, image) VALUES (?,?,?,?,?,?)",
            (user_id, title, description, category, ingredients, filename)
        )
        conn.commit()
        recipe_id = cur.lastrowid
        conn.close()

        return jsonify({
            "id": recipe_id,
            "user_id": user_id,
            "title": title,
            "description": description,
            "category": category,
            "ingredients": ingredients,
            "image": filename
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/recipes/<int:recipe_id>", methods=["PUT"])
@token_required
def update_recipe(user_id, recipe_id):
    """
    Update a recipe. Only owner can update.
    Expects form-data similar to POST.
    """
    try:
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        category = request.form.get("category", "").strip()
        ingredients = request.form.get("ingredients", "").strip()
        image = request.files.get("image")

        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM recipes WHERE id=? AND user_id=?", (recipe_id, user_id))
        recipe = cur.fetchone()
        if not recipe:
            conn.close()
            return jsonify({"error": "Recipe not found or unauthorized"}), 404

        filename = recipe["image"]
        if image:
            # delete old file if exists
            if filename:
                old_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                try:
                    if os.path.exists(old_path):
                        os.remove(old_path)
                except Exception:
                    pass
            filename = f"{int(time.time())}_{secure_filename(image.filename)}"
            image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        # if client didn't send some fields, keep existing values
        new_title = title if title else recipe["title"]
        new_description = description if description else recipe["description"]
        new_category = category if category else recipe["category"]
        new_ingredients = ingredients if ingredients else recipe["ingredients"]

        cur.execute(
            "UPDATE recipes SET title=?, description=?, category=?, ingredients=?, image=? WHERE id=?",
            (new_title, new_description, new_category, new_ingredients, filename, recipe_id)
        )
        conn.commit()
        conn.close()

        return jsonify({
            "id": recipe_id,
            "user_id": user_id,
            "title": new_title,
            "description": new_description,
            "category": new_category,
            "ingredients": new_ingredients,
            "image": filename
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/recipes/<int:recipe_id>", methods=["DELETE"])
@token_required
def delete_recipe(user_id, recipe_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM recipes WHERE id=? AND user_id=?", (recipe_id, user_id))
        recipe = cur.fetchone()
        if not recipe:
            conn.close()
            return jsonify({"error": "Recipe not found or unauthorized"}), 404

        # delete image file if exists
        if recipe["image"]:
            path = os.path.join(app.config["UPLOAD_FOLDER"], recipe["image"])
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass

        cur.execute("DELETE FROM recipes WHERE id=?", (recipe_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": recipe_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------- Static files ----------
@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ---------- Run ----------
if __name__ == "__main__":
    print("Starting backend on http://127.0.0.1:5000")
    app.run(debug=True)
