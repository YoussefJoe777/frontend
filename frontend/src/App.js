import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MyRecipes from "./pages/MyRecipes";
import AddRecipe from "./pages/AddRecipe";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light text-dark min-vh-100"}>
        {/* 🔹 Navbar */}
        <nav className={`navbar navbar-expand-lg ${darkMode ? "navbar-dark bg-dark" : "navbar-light bg-light"} p-3 mb-4`}>
        <Link className="navbar-brand fw-bold" to="/">Recipe Navigator</Link>
        <div className="d-flex gap-2">
            <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-primary"}`} to="/">Discover</Link>

            {user && (
            <>
                <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-success"}`} to="/myrecipes">
                My Recipes
                </Link>
                <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-warning"}`} to="/add">
                Add Recipe
                </Link>
            </>
            )}

            {!user ? (
            <>
                <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-secondary"}`} to="/login">Login</Link>
                <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-info"}`} to="/register">Register</Link>
            </>
            ) : (
            <>
                {/* ✅ الترحيب */}
                <span className="navbar-text me-3">
                👋 Hi, <strong>{user.username}</strong>
                </span>
                <button
                className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-danger"}`}
                onClick={handleLogout}
                >
                Logout
                </button>
            </>
            )}

            <button
            className={`btn ${darkMode ? "btn-light" : "btn-dark"}`}
            onClick={() => setDarkMode(!darkMode)}
            >
            {darkMode ? "🌞 Light" : "🌙 Dark"}
            </button>
        </div>
        </nav>


        {/* 🔹 Routes */}
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage darkMode={darkMode} />} />

            <Route
              path="/myrecipes"
              element={user ? <MyRecipes darkMode={darkMode} user={user} /> : <Navigate to="/login" />}
            />

            <Route
              path="/add"
              element={user ? <AddRecipe darkMode={darkMode} user={user} /> : <Navigate to="/login" />}
            />

            <Route
              path="/login"
              element={<Login darkMode={darkMode} onLogin={handleLogin} />}
            />

            <Route
              path="/register"
              element={<Register darkMode={darkMode} onRegister={handleLogin} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;



// import { useEffect, useState } from "react";  
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./App.css";

// function App() {
//   const [recipes, setRecipes] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("");
//   const [ingredients, setIngredients] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [editTitle, setEditTitle] = useState("");
//   const [editDescription, setEditDescription] = useState("");
//   const [editCategory, setEditCategory] = useState("");
//   const [editIngredients, setEditIngredients] = useState("");
//   const [search, setSearch] = useState("");
//   const [filterCategory, setFilterCategory] = useState("");
//   const [image, setImage] = useState(null);
//   const [darkMode, setDarkMode] = useState(false);
//   const [modalRecipe, setModalRecipe] = useState(null);
  
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   const categories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Other"];
//   const categoryColors = {
//     Breakfast: "bg-warning",
//     Lunch: "bg-success",
//     Dinner: "bg-primary",
//     Dessert: "bg-danger",
//     Snack: "bg-info",
//     Other: "bg-secondary"
//   };
//   const categoryBgColors = {
//     Breakfast: "bg-light-warning",
//     Lunch: "bg-light-success",
//     Dinner: "bg-light-primary",
//     Dessert: "bg-light-danger",
//     Snack: "bg-light-info",
//     Other: "bg-light-secondary"
//   };

//   // Fetch recipes
//   useEffect(() => {
//     fetch("http://127.0.0.1:5000/recipes")
//       .then(res => res.json())
//       .then(data => setRecipes(data));
//   }, []);

//   // Dark mode toggle
//   useEffect(() => {
//     document.body.classList.toggle("dark-mode", darkMode);
//   }, [darkMode]);

//   // Lock scroll when modal is open
//   useEffect(() => {
//     document.body.style.overflow = modalRecipe ? "hidden" : "auto";
//   }, [modalRecipe]);

//   // Add recipe
//   const handleAdd = async () => {
//     if (!title || !description || !category || !ingredients) return alert("All fields required");
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("category", category);
//     formData.append("ingredients", ingredients);
//     if (image) formData.append("image", image);

//     try {
//       const res = await fetch("http://127.0.0.1:5000/recipes", { method: "POST", body: formData });
//       if (!res.ok) throw new Error("Failed to add recipe");
//       const data = await res.json();
//       setRecipes([...recipes, data]);
//       setTitle(""); setDescription(""); setCategory(""); setIngredients(""); setImage(null);
//     } catch (err) { alert(err.message); }
//   };

//   // Edit
//   const handleEdit = (r) => {
//     setEditingId(r.id);
//     setEditTitle(r.title);
//     setEditDescription(r.description);
//     setEditCategory(r.category);
//     setEditIngredients(r.ingredients || "");
//     setImage(null);
//   };

//   // Update
//   const handleUpdate = async () => {
//     if (!editTitle || !editDescription || !editCategory || !editIngredients) return alert("All fields required");
//     const formData = new FormData();
//     formData.append("title", editTitle);
//     formData.append("description", editDescription);
//     formData.append("category", editCategory);
//     formData.append("ingredients", editIngredients);
//     if (image) formData.append("image", image);

//     try {
//       const res = await fetch(`http://127.0.0.1:5000/recipes/${editingId}`, { method: "PUT", body: formData });
//       if (!res.ok) throw new Error("Failed to update recipe");
//       const updated = await res.json();
//       setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
//       setEditingId(null); setImage(null);
//     } catch (err) { alert(err.message); }
//   };

//   // Delete
//   const handleDelete = async (id) => {
//   const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
//   if (!confirmDelete) return; // لو المستخدم ضغط إلغاء، ما نحذفش

//   try {
//     const res = await fetch(`http://127.0.0.1:5000/recipes/${id}`, { method: "DELETE" });
//     if (!res.ok) throw new Error("Failed to delete recipe");
//     setRecipes(prev => prev.filter(r => r.id !== id));
//   } catch (err) { 
//     alert(err.message); 
//   }
// };


//   // Filtered & Search
//   const filtered = recipes.filter(r =>
//     (r.title.toLowerCase().includes(search.toLowerCase()) ||
//      r.description.toLowerCase().includes(search.toLowerCase())) &&
//     (filterCategory ? r.category === filterCategory : true)
//   );

//   // Pagination
//   const totalPages = Math.ceil(filtered.length / itemsPerPage);
//   const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   return (
//     <div className="container my-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h1>📖 Recipe Navigator</h1>
//         <button className="btn btn-dark" onClick={() => setDarkMode(!darkMode)}>
//           {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
//         </button>
//       </div>

//       {/* Add Recipe */}
//       <div className="card p-4 mb-4 shadow-sm">
//         <h5>Add New Recipe</h5>
//         <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
//         <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
//         <select className="form-control mb-2" value={category} onChange={e=>setCategory(e.target.value)}>
//           <option value="">Select Category</option>
//           {categories.map(c=><option key={c}>{c}</option>)}
//         </select>
//         <textarea className="form-control mb-2" placeholder="Ingredients (one per line)" value={ingredients} onChange={e => setIngredients(e.target.value)} />
//         <input type="file" className="form-control mb-2" onChange={e=>setImage(e.target.files[0])} />
//         {image && <div className="mb-2"><img src={URL.createObjectURL(image)} alt="preview" style={{width:100,height:100,objectFit:"cover"}} /></div>}
//         <button className="btn btn-primary" onClick={handleAdd}>➕ Add Recipe</button>
//       </div>

//       {/* Search & Filter */}
//       <div className="d-flex gap-2 mb-3">
//         <input type="text" className="form-control" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
//         <select className="form-control" value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
//           <option value="">All Categories</option>
//           {categories.map(c=><option key={c}>{c}</option>)}
//         </select>
//       </div>

//       {/* Recipes Grid */}
//       <div className="row">
//         {paginated.map(r => (
//           <div key={r.id} className="col-md-4 mb-3">
//             <div className={`card h-100 shadow-sm card-hover ${categoryBgColors[r.category] || "bg-light"}`}>
//               {editingId===r.id ? (
//                 <div className="card-body">
//                   <input className="form-control mb-2" value={editTitle} onChange={e=>setEditTitle(e.target.value)} />
//                   <textarea className="form-control mb-2" value={editDescription} onChange={e=>setEditDescription(e.target.value)} />
//                   <select className="form-control mb-2" value={editCategory} onChange={e=>setEditCategory(e.target.value)}>
//                     {categories.map(c=><option key={c}>{c}</option>)}
//                   </select>
//                   <textarea className="form-control mb-2" placeholder="Ingredients" value={editIngredients} onChange={e=>setEditIngredients(e.target.value)} />
//                   <input type="file" className="form-control mb-2" onChange={e=>setImage(e.target.files[0])} />
//                   <div className="d-flex gap-2">
//                     <button className="btn btn-success btn-sm" onClick={handleUpdate}>💾 Save</button>
//                     <button className="btn btn-secondary btn-sm" onClick={()=>{setEditingId(null); setImage(null)}}>Cancel</button>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   {r.image && (
//                     <img
//                       src={`http://127.0.0.1:5000/uploads/${r.image}`}
//                       className="card-img-top"
//                       style={{height:200, objectFit:"cover", cursor:"pointer"}}
//                       alt={r.title}
//                       onClick={() => setModalRecipe(r)}
//                     />
//                   )}
//                   <div className="card-body">
//                     <h5>{r.title} <span className={`badge ${categoryColors[r.category] || "bg-secondary"}`}>{r.category}</span></h5>
//                     <p>{r.description}</p>
//                     {r.ingredients && (
//                       <ul>{r.ingredients.split("\n").map((ing,i) => <li key={i}>{ing.trim()}</li>)}</ul>
//                     )}
//                     <div className="d-flex gap-2">
//                       <button className="btn btn-warning btn-sm" onClick={()=>handleEdit(r)}>✏️ Edit</button>
//                       <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(r.id)}>❌ Delete</button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Pagination */}
//       <div className="d-flex justify-content-center mt-3 gap-2 align-items-center">
//         <button className="btn btn-sm btn-outline-primary" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage===1}>← Previous</button>
//         {Array.from({ length: totalPages }, (_, i) => (
//           <button key={i+1} className={`btn btn-sm ${currentPage===i+1 ? "btn-primary" : "btn-outline-primary"}`} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
//         ))}
//         <button className="btn btn-sm btn-outline-primary" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage===totalPages}>Next →</button>
//       </div>

//       {/* Modal Overlay */}
//       {modalRecipe && (
//         <div className="modal-overlay" onClick={()=>setModalRecipe(null)}>
//           <div className="modal-content" onClick={e=>e.stopPropagation()}>
//             <span className="modal-close" onClick={()=>setModalRecipe(null)}>×</span>
//             {modalRecipe.image && (
//               <img src={`http://127.0.0.1:5000/uploads/${modalRecipe.image}`} style={{width:"100%", maxHeight:"60vh", objectFit:"contain", borderRadius:"10px", marginBottom:"15px"}} alt={modalRecipe.title} />
//             )}
//             <h3>{modalRecipe.title}</h3>
//             <span className={`badge ${categoryColors[modalRecipe.category] || "bg-secondary"}`}>{modalRecipe.category}</span>
//             {modalRecipe.ingredients && <ul className="mt-2">{modalRecipe.ingredients.split("\n").map((ing,i)=><li key={i}>{ing.trim()}</li>)}</ul>}
//             <p className="mt-2">{modalRecipe.description}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
