import { useEffect, useState } from "react";

function MyRecipes({ darkMode, user }) {
  const [recipes, setRecipes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editIngredients, setEditIngredients] = useState("");
  const [image, setImage] = useState(null);

  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Other"];

  const categoryColors = {
    Breakfast: "bg-warning",
    Lunch: "bg-success",
    Dinner: "bg-primary",
    Dessert: "bg-danger",
    Snack: "bg-info",
    Other: "bg-secondary",
  };

  const categoryBgColors = {
    Breakfast: "bg-light-warning",
    Lunch: "bg-light-success",
    Dinner: "bg-light-primary",
    Dessert: "bg-light-danger",
    Snack: "bg-light-info",
    Other: "bg-light-secondary",
  };

  useEffect(() => {
    if (!user) return;
    fetch("http://127.0.0.1:5000/myrecipes", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setRecipes(data));
  }, [user]);

  const handleEdit = (r) => {
    setEditingId(r.id);
    setEditTitle(r.title);
    setEditDescription(r.description);
    setEditCategory(r.category);
    setEditIngredients(r.ingredients || "");
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    formData.append("category", editCategory);
    formData.append("ingredients", editIngredients);
    if (image) formData.append("image", image);

    const res = await fetch(`http://127.0.0.1:5000/recipes/${editingId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${user.token}` },
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingId(null);
      setImage(null);
    } else {
      alert("Failed to update recipe");
    }
  };

  // 🗑️ هنا بنضيف حذف
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    const res = await fetch(`http://127.0.0.1:5000/recipes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });

    if (res.ok) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Failed to delete recipe");
    }
  };

  return (
    <div>
      <h2 className="mb-4">My Recipes</h2>
      <div className="row">
        {recipes.map((r) => (
          <div key={r.id} className="col-md-4 mb-3">
            <div className={`card ${categoryBgColors[r.category] || "bg-light"}`}>
              {editingId === r.id ? (
                <div className="card-body">
                  <input
                    className="form-control mb-2"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="form-control mb-2"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <select
                    className="form-control mb-2"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <textarea
                    className="form-control mb-2"
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                  />
                  <input
                    type="file"
                    className="form-control mb-2"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  <button className="btn btn-success btn-sm" onClick={handleUpdate}>
                    Save
                  </button>
                  <button
                    className="btn btn-secondary btn-sm ms-2"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {r.image && (
                    <img
                      src={`http://127.0.0.1:5000/uploads/${r.image}`}
                      className="card-img-top"
                      alt={r.title}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h5>
                      {r.title}{" "}
                      <span className={`badge ${categoryColors[r.category] || "bg-secondary"}`}>
                        {r.category}
                      </span>
                    </h5>
                    <p>{r.description}</p>
                    {r.ingredients && (
                      <ul>
                        {r.ingredients.split("\n").map((ing, i) => (
                          <li key={i}>{ing.trim()}</li>
                        ))}
                      </ul>
                    )}
                    <div className="d-flex gap-2">
                      <button className="btn btn-warning btn-sm" onClick={() => handleEdit(r)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyRecipes;
