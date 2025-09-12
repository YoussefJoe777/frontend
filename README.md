# Recipe Manager
#### Video Demo: https://youtu.be/lwhI-YC2hI4
#### Description:

## Overview
Recipe Manager is my final project for **CS50’s Introduction to Computer Science**.
It is a full-stack web application that allows users to create, share, and interact with cooking recipes.
The idea of the project is to make a small social platform where people can add their recipes, view others’ recipes, and engage with features such as likes.

The project consists of a **backend built with Flask (Python)** and a **frontend built with React**. The backend handles user authentication, recipe storage, and database queries, while the frontend provides a responsive user interface for interacting with the data.

---

## Features
- **User Registration and Login**
  Users can create an account using a username and password. Authentication is handled via JWT tokens.

- **Add Recipes**
  Logged-in users can add new recipes with a title, description, ingredients, and a category.

- **Browse Recipes**
  All users can browse published recipes. Each recipe displays its title, description, ingredients, and the username of the publisher.

- **Like/Unlike Recipes**
  Any user can like a recipe or remove their like. This is implemented as a toggle, so pressing the like button again will remove the like.

- **My recipe Page**
  Each user has a profile page where their personal recipes are displayed. This allows users to track what they have published.

- **Dark Mode**
  The application supports light and dark mode, and users can switch between them easily.

- **Search and Sort**
  Recipes can be searched by ingredients and sorted by either newest or most liked.

- **Responsive Design**
  The project is mobile-friendly thanks to Bootstrap.

---

## Files and Structure

### Backend (Flask)
- **app.py**: The main application file. Defines all routes (login, register, add recipe, get recipes, like/unlike, profile). It connects to the SQLite database and handles authentication.
- **models and database**: The database (`recipes.db`) includes three main tables:
  - `users` (id, username, password_hash)
  - `recipes` (id, user_id, title, description, ingredients, category, created_at)
  - `likes` (id, user_id, recipe_id)
- **requirements.txt**: Lists Python dependencies such as Flask, Flask-CORS, and PyJWT.

### Frontend (React)
- **src/App.js**: Main file that sets up routing between pages (Home, Login, Register, MyRecipes, AddRecipe, Profile).
- **src/pages/**: Contains React components for each page:
  - `HomePage.jsx`: Displays all recipes, search, sort, and like/unlike buttons.
  - `Login.jsx`: Handles user login with toast notifications for errors/success.
  - `Register.jsx`: Handles user registration.
  - `MyRecipes.jsx`: Displays recipes created by the logged-in user.
  - `AddRecipe.jsx`: Allows users to add a new recipe.
- **src/App.css**: Custom styling, including dark mode adjustments.

### Other Files
- **README.md**: Documentation for the project (this file).

---

## Design Choices
Another choice was to store likes in a separate table (`likes`) instead of embedding like counts in the recipe table. This allowed a clean toggle system for users liking/unliking recipes, and it avoids duplicate likes by enforcing unique constraints.

I also debated whether to allow email-based login, but for simplicity I decided to use **username + password** only. This reduced complexity and was enough to demonstrate the authentication system.

For styling, I used **Bootstrap** to ensure the application looks good on both desktop and mobile devices without writing too much custom CSS. The addition of dark mode improved the user experience.

---

## Challenges
Some of the main challenges I faced during development were:
1. **Database Foreign Keys**: At first, deleting users caused foreign key constraint errors because of related recipes and likes. I had to redesign the database to handle cascading deletes properly.
2. **Like Toggle**: Ensuring that the like button both adds and removes likes without duplication required extra logic in the backend.
3. **State Management in React**: Handling logged-in state across different components and pages required passing down props and using localStorage for persistence.

---

## Future Improvements
- Allowing comments on recipes.
- Allowing saving recipes.
- Deploying the project online so anyone can use it.

---

## How to Run
1. **Backend**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate   # on Windows
   pip install -r requirements.txt
   python 
