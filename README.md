# TaskFlow - Premium MERN Task Tracker

TaskFlow is a modern, highly responsive, and visually stunning Task Tracker Web Application built with the MERN stack (MongoDB, Express, React + TS, Node.js). 

It features an elegant Kanban Board and a structured List View, comprehensive task statistics, robust form validations, inline toast notifications, and full-featured query filtering/sorting.

---

## ⚡ Key Features

- **Double-Layout Dashboard**: Smooth toggle between an interactive **Kanban Board** and a structured **List View**.
- **Intuitive CRUD Operations**: Create, view details, edit inline, or delete tasks with immediate dynamic state updates.
- **Smart Validation & Warnings**: Form validations with specific error responses and past-due-date warnings.
- **Interactive Stats Tracker**: Dashboard summary metrics showing total, pending, in-progress, completed, and high-priority counts, plus an animated project progress bar.
- **Advanced Filtering & Sorting**:
  - Filter by Status, Priority, and Due Date range (Overdue, Due Today, Due This Week).
  - Sort by Creation Date, Due Date, and Priority levels.
  - Case-insensitive search on titles and descriptions.
- **Optimistic State Updates**: Dynamic updates without page refresh, rolling back changes if server updates fail.
- **Theme Customizer**: Smooth light/dark theme transition utilizing custom CSS variables.
- **Zero-Config Database Fallback**: Starts immediately with local JSON file persistence (`tasks_db.json`) if MongoDB is unavailable or fails to connect, switching back automatically when a URI is configured.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite + TypeScript), Vanilla CSS
- **Backend**: Node.js + Express.js (ES Modules)
- **Database**: MongoDB (via Mongoose)

---

## ⚙️ Installation & Configuration

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher recommended)
- **MongoDB** (optional, local server or Atlas connection string)

### Setup Instructions

1. Clone or extract the project folder.
2. Open your terminal in the root directory.
3. Install dependencies across all packages:
   ```bash
   npm run install-all
   ```

### Environment Variables
Configure the backend server environment. Create a `.env` file in the `/backend` directory (a preconfigured `.env` is already created for you):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-tracker
```

---

## 🚀 Running the Application

To run both the backend server and frontend client concurrently with a single command:

```bash
npm run dev
```

The services will initialize on:
- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

*Note: If MongoDB is not active on your system, the backend will output a notice and fall back to local file storage at `backend/data/tasks_db.json` automatically, meaning the app is immediately usable.*

---

## 📡 REST API Endpoints

All endpoints use JSON payloads and return appropriate HTTP status codes:

| Method | Endpoint | Description | Query Parameters (Optional) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Retrieve all tasks | `status`, `priority`, `search`, `sortBy`, `order`, `dueRange` |
| **GET** | `/api/tasks/:id` | Retrieve single task | None |
| **POST** | `/api/tasks` | Create a new task | Requires JSON body (`title` mandatory) |
| **PUT** | `/api/tasks/:id` | Update an existing task | Accepts Partial JSON body |
| **DELETE**| `/api/tasks/:id` | Remove a task | None |
| **GET** | `/api/status` | Server health check status | None |

---

## 🌐 Production Deployment Guide

### Deploying the Backend (e.g. Render, Railway, Heroku)
1. Set the **Build Command** to: `npm install` (within `/backend`)
2. Set the **Start Command** to: `npm start`
3. Configure the following **Environment Variables** in the platform panel:
   - `PORT`: `5000` (or leave it dynamic)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*

### Deploying the Frontend (e.g. Vercel, Netlify)
1. Configure your deployment from the root or point to `/frontend` directory.
2. Set the **Build Command** to: `npm run build`
3. Set the **Output Directory** to: `dist`
4. Configure the **Environment Variables** in the frontend platform:
   - `VITE_API_URL`: *The URL of your deployed backend* (e.g., `https://my-taskflow-api.onrender.com`)
