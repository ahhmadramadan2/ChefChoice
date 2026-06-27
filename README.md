# ChefChoice

A full-stack restaurant ordering and management platform.

🌐 **Live demo:** https://chef-choice-eight.vercel.app

## Features

- Browse menu, filter by category/diet/price, build custom meal combos
- JWT authentication with saved delivery addresses
- Real-time order tracking through 6 stages
- Admin dashboard for managing dishes and orders
- Customer notes on orders

## Tech Stack

- **Frontend:** React 19 + Vite, deployed on Vercel
- **Backend:** Node.js + Express, deployed on Render
- **Database:** PostgreSQL via Supabase
- **Auth:** JWT with bcrypt-equivalent password hashing (Node crypto scrypt)

## Architecture

[Frontend (Vercel)] → [API (Render)] → [Postgres (Supabase)]

## Local development

\`\`\`bash
# Clone
git clone https://github.com/yourusername/chef-choice
cd chef-choice

# Frontend
npm install
npm run dev

# Backend (in a separate terminal)
cd backend
npm install
npm run dev
\`\`\`

Requires a `.env` in root with `VITE_API_URL` and a `.env` in `backend/` with `DATABASE_URL`, `JWT_SECRET`, etc.

## Author

Built as a personal full-stack project.
