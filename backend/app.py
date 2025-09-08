from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect("recipes.db")
    conn.row_factory = sqlite3.Row
    return conn


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
    data = request.json
    title = data.get("title")
    description = data.get("description")
    category = data.get("category")

    if not title or not description:
        return jsonify({"error": "Title and Description are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO recipes (title, description, category) VALUES (?, ?, ?)",
                   (title, description, category))
    conn.commit()
    recipe_id = cursor.lastrowid
    conn.close()

    return jsonify({"id": recipe_id, "title": title, "description": description, "category": category})

@app.route("/recipes/<int:recipe_id>", methods=["PUT"])
def update_recipe(recipe_id):
    data = request.json
    title = data.get("title")
    description = data.get("description")
    category = data.get("category")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE recipes SET title=?, description=?, category=? WHERE id=?",
                   (title, description, category, recipe_id))
    conn.commit()
    conn.close()

    return jsonify({"id": recipe_id, "title": title, "description": description, "category": category})

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
