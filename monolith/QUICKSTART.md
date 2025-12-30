# 🚀 Quick Start Guide

Get the monolithic app running in 5 minutes!

## ⚡ Super Fast Setup

### 1. Install Dependencies (One Command)
```bash
cd monolith
npm run install-all
```

### 2. Create Environment File
```bash
copy .env.example .env
```

Edit `.env` and set:
```env
JWT_SECRET=my-super-secret-key-12345
SESSION_SECRET=my-session-secret-12345
```

### 3. Start the App
```bash
# Windows
start-dev.bat

# Mac/Linux
npm run dev
```

That's it! The app will open at http://localhost:3000

## 🎯 First Steps

1. **Create an Account**
   - Go to http://localhost:3000/register
   - Enter your details
   - Click "Sign Up"

2. **Change Your Role to Admin**
   ```bash
   cd backend
   node change-role.js your@email.com admin
   ```

3. **Explore the App**
   - ✅ Dashboard: View statistics
   - 📁 Projects: Create a new project
   - ✅ Tasks: Add tasks to your project (Kanban board)
   - 👤 Profile: Update your information
   - ⚙️ Settings: Configure preferences

## 🛠️ Common Commands

```bash
# Install all dependencies
npm run install-all

# Start development mode (both servers)
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build for production
npm run build

# Change user role
npm run change-role email@example.com admin

# Available roles: admin, manager, "team lead", developer, viewer
```

## 🔐 Default Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎨 Color-Coded Roles

After creating your account, use the role change script to test different permissions:

- 🔴 **Admin**: Full access to everything
- 🟠 **Manager**: Can manage projects and users
- 🔵 **Team Lead**: Can create and manage own projects
- 🟢 **Developer**: Can view projects and manage tasks
- ⚪ **Viewer**: Read-only access

## 📱 Google OAuth (Optional)

To enable Google login:

1. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
3. Restart the backend server

## ❓ Troubleshooting

### Port already in use
```bash
# Kill processes on ports
taskkill /F /IM node.exe

# Or use different ports in .env
PORT=5001  # Backend
# Frontend: Update package.json proxy
```

### Database locked error
```bash
# Delete the database and restart
cd backend
del database.db
npm run dev
```

### Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
cd backend
rmdir /s node_modules
npm install

cd ../frontend
rmdir /s node_modules
npm install
```

## 🎓 Learning Path

1. **Explore the UI** - Click around and see all features
2. **Check the Code** - See how components are organized
3. **Compare with MFE** - Open parent directory's MFE version
4. **Read Architecture Comparison** - See ARCHITECTURE-COMPARISON.md
5. **Customize** - Make it your own!

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [ARCHITECTURE-COMPARISON.md](ARCHITECTURE-COMPARISON.md) to understand trade-offs
- Compare with the Micro-Frontend version in the parent directory

---

**Happy coding! 🎉**
