import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

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
    toast.success(`👋 Welcome, ${userData.username}!`);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
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
        {/* Navbar */}
        <nav className={`navbar navbar-expand-lg ${darkMode ? "navbar-dark bg-dark" : "navbar-light bg-light"} p-3 mb-4`}>
          <div className="container-fluid">
            <Link className="navbar-brand fw-bold" to="/">Recipe Navigator</Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarContent"
              aria-controls="navbarContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
              <div className="ms-auto d-flex flex-column flex-lg-row gap-2 align-items-lg-center">
                <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-primary"} d-lg-inline-block`} to="/">Discover</Link>

                {user && (
                  <>
                    <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-success"} d-lg-inline-block`} to="/myrecipes">My Recipes</Link>
                    <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-warning"} d-lg-inline-block`} to="/add">Add Recipe</Link>
                  </>
                )}

                {!user ? (
                  <>
                    <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-secondary"} d-lg-inline-block`} to="/login">Login</Link>
                    <Link className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-info"} d-lg-inline-block`} to="/register">Register</Link>
                  </>
                ) : (
                  <>
                    <span className="navbar-text me-3 mt-2 mt-lg-0">👋 Hi, <strong>{user.username}</strong></span>
                    <button className={`btn ${darkMode ? "btn-outline-light" : "btn-outline-danger"} d-lg-inline-block`} onClick={handleLogout}>Logout</button>
                  </>
                )}

                <button className={`btn ${darkMode ? "btn-light" : "btn-dark"} d-lg-inline-block`} onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? "🌞 Light" : "🌙 Dark"}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
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
              element={user ? <Navigate to="/myrecipes" /> : <Login darkMode={darkMode} onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/myrecipes" /> : <Register darkMode={darkMode} onRegister={handleLogin} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          theme={darkMode ? "dark" : "light"}
          transition={Bounce}
        />
      </div>
    </Router>
  );
}

export default App;
