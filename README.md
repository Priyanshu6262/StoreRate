# Store Rating Management System

A full-stack web application for rating stores and viewing analytics, built with role-based access control for Admins, Store Owners, and Normal Users.

---

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, Sequelize ORM, MySQL, JWT, Zod

---

## ✨ Features

- **Role-Based Authentication:** Secure JWT-based auth for Admin, Store Owner, and User.
- **Admin Dashboard:** View system stats, manage registered users, and oversee stores.
- **Store Owner Dashboard:** View average ratings and customer feedback in real-time.
- **User Portal:** Search, filter, and submit/update 1 to 5 star ratings for stores.

---

## 🛠️ Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
*(Update your MySQL database credentials in `.env`)*

Run database seeder (creates tables & demo data):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```
> Backend runs at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@storerate.com` | `Admin@1234` |
| **Store Owner** | `owner1@storerate.com` | `Owner@1234` |
| **Normal User** | `user1@storerate.com` | `User@1234` |
