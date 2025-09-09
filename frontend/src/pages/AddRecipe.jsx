import { useState } from "react";

function AddRecipe({ darkMode, user }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [image, setImage] = useState(null);

  // ✅ اللستة الجاهزة
  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !category.trim()) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("ingredients", ingredients);
    if (image) {
      formData.append("image", image);
    }

    const res = await fetch("http://127.0.0.1:5000/recipes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`, // 🔑 التوكن مهم
      },
      body: formData,
    });

    if (res.ok) {
      alert("Recipe added successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setIngredients("");
      setImage(null);
    } else {
      const errData = await res.json();
      alert("Failed to add recipe: " + (errData.error || res.statusText));
    }
  };

  return (
    <div>
      <h2 className="mb-4">Add New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Category</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Ingredients</label>
          <textarea
          placeholder="one ingredient per line"
            className="form-control"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Image</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button className="btn btn-success" type="submit">
          Add Recipe
        </button>
      </form>
    </div>
  );
}

export default AddRecipe;
