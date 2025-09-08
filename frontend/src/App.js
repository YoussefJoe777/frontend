import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [search, setSearch] = useState(""); 
  const [filterCategory, setFilterCategory] = useState(""); 

  // ✅ Categories List
  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Other"];

  useEffect(() => {
    fetch("http://127.0.0.1:5000/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  const handleAdd = () => {
    if (!title.trim() || !description.trim() || !category.trim()) {
      alert("Title, Description and Category are required!");
      return;
    }
    fetch("http://127.0.0.1:5000/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category })
    })
      .then(res => res.json())
      .then(newRecipe => {
        setRecipes(prev => [...prev, newRecipe]);
        setTitle("");
        setDescription("");
        setCategory("");
      });
  };

  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setEditTitle(recipe.title);
    setEditDescription(recipe.description);
    setEditCategory(recipe.category || "");
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editDescription.trim() || !editCategory.trim()) {
  alert("All fields are required!");
  return;
}
    try {
      const res = await fetch(`http://127.0.0.1:5000/recipes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription, category: editCategory })
      });
      if (!res.ok) throw new Error("Failed to update recipe");
      const updatedRecipe = await res.json();
      setRecipes(prev =>
        prev.map(r => (r.id === updatedRecipe.id ? updatedRecipe : r))
      );
      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      setEditCategory("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/recipes/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete recipe");
      setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ Search & Category Filter
  const filteredRecipes = recipes.filter(r =>
    (r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())) &&
    (filterCategory ? r.category === filterCategory : true)
  );

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">📖 Recipe Manager</h1>

      {/* Form */}
      <div className="card p-4 shadow-sm mb-4">
        <h4>Add Recipe</h4>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Description"
            rows="3"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <select
            className="form-control"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          ➕ Add Recipe
        </button>
      </div>

      {/* Recipes List */}
      <div className="card p-4 shadow-sm">
        <h4>All Recipes</h4>

        {/* ✅ Search + Filter */}
        <div className="d-flex gap-2 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="form-control"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {filteredRecipes.length === 0 ? (
          <p className="text-muted">No recipes found.</p>
        ) : (
          <ul className="list-group">
            {filteredRecipes.map(r => (
              <li
                key={r.id}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                {editingId === r.id ? (
                  <div className="w-100">
                    <input
                      className="form-control mb-2"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="Edit Title"
                    />
                    <textarea
                      className="form-control mb-2"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Edit Description"
                      rows="2"
                    />
                    <select
                      className="form-control mb-2"
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm" onClick={handleUpdate}>
                        💾 Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between w-100 align-items-center">
                    <div>
                      <strong>{r.title}</strong> <span className="badge bg-info">{r.category}</span>
                      <p className="mb-0 text-muted">{r.description}</p>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEdit(r)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(r.id)}
                      >
                        ❌ Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
