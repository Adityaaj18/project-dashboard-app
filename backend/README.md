# Microfrontend Backend API

Complete REST API for the microfrontend application with authentication, project management, and task tracking.

## 🚀 Quick Start

###1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm start       # Production mode
npm run dev     # Development mode with nodemon
```

The server will run on `http://localhost:5000`

## 📋 Features

- ✅ JWT Authentication
- ✅ User Registration & Login
- ✅ Protected Routes
- ✅ Project CRUD Operations
- ✅ Task Management
- ✅ SQLite Database
- ✅ Security (Helmet, CORS, Rate Limiting)
- ✅ Input Validation
- ✅ Error Handling

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "Developer",
  "department": "Engineering"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe&background=667eea&color=fff",
      "role": "Developer",
      "department": "Engineering",
      "joinDate": "2024-01-15",
      "tasksCompleted": 0,
      "activeProjects": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Update Profile (Protected)
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "role": "Senior Developer"
}
```

## 📁 Projects

### Get All Projects (Protected)
```http
GET /api/projects
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Component Library",
      "description": "Building reusable UI components",
      "status": "active",
      "totalTasks": 15,
      "completedTasks": 12,
      "tasks": [
        {
          "id": 1,
          "title": "Create Button Component",
          "status": "done"
        }
      ]
    }
  ]
}
```

### Get Single Project (Protected)
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

### Create Project (Protected)
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "status": "active"
}
```

### Update Project (Protected)
```http
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "completed"
}
```

### Delete Project (Protected)
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

## ✅ Tasks

### Get Project Tasks (Protected)
```http
GET /api/projects/:projectId/tasks
Authorization: Bearer <token>
```

### Create Task (Protected)
```http
POST /api/projects/:projectId/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement feature X",
  "status": "todo"
}
```

### Update Task (Protected)
```http
PUT /api/projects/:projectId/tasks/:taskId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress"
}
```

### Delete Task (Protected)
```http
DELETE /api/projects/:projectId/tasks/:taskId
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `avatar` - Avatar URL
- `role` - User's role
- `department` - Department name
- `join_date` - Date joined
- `tasks_completed` - Number of completed tasks
- `active_projects` - Number of active projects

### Projects Table
- `id` - Primary key
- `name` - Project name
- `description` - Project description
- `status` - Project status (active/completed)
- `user_id` - Foreign key to users table

### Tasks Table
- `id` - Primary key
- `title` - Task title
- `status` - Task status (todo/in-progress/done)
- `project_id` - Foreign key to projects table

## 🔒 Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiration
- **Helmet**: Security headers
- **CORS**: Configured for microfrontends
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: All endpoints validate input

## ⚙️ Environment Variables

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:3003,http://localhost:3004,http://localhost:3005
DB_PATH=./database.db
```

## 📊 Testing with curl

### Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Protected Requests
```bash
# Get projects (replace TOKEN with your JWT)
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN"

# Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"Test project"}'
```

## 🐛 Error Responses

All errors return:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Database setup
│   ├── controllers/
│   │   ├── authController.js # Auth logic
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   └── server.js             # Express app
├── .env                      # Environment variables
├── .env.example              # Example env file
├── package.json
└── README.md
```

## 🚀 Next Steps

1. Start the backend server: `npm start`
2. Register a new user via `/api/auth/register`
3. Use the returned token in Authorization header
4. Start creating projects and tasks!

## 💡 Tips

- Save the JWT token from login/register
- Include token in `Authorization: Bearer <token>` header
- Token expires in 7 days (configurable)
- Database file (`database.db`) created automatically
- Check server logs for request details
