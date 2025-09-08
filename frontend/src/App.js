import { useEffect, useState } from "react";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // جلب الوصفات عند تحميل الصفحة
  useEffect(() => {
    fetch("http://127.0.0.1:5000/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  // إضافة وصفة
  const handleAdd = () => {
    fetch("http://127.0.0.1:5000/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    })
      .then(res => res.json())
      .then(() => {
        setRecipes([...recipes, { title, description }]);
        setTitle("");
        setDescription("");
      });
  };

  // حذف وصفة
  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:5000/recipes/${id}`, { method: "DELETE" })
      .then(() => setRecipes(recipes.filter(r => r.id !== id)));
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1>📖 Recipe Manager</h1>

      <h2>Add Recipe</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>

      <h2>All Recipes</h2>
      <ul>
        {recipes.map(r => (
          <li key={r.id}>
            <strong>{r.title}</strong>: {r.description}
            <button onClick={() => handleDelete(r.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
