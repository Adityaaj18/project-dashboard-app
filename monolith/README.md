# Monolithic Project Management Application

A full-stack monolithic web application for project and task management, built with React and Node.js/Express, featuring comprehensive authentication, role-based access control, and a modern GitHub-inspired dark theme UI.

## 🏗️ Architecture

This is a **traditional monolithic architecture** where:
- **Backend**: Single Node.js/Express server handling all API endpoints
- **Frontend**: Single React SPA (Single Page Application)
- **Database**: SQLite database with better-sqlite3
- All features are tightly integrated in one codebase

### Comparison with Micro-Frontend Architecture

Unlike the micro-frontend version in this repository, the monolith:
- ✅ Simpler deployment (single build, single server)
- ✅ Easier development setup
- ✅ Better performance (no cross-app communication overhead)
- ✅ Shared context and state management
- ❌ Harder to scale teams (one codebase for all features)
- ❌ Longer build times as app grows
- ❌ Cannot deploy features independently

## ✨ Features

### 🔐 Authentication & Authorization
- **Email/Password Registration & Login**
- **Google OAuth Integration**
- **JWT Token-Based Sessions** (7-day expiration)
- **Protected Routes** with auto-redirect
- **Session Persistence** (localStorage)

### 👥 Role-Based Access Control (RBAC)
- **5 User Roles**: Admin, Manager, Team Lead, Developer, Viewer
- **Granular Permissions**:
  - View/Manage Users
  - View All Projects vs Own Projects Only
  - Create/Edit/Delete Projects (Own vs Any)
  - Create/Edit/Delete Tasks
  - Change Password
  - View Settings

### 👤 User Management
- **Profile Management**: View and edit profile information
- **User Statistics**: Tasks completed, active projects, join date
- **Color-Coded Role Badges**: Visual role identification
- **Auto-Generated Avatars**: UI Avatars integration
- **Provider Display**: Shows authentication method (Email/Google)

### 📊 Project Management
- **Create Projects**: Name, description, status
- **View Projects**: Role-based filtering
- **Edit Projects**: Inline editing with permission checks
- **Delete Projects**: With confirmation dialog
- **Project Status**: Active, Completed
- **Progress Tracking**: Visual progress bars
- **Task Count Badges**: Quick task overview

### ✅ Task Management (Kanban Board)
- **Kanban Board View**: To Do → In Progress → Done
- **Create Tasks**: Within project columns
- **Edit Task Title**: Inline editing
- **Update Task Status**: Dropdown selection
- **Delete Tasks**: With permission checks
- **Column Color Coding**: Red (To Do), Orange (In Progress), Green (Done)
- **Task Count per Column**: Visual task distribution

### 📈 Dashboard & Analytics
- **Overall Statistics**: Total projects, active projects, total tasks, completed tasks
- **Progress Tracking**: Overall completion percentage
- **Visual Progress Bars**: Task completion ratios
- **Project Summaries**: Recent projects with quick stats

### 🎨 UI/UX Features
- **GitHub Dark Theme**: Modern, professional design
- **Gradient Role Badges**: Beautiful role identification
- **Responsive Layout**: Works on all devices
- **Color-Coded Status Badges**: Quick status identification
- **Modal Dialogs**: Delete confirmation, password change
- **Loading States**: Spinner and loading messages
- **Error Messages**: User-friendly error handling
- **Empty State Messages**: Helpful empty state designs

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Google OAuth credentials (optional, for Google login)

### Installation

1. **Clone the repository** (if not already cloned)

2. **Install backend dependencies**:
```bash
cd monolith/backend
npm install
```

3. **Install frontend dependencies**:
```bash
cd ../frontend
npm install
```

### Configuration

1. **Create environment file** for the backend:
```bash
cd monolith
cp .env.example .env
```

2. **Edit `.env`** with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret-change-in-production
```

3. **Google OAuth Setup** (Optional):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
   - Copy Client ID and Client Secret to `.env`

### Running the Application

#### Development Mode

**Terminal 1 - Backend**:
```bash
cd monolith/backend
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend**:
```bash
cd monolith/frontend
npm start
```
Frontend runs on: http://localhost:3000

The app will automatically open in your browser at http://localhost:3000

#### Production Mode

**Build Frontend**:
```bash
cd monolith/frontend
npm run build
```

**Run Backend** (serves both API and static frontend):
```bash
cd monolith/backend
npm start
```

## 📁 Project Structure

```
monolith/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         # SQLite database setup
│   │   │   ├── passport.js         # Passport.js Google OAuth config
│   │   │   └── permissions.js      # RBAC permissions definition
│   │   ├── controllers/
│   │   │   ├── authController.js   # Authentication logic
│   │   │   └── projectController.js # Project & task logic
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication middleware
│   │   │   └── rbac.js             # Permission check middleware
│   │   ├── routes/
│   │   │   ├── auth.js             # Auth routes
│   │   │   └── projects.js         # Project & task routes
│   │   └── server.js               # Express app entry point
│   ├── database.db                 # SQLite database (auto-created)
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── AuthCallback.jsx    # OAuth callback handler
│   │   │   ├── Layout.jsx          # App layout with sidebar
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── Profile.jsx         # User profile
│   │   │   ├── Settings.jsx        # User settings
│   │   │   ├── Projects.jsx        # Project management
│   │   │   ├── TaskBoard.jsx       # Kanban task board
│   │   │   └── *.css               # Component styles
│   │   ├── contexts/
│   │   │   └── AuthContext.js      # Authentication context
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.js                  # Main app component
│   │   ├── App.css
│   │   ├── index.js                # React entry point
│   │   └── index.css
│   └── package.json
│
├── .env.example                    # Environment template
└── README.md                       # This file
```

## 🗄️ Database Schema

### Users Table
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT
- email: TEXT UNIQUE
- password: TEXT (hashed)
- role: TEXT (admin, manager, team lead, developer, viewer)
- department: TEXT
- avatar: TEXT (URL)
- provider: TEXT (email, google)
- provider_id: TEXT
- created_at: DATETIME
- updated_at: DATETIME
```

### Projects Table
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT
- description: TEXT
- status: TEXT (active, completed)
- owner_id: INTEGER (FK to users)
- created_at: DATETIME
- updated_at: DATETIME
```

### Tasks Table
```sql
- id: INTEGER PRIMARY KEY
- title: TEXT
- status: TEXT (todo, in-progress, done)
- project_id: INTEGER (FK to projects)
- created_at: DATETIME
- updated_at: DATETIME
```

## 🔌 API Endpoints

### Authentication (8 endpoints)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/permissions` - Get user permissions

### Projects (5 endpoints)
- `GET /api/projects` - Get all projects (filtered by role)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks (4 endpoints)
- `GET /api/projects/:id/tasks` - Get all tasks for project
- `POST /api/projects/:id/tasks` - Create new task
- `PUT /api/projects/:id/tasks/:taskId` - Update task
- `DELETE /api/projects/:id/tasks/:taskId` - Delete task

## 🎨 UI Theme

The application uses a **GitHub Dark Theme** inspired design:
- Primary Color: `#58a6ff` (Blue)
- Success Color: `#238636` (Green)
- Danger Color: `#da3633` (Red)
- Background: `#0d1117` (Dark Gray)
- Card Background: `#161b22` (Slightly lighter)
- Border: `#30363d` (Gray)

### Role Badge Colors
- **Admin**: Red gradient (`#ef4444` → `#dc2626`)
- **Manager**: Orange gradient (`#f97316` → `#ea580c`)
- **Team Lead**: Blue gradient (`#3b82f6` → `#2563eb`)
- **Developer**: Green gradient (`#10b981` → `#059669`)
- **Viewer**: Gray gradient (`#6b7280` → `#4b5563`)

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **HTTP-Only Cookies**: Session cookies (for OAuth)
- **CORS Protection**: Configured CORS for frontend
- **SQL Injection Prevention**: Parameterized queries
- **Permission Validation**: Server-side permission checks
- **Foreign Key Constraints**: Database-level referential integrity

## 🧪 Testing the Application

### Default Test Users

The app starts with an empty database. Create your first user by:
1. Navigate to http://localhost:3000/register
2. Fill in registration form
3. First user defaults to "viewer" role

### Changing User Roles

Use the included role change script:
```bash
cd monolith/backend
node change-role.js <email> <role>
```

Example:
```bash
node change-role.js admin@example.com admin
```

Available roles: `admin`, `manager`, `team lead`, `developer`, `viewer`

## 🚢 Deployment

### Production Build

1. **Build frontend**:
```bash
cd monolith/frontend
npm run build
```

2. **Set environment variables** on production server

3. **Run backend**:
```bash
cd monolith/backend
NODE_ENV=production npm start
```

### Environment Variables for Production

Make sure to set:
- `NODE_ENV=production`
- `JWT_SECRET` - Strong random secret
- `SESSION_SECRET` - Strong random secret
- `FRONTEND_URL` - Your production domain
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - If using OAuth

### Database Migration

For production, consider migrating to PostgreSQL or MySQL:
1. Update `backend/src/config/database.js`
2. Install appropriate database driver
3. Update connection string in `.env`

## 📝 License

MIT License - Feel free to use this project for learning and development.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📞 Support

For issues or questions, please check the existing MFE architecture in the parent directory for comparison.

---

**Built with ❤️ using React, Node.js, Express, and SQLite**
