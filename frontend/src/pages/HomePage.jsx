import { useEffect, useState } from "react";

function HomePage({ darkMode }) {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalRecipe, setModalRecipe] = useState(null);

  const itemsPerPage = 6;

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
    Breakfast: "bg-warning bg-opacity-25",
    Lunch: "bg-success bg-opacity-25",
    Dinner: "bg-primary bg-opacity-25",
    Dessert: "bg-danger bg-opacity-25",
    Snack: "bg-info bg-opacity-25",
    Other: "bg-secondary bg-opacity-25",
  };

  // Fetch recipes
  useEffect(() => {
    fetch("http://127.0.0.1:5000/recipes")
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch((err) => console.error("Error fetching recipes:", err));
  }, []);

  // Filter + search
  const filtered = recipes.filter(
    (r) =>
      (r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())) &&
      (filterCategory ? r.category === filterCategory : true)
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container my-4">
      <h2 className="mb-4">🍳 Discover Recipes</h2>

      {/* Search & Filter */}
      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-control"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Recipes Grid */}
      <div className="row">
        {paginated.map((r) => (
          <div key={r.id} className="col-md-4 mb-3">
            <div
              className={`card h-100 shadow-sm ${categoryBgColors[r.category] || "bg-light"}`}
            >
              {r.image && (
                <img
                  src={`http://127.0.0.1:5000/uploads/${r.image}`}
                  className="card-img-top"
                  alt={r.title}
                  style={{ height: 200, objectFit: "cover", cursor: "pointer" }}
                  onClick={() => setModalRecipe(r)}
                />
              )}
              <div className="card-body">
                <h5>
                  {r.title}{" "}
                  <span
                    className={`badge ${categoryColors[r.category] || "bg-secondary"}`}
                  >
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
                  <p><strong>By:</strong> {r.username}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-3 gap-2 align-items-center">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`btn btn-sm ${
              currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>

      {/* Modal Overlay */}
      {modalRecipe && (
        <div
          className="modal-overlay"
          onClick={() => setModalRecipe(null)}
            style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",   // ✅ بدل 100%
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            }}

        >
          <div
            className={`modal-content p-3 rounded shadow-lg ${
              darkMode ? "bg-dark text-light" : "bg-white text-dark"
            }`}
            style={{ maxWidth: "600px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn-close float-end"
              onClick={() => setModalRecipe(null)}
            ></button>
            {modalRecipe.image && (
              <img
                src={`http://127.0.0.1:5000/uploads/${modalRecipe.image}`}
                className="img-fluid rounded mb-3"
                alt={modalRecipe.title}
              />
            )}
            <h3>{modalRecipe.title}</h3>
            <span
              className={`badge ${categoryColors[modalRecipe.category] || "bg-secondary"}`}
            >
              {modalRecipe.category}
            </span>
            {modalRecipe.ingredients && (
              <ul className="mt-3">
                {modalRecipe.ingredients.split("\n").map((ing, i) => (
                  <li key={i}>{ing.trim()}</li>
                ))}
              </ul>
            )}
            <p className="mt-3">{modalRecipe.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
