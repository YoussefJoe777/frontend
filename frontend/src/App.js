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
  const [image, setImage] = useState(null);

  const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Other"];

  useEffect(() => {
    fetch("http://127.0.0.1:5000/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  const handleAdd = async () => {
    if (!title || !description || !category) return alert("All fields required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:5000/recipes", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to add recipe");
      const data = await res.json();
      setRecipes([...recipes, data]);
      setTitle(""); setDescription(""); setCategory(""); setImage(null);
    } catch (err) { alert(err.message); }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setEditTitle(r.title);
    setEditDescription(r.description);
    setEditCategory(r.category);
    setImage(null);
  };

  const handleUpdate = async () => {
    if (!editTitle || !editDescription || !editCategory) return alert("All fields required");
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    formData.append("category", editCategory);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`http://127.0.0.1:5000/recipes/${editingId}`, { method: "PUT", body: formData });
      if (!res.ok) throw new Error("Failed to update recipe");
      const updated = await res.json();
      setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditingId(null); setImage(null);
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete recipe");
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err) { alert(err.message); }
  };

  const filtered = recipes.filter(r =>
    (r.title.toLowerCase().includes(search.toLowerCase()) ||
     r.description.toLowerCase().includes(search.toLowerCase())) &&
    (filterCategory ? r.category === filterCategory : true)
  );

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">📖 Recipe Navigator</h1>

      {/* Add Recipe */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5>Add New Recipe</h5>
        <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <select className="form-control mb-2" value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(c=><option key={c}>{c}</option>)}
        </select>
        <input type="file" className="form-control mb-2" onChange={e=>setImage(e.target.files[0])} />
        {image && <div className="mb-2"><img src={URL.createObjectURL(image)} alt="preview" style={{width:100,height:100,objectFit:"cover"}} /></div>}
        <button className="btn btn-primary" onClick={handleAdd}>➕ Add Recipe</button>
      </div>

      {/* Search & Filter */}
      <div className="d-flex gap-2 mb-3">
        <input type="text" className="form-control" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="form-control" value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Recipes Grid */}
      <div className="row">
        {filtered.map(r => (
          <div key={r.id} className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              {editingId===r.id ? (
                <div className="card-body">
                  <input className="form-control mb-2" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
                  <textarea className="form-control mb-2" value={editDescription} onChange={e=>setEditDescription(e.target.value)} />
                  <select className="form-control mb-2" value={editCategory} onChange={e=>setEditCategory(e.target.value)}>
                    {categories.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <input type="file" className="form-control mb-2" onChange={e=>setImage(e.target.files[0])} />
                  <div className="d-flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={handleUpdate}>💾 Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={()=>{setEditingId(null); setImage(null)}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {r.image && <img src={`http://127.0.0.1:5000/uploads/${r.image}`} className="card-img-top" style={{height:200,objectFit:"cover"}} alt="" />}
                  <div className="card-body">
                    <h5>{r.title} <span className="badge bg-info">{r.category}</span></h5>
                    <p>{r.description}</p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-warning btn-sm" onClick={()=>handleEdit(r)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(r.id)}>❌ Delete</button>
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

export default App;
