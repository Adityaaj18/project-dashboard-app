# Making Data Dynamic - Complete Guide

## Overview

I've converted your microfrontend applications from hardcoded data to a dynamic data management system using React Context API. This allows data to be shared across all micro frontends and easily integrated with a backend API.

## Architecture

```
MFApp (Host)
├── DataContext (Central Data Store)
│   ├── Projects State
│   ├── CRUD Operations
│   └── API Integration
├── DashboardApp (Consumes Data)
├── ProjectApp (Consumes & Modifies Data)
└── AuthApp (User Authentication)
```

## Files Modified

### 1. **DataContext.jsx** (NEW)
**Location:** `MFApp/src/context/DataContext.jsx`

This is the central data management system that:
- Manages all projects and tasks state
- Provides CRUD operations (Create, Read, Update, Delete)
- Handles API communication
- Falls back to mock data during development
- Calculates statistics automatically

**Key Features:**
- ✅ API-ready with fallback to mock data
- ✅ Automatic stats calculation
- ✅ Error handling
- ✅ Loading states
- ✅ Real-time updates across all microfrontends

### 2. **App.jsx** (UPDATED)
**Location:** `MFApp/src/App.jsx`

Added DataProvider wrapper:
```jsx
<AuthProvider>
  <DataProvider>
    <Router>
      <AppContent />
    </Router>
  </DataProvider>
</AuthProvider>
```

### 3. **DashboardApp.jsx** (UPDATED)
**Location:** `DashboardApp/src/DashboardApp.jsx`

Now receives data via props instead of local state:
```jsx
const DashboardApp = ({ dataContext }) => {
  const projects = dataContext?.projects || [];
  const stats = dataContext?.stats || {...};
  // ...
}
```

### 4. **ProjectApp.jsx** (UPDATED)
**Location:** `ProjectApp/src/ProjectApp.jsx`

Now uses context for CRUD operations:
```jsx
const ProjectApp = ({ dataContext }) => {
  const projects = dataContext?.projects || [];
  const updateTask = dataContext?.updateTask;
  const addTask = dataContext?.addTask;
  const deleteTask = dataContext?.deleteTask;
  // ...
}
```

### 5. **Page Components** (UPDATED)
- `DashboardPage.jsx` - Passes dataContext to DashboardApp
- `ProjectsPage.jsx` - Passes dataContext to ProjectApp

## How to Use

### Current Setup (Mock Data)

The system currently uses mock data for development. To use it:

1. **Start all applications:**
   ```bash
   # Terminal 1 - Host App
   cd MFApp
   npm start

   # Terminal 2 - Dashboard
   cd DashboardApp
   npm start

   # Terminal 3 - Projects
   cd ProjectApp
   npm start

   # Terminal 4 - Auth
   cd AuthApp
   npm start
   ```

2. **Data will automatically load** from the mock data defined in `DataContext.jsx`

3. **All operations work:**
   - View projects and tasks
   - Add new tasks
   - Update task status (drag between columns)
   - Delete tasks
   - Stats update automatically

### Integrating with Your Backend API

To connect to a real backend, update `DataContext.jsx`:

#### Step 1: Update API Base URL

Find this line in `DataContext.jsx`:
```jsx
const response = await fetch('https://api.example.com/projects');
```

Replace with your actual API URL:
```jsx
const response = await fetch('https://your-api.com/api/projects');
```

#### Step 2: Add Authentication Headers

If your API requires authentication:
```jsx
const response = await fetch('https://your-api.com/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

#### Step 3: Enable Real API Calls

In the `useEffect` at the bottom of `DataContext.jsx`, change:
```jsx
// Current (mock data)
loadMockData();
setLoading(false);
```

To:
```jsx
// Use real API
fetchProjects();
```

#### Step 4: Update All API Endpoints

Replace these placeholder URLs in `DataContext.jsx`:
- `POST https://api.example.com/projects` → Create project
- `PUT https://api.example.com/projects/:id` → Update project
- `DELETE https://api.example.com/projects/:id` → Delete project
- `POST https://api.example.com/projects/:id/tasks` → Create task
- `PUT https://api.example.com/tasks/:id` → Update task
- `DELETE https://api.example.com/tasks/:id` → Delete task

## Expected API Response Format

Your backend should return data in this format:

### GET /projects
```json
[
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
        "status": "done",
        "projectId": 1
      },
      {
        "id": 2,
        "title": "Add TypeScript support",
        "status": "in-progress",
        "projectId": 1
      }
    ]
  }
]
```

### POST /projects
**Request:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "active"
}
```

**Response:**
```json
{
  "id": 5,
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "totalTasks": 0,
  "completedTasks": 0,
  "tasks": []
}
```

### POST /projects/:projectId/tasks
**Request:**
```json
{
  "title": "New Task",
  "status": "todo"
}
```

**Response:**
```json
{
  "id": 10,
  "title": "New Task",
  "status": "todo",
  "projectId": 1
}
```

### PUT /tasks/:taskId
**Request:**
```json
{
  "status": "done"
}
```

**Response:**
```json
{
  "id": 10,
  "title": "New Task",
  "status": "done",
  "projectId": 1
}
```

## Alternative Approaches

### 1. Using Redux (More Complex, Better for Large Apps)

```bash
npm install @reduxjs/toolkit react-redux
```

Create slices for projects and tasks, use Redux Toolkit Query for API calls.

### 2. Using React Query (Great for API Caching)

```bash
npm install @tanstack/react-query
```

Better caching, automatic refetching, optimistic updates.

### 3. Using SWR (Lightweight Alternative)

```bash
npm install swr
```

Simple data fetching with cache.

### 4. Using Zustand (Simpler than Redux)

```bash
npm install zustand
```

Minimal state management without boilerplate.

## Adding New Features

### Add a New Project Programmatically

```jsx
import { useData } from './context/DataContext';

const MyComponent = () => {
  const { addProject } = useData();

  const handleAddProject = async () => {
    const newProject = await addProject({
      name: "New Feature",
      description: "Feature description",
      status: "active",
      totalTasks: 0,
      completedTasks: 0
    });
    console.log('Created:', newProject);
  };

  return <button onClick={handleAddProject}>Add Project</button>;
};
```

### Update Project Details

```jsx
const { updateProject } = useData();

await updateProject(projectId, {
  name: "Updated Name",
  description: "Updated Description"
});
```

### Refresh Data Manually

```jsx
const { refreshProjects } = useData();

await refreshProjects();
```

## Data Flow Diagram

```
User Action (e.g., Add Task)
       ↓
ProjectApp Component
       ↓
dataContext.addTask()
       ↓
API Call (or Mock)
       ↓
Update Context State
       ↓
Auto Re-render All Components
       ↓
DashboardApp Shows Updated Stats
ProjectApp Shows New Task
```

## Benefits of This Approach

1. **Single Source of Truth** - All data managed in one place
2. **Easy API Integration** - Just update API URLs
3. **Automatic Updates** - Changes reflect across all microfrontends
4. **Graceful Degradation** - Falls back to mock data if API fails
5. **Type Safety Ready** - Easy to add TypeScript types
6. **Testing Friendly** - Mock the context for testing

## Next Steps

1. **Build Your Backend API**
   - Create REST endpoints matching the format above
   - Add authentication
   - Set up database (PostgreSQL, MongoDB, etc.)

2. **Update API URLs in DataContext**
   - Replace all `api.example.com` with your actual API

3. **Add Error Handling UI**
   - Show toast notifications for errors
   - Add retry buttons
   - Display loading spinners

4. **Add Optimistic Updates**
   - Update UI immediately
   - Revert if API call fails

5. **Implement Pagination**
   - For large project lists
   - Load tasks on demand

6. **Add Real-time Updates**
   - Use WebSockets or Server-Sent Events
   - Sync data across multiple users

## Troubleshooting

### Data Not Loading
- Check browser console for errors
- Verify DataProvider wraps your app
- Ensure dataContext is passed to components

### Updates Not Reflecting
- Check if CRUD functions are called with `await`
- Verify state updates in DataContext
- Check React DevTools for state changes

### API Errors
- Check CORS settings on backend
- Verify API endpoint URLs
- Check authentication tokens
- Look at Network tab in DevTools

## Example: Complete Feature Flow

Let's say you want to add a "priority" field to tasks:

1. **Update Backend Schema:**
   ```sql
   ALTER TABLE tasks ADD COLUMN priority VARCHAR(10);
   ```

2. **Update Mock Data in DataContext:**
   ```jsx
   {
     id: 1,
     title: 'Create Button',
     status: 'done',
     priority: 'high',  // Add this
     projectId: 1
   }
   ```

3. **Update Task Creation in DataContext:**
   ```jsx
   const addTask = async (projectId, taskData) => {
     // taskData now includes priority
     const response = await fetch(..., {
       body: JSON.stringify({
         ...taskData,
         priority: taskData.priority || 'medium'
       })
     });
   };
   ```

4. **Update ProjectApp UI:**
   ```jsx
   <select className="priority-select">
     <option value="low">Low</option>
     <option value="medium">Medium</option>
     <option value="high">High</option>
   </select>
   ```

5. **Rebuild and Test:**
   ```bash
   npm run build
   ```

That's it! The priority feature is now fully integrated.

## Support

For issues or questions:
1. Check this guide
2. Review DataContext.jsx comments
3. Check browser console for errors
4. Verify all apps are running on correct ports

Happy coding! 🚀
