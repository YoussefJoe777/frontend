from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect("recipes.db")
    conn.row_factory = sqlite3.Row
    print( "Database connection established." )
    return conn

# with get_db() as db:
#     db.execute("""
#         CREATE TABLE IF NOT EXISTS recipes (
#             id INTEGER PRIMARY KEY AUTOINCREMENT,
#             title TEXT NOT NULL,
#             description TEXT
#         )
#     """)

@app.route("/")
def index():
    return "Welcome to the Recipe API!"

@app.route("/recipes", methods=["GET"])
def get_recipes():
    db = get_db()
    recipes = db.execute("SELECT * FROM recipes").fetchall()
    return jsonify([dict(r) for r in recipes])
    # return ("hello")

@app.route("/recipes", methods=["POST"])
def add_recipe():
    data = request.get_json()
    title = data.get("title")
    description = data.get("description")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    db = get_db()
    db.execute("INSERT INTO recipes (title, description) VALUES (?, ?)", (title, description))
    db.commit()
    return jsonify({"message": "Recipe added successfully!"}), 201

@app.route("/recipes/<int:recipe_id>", methods=["DELETE"])
def delete_recipe(recipe_id):
    db = get_db()
    db.execute("DELETE FROM recipes WHERE id = ?", (recipe_id,))
    db.commit()
    return jsonify({"message": "Recipe deleted"}), 200

if __name__ == "__main__":
    app.run(debug=True)
