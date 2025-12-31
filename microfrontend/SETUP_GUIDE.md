# Complete Setup Guide - Microfrontend Application with Real Backend

This guide will help you run the complete microfrontend application with a real Node.js/Express backend API.

## 🎯 What's New

Your application now has:
- ✅ **Real Backend API** (Node.js + Express + SQLite)
- ✅ **JWT Authentication** (secure token-based auth)
- ✅ **Database Storage** (SQLite with automatic setup)
- ✅ **Protected Routes** (only authenticated users can access)
- ✅ **CRUD Operations** (Create, Read, Update, Delete for projects & tasks)
- ✅ **Security Features** (Helmet, CORS, Rate Limiting, Password Hashing)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- 5 terminal windows (or use a terminal multiplexer like tmux)

## 🚀 Step-by-Step Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Start the Backend Server (Terminal 1)

```bash
cd backend
npm start
```

You should see:
```
==================================================
🚀 Server running on http://localhost:5000
📝 Environment: development
🔒 CORS enabled for: http://localhost:3000, ...
==================================================
```

**Keep this terminal running!**

### Step 3: Start AuthApp (Terminal 2)

```bash
cd AuthApp
npm start
```

Runs on `http://localhost:3005`

### Step 4: Start DashboardApp (Terminal 3)

```bash
cd DashboardApp
npm start
```

Runs on `http://localhost:3003`

### Step 5: Start ProjectApp (Terminal 4)

```bash
cd ProjectApp
npm start
```

Runs on `http://localhost:3004`

### Step 6: Start MFApp - Host Application (Terminal 5)

```bash
cd MFApp
npm start
```

Runs on `http://localhost:3000`

## 🎮 How to Use

### 1. Register a New Account

1. Open `http://localhost:3000` in your browser
2. You'll be redirected to `/login` (protected routes!)
3. Click "Register" or go to the registration form
4. Fill in:
   - **Name**: Your full name
   - **Email**: Your email address
   - **Password**: A secure password
   - **Role**: e.g., "Developer", "Project Manager"
   - **Department**: e.g., "Engineering", "Design"

5. Click "Register"
6. You'll be automatically logged in and redirected to the dashboard

### 2. Create Your First Project

1. Once logged in, you'll see the Dashboard
2. Click on "Projects" in the navigation
3. Click "Create New Project" button
4. Enter:
   - **Project Name**: e.g., "My First Project"
   - **Description**: Brief description
   - **Status**: "active" or "completed"

5. Click "Create"
6. Your project appears in the list!

### 3. Add Tasks to Your Project

1. Click on a project to view details
2. Click "Add Task" button
3. Enter task title
4. Choose status: "todo", "in-progress", or "done"
5. Click "Add"

### 4. Manage Tasks

- **Update Status**: Click the dropdown to change task status
- **Delete Task**: Click the delete button (⌫)
- **View Progress**: See completion percentage automatically calculated

### 5. View Dashboard Statistics

- Navigate to the Dashboard
- See:
  - Total projects
  - Active projects
  - Total tasks
  - Completed tasks
  - Overall progress percentage
  - Individual project progress

## 🔐 Authentication Flow

### How It Works

1. **Register/Login**: User credentials sent to backend
2. **Backend Validates**: Checks email/password
3. **JWT Token Generated**: Backend creates a secure token
4. **Token Stored**: Frontend saves token in localStorage
5. **Protected Requests**: Token sent in Authorization header
6. **Backend Verifies**: Validates token for each request

### Token Storage

The JWT token is stored in `localStorage` as:
```json
{
  "user": {
    "id": "1",
    "name": "John Doe",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

Clicking "Logout" will:
1. Clear localStorage
2. Reset user state
3. Redirect to login page

## 🧪 Testing the API

### Using curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "role": "Developer"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Create Project (replace TOKEN)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Project",
    "description": "Testing via API"
  }'
```

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Console tab
3. Check localStorage:
```javascript
JSON.parse(localStorage.getItem('user'))
```

## 📁 Database Location

The SQLite database is created at:
```
backend/database.db
```

You can view it with tools like:
- DB Browser for SQLite
- DBeaver
- SQLite VSCode extension

## 🔧 Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify all dependencies are installed: `cd backend && npm install`
- Check `.env` file exists in backend folder

### "Unauthorized" errors
- Make sure you're logged in
- Check if token is in localStorage
- Token expires after 7 days - login again

### CORS errors
- Ensure backend is running on port 5000
- Check CORS_ORIGINS in backend/.env includes your frontend URLs
- Clear browser cache and reload

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check browser console for network errors
- Ensure API_BASE_URL in frontend points to `http://localhost:5000/api`

### No data showing
- Open browser DevTools > Network tab
- Check API requests are returning 200 status
- Verify you're logged in (check localStorage)
- Create some projects first!

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MFApp (Host)                         │
│                  localhost:3000                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Protected Routes + Error Boundaries               │ │
│  │  • Dashboard Page                                  │ │
│  │  • Projects Page                                   │ │
│  │  • Profile Page                                    │ │
│  │  • Settings Page                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                          │                              │
│           ┌──────────────┼──────────────┐              │
│           ▼              ▼              ▼              │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│    │Dashboard │   │ Project  │   │   Auth   │        │
│    │   App    │   │   App    │   │   App    │        │
│    │  :3003   │   │  :3004   │   │  :3005   │        │
│    └──────────┘   └──────────┘   └──────────┘        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
         ┌─────────────────────────────────┐
         │   Backend API (Express)         │
         │   localhost:5000                │
         │                                 │
         │   ┌─────────────────────────┐  │
         │   │  JWT Authentication     │  │
         │   │  • Register             │  │
         │   │  • Login                │  │
         │   │  • Profile              │  │
         │   └─────────────────────────┘  │
         │                                 │
         │   ┌─────────────────────────┐  │
         │   │  Project Management     │  │
         │   │  • CRUD Operations      │  │
         │   │  • Task Management      │  │
         │   └─────────────────────────┘  │
         │                                 │
         │   ┌─────────────────────────┐  │
         │   │  SQLite Database        │  │
         │   │  • Users                │  │
         │   │  • Projects             │  │
         │   │  • Tasks                │  │
         │   └─────────────────────────┘  │
         └─────────────────────────────────┘
```

## 🎉 Success Checklist

- [ ] Backend running on port 5000
- [ ] All 4 frontend apps running (3000, 3003, 3004, 3005)
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] Dashboard shows "No projects yet" initially
- [ ] Can create a new project
- [ ] Project appears in the list
- [ ] Can add tasks to project
- [ ] Task status can be updated
- [ ] Statistics update automatically
- [ ] Logout redirects to login page
- [ ] Protected routes require authentication

## 📚 Additional Resources

- **Backend API Docs**: See `backend/README.md`
- **Dynamic Data Guide**: See `DYNAMIC_DATA_GUIDE.md`
- **Security Report**: Check the comprehensive security analysis provided

## 🆘 Need Help?

1. Check the console for errors (both terminal and browser)
2. Verify all services are running
3. Check the troubleshooting section above
4. Review the backend logs for API errors
5. Check browser Network tab for failed requests

Happy coding! 🚀
