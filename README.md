# ChefChoice

ChefChoice is a full-stack restaurant web application built as a university project, designed in a **production-style** architecture with a focus on clean UI, realistic features, and professional code structure.

This monorepo contains both:

- **Frontend:** React (Vite) single-page application
- **Backend:** Node.js + Express REST API with MySQL and session-based authentication

---

## ✨ Features

### Frontend (React + Vite)

- Modern single-page application using **React** and **React Router**
- **Custom UI/UX** (no UI libraries) with responsive layout
- **Cart** using Context API
- **Meal Builder** to compose a custom meal from mains, sides, and drinks
- **Auth pages** (Login / Signup) connected to backend
- **Contact form** (demo / or API-backed)
- Smooth navigation and polished design suitable for portfolio / CV

### Backend (Node.js + Express)

- REST API with the following route groups:

  - `/api/auth` – register, login, logout, session handling
  - `/api/dishes` – list menu items, fetch single dish, etc.
  - `/api/orders` – create orders, store in database
  - `/api/contact` – store contact messages

- **Session-based authentication** (no JWT) using cookies
- Custom **middleware** for auth and error handling
- Centralised DB config and structured routes

### Database (MySQL)

- Database: `chefchoice`
- Core tables (examples):
  - `users`
  - `dishes`
  - `orders`
  - `order_items`
  - `contact_messages`
- Backend already connected and inserting data (orders, users, etc.)
