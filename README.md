# ⚙️ Military Asset Management System (Frontend)

This is the frontend of a **Military Asset Management System**, designed using **React**, **TypeScript**, and **Tailwind CSS**. The application ensures secure and role-based access to sensitive asset-related operations such as purchases, transfers, and assignments.

---

## 🚀 Features

- 🔐 **Protected Routing** with `react-router-dom` and custom auth context.
- 👤 **Authentication Management** via `AuthContext`.
- 🧭 **Routing** for Login, Dashboard, Purchases, Transfers, and Assignments.
- 💅 **Tailwind CSS** for modern and responsive UI.
- ⏳ **Loading Spinner** while authentication is in progress.
- 🧱 **Layout Components** for consistent structure across pages.

---

## 📁 Project Structure

src/
├── components/
│ ├── Common/
│ │ └── LoadingSpinner.tsx
│ └── Layout/
│ └── Layout.tsx
├── context/
│ └── AuthContext.tsx
├── pages/
│ ├── Assignments.tsx
│ ├── Dashboard.tsx
│ ├── Login.tsx
│ ├── Purchases.tsx
│ └── Transfers.tsx
├── App.tsx
├── index.css
└── main.tsx



