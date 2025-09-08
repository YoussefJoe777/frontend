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
  const [image, setImage] = useState(null); // لتخزين الصورة المرفوعة

  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Other"];

  useEffect(() => {
    fetch("http://127.0.0.1:5000/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  // إضافة وصفة
  const handleAdd = async () => {
    if (!title.trim() || !description.trim() || !category.trim()) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:5000/recipes", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + (err.error || "Something went wrong"));
        return;
      }

      const data = await res.json();
      setRecipes([...recipes, data]);
      setTitle("");
      setDescription("");
      setCategory("");
      setImage(null);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // تفعيل وضع التعديل
  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setEditTitle(recipe.title);
    setEditDescription(recipe.description);
    setEditCategory(recipe.category || "");
    setImage(null);
  };

  // تحديث وصفة
  const handleUpdate = async () => {
    if (!editTitle.trim() || !editDescription.trim() || !editCategory.trim()) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    formData.append("category", editCategory);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`http://127.0.0.1:5000/recipes/${editingId}`, {
        method: "PUT",
        body: formData
      });

      if (!res.ok) throw new Error("Failed to update recipe");
      const updatedRecipe = await res.json();
      setRecipes(prev => prev.map(r => (r.id === updatedRecipe.id ? updatedRecipe : r)));
      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      setEditCategory("");
      setImage(null);
    } catch (error) {
      alert(error.message);
    }
  };

  // حذف وصفة
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/recipes/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete recipe");
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredRecipes = recipes.filter(r =>
    (r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())) &&
    (filterCategory ? r.category === filterCategory : true)
  );

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">📖 Recipe Manager</h1>

      {/* Add Recipe Form */}
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
        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            onChange={e => setImage(e.target.files[0])}
            key={image ? image.name : Date.now()}
          />
          {image && <small className="text-muted">Selected file: {image.name}</small>}
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>➕ Add Recipe</button>
      </div>

      {/* Recipes List */}
      <div className="card p-4 shadow-sm">
        <h4>All Recipes</h4>

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
              <li key={r.id} className="list-group-item">
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
                    <input
                      type="file"
                      className="form-control mb-2"
                      onChange={e => setImage(e.target.files[0])}
                    />
                    {image && <small className="text-muted">Selected file: {image.name}</small>}
                      <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-success btn-sm" onClick={handleUpdate}>💾 Save</button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditingId(null);
                          setImage(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-start gap-3">
                    {r.image && (
                      <img
                        src={`http://127.0.0.1:5000/uploads/${r.image}`}
                        alt={r.title}
                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        className="rounded"
                      />
                    )}
                    <div className="flex-grow-1">
                      <strong>{r.title}</strong>{" "}
                      <span className="badge bg-info">{r.category}</span>
                      <p className="mb-1 text-muted">{r.description}</p>
                      <div className="d-flex gap-2">
                        <button className="btn btn-warning btn-sm" onClick={() => handleEdit(r)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>❌ Delete</button>
                      </div>
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
