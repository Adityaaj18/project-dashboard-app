# Complete Deployment Guide - Microfrontend Application

This comprehensive guide will walk you through deploying your microfrontend application step-by-step, from local testing to production deployment.

---

## Table of Contents

1. [Understanding Your Application](#understanding-your-application)
2. [Local Development Setup](#local-development-setup)
3. [Testing Before Deployment](#testing-before-deployment)
4. [Deployment Option 1: Vercel + Railway (Recommended for Beginners)](#deployment-option-1-vercel--railway)
5. [Deployment Option 2: Render (All-in-One Platform)](#deployment-option-2-render)
6. [Deployment Option 3: AWS (Production-Grade)](#deployment-option-3-aws)
7. [Deployment Option 4: DigitalOcean VPS with Docker](#deployment-option-4-digitalocean-vps-with-docker)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Troubleshooting](#troubleshooting)

---

## Understanding Your Application

Your microfrontend application consists of **4 separate services**:

### 1. Backend API (Port 5000)
- **Technology**: Node.js + Express
- **Database**: SQLite (needs to be migrated to PostgreSQL for production)
- **Purpose**: REST API for authentication, projects, tasks, RBAC

### 2. MFApp - Host Application (Port 3000)
- **Technology**: React + Webpack Module Federation
- **Purpose**: Main shell application that loads other microfrontends
- **Features**: Routing, navigation, shared context

### 3. AuthApp - Authentication Microfrontend (Port 3005)
- **Technology**: React
- **Purpose**: Login, Register, Profile, Settings
- **Features**: Google OAuth, Password management, RBAC

### 4. ProjectApp - Projects Microfrontend (Port 3004)
- **Technology**: React
- **Purpose**: Project and Task management
- **Features**: CRUD operations, role-based permissions

---

## Local Development Setup

### Prerequisites
- Node.js v18+ installed
- npm or yarn
- Git (for version control)

### Step 1: Install All Dependencies

```bash
# Navigate to project directory
cd "C:\Users\Jadha\Desktop\1. MFEs-with-react"

# Install dependencies for all apps
cd backend
npm install

cd ../MFApp
npm install

cd ../AuthApp
npm install

cd ../ProjectApp
npm install

cd ..
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` with your values:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth (Optional - get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start All Services

**Option A: Using Batch File (Easiest)**
```bash
# Double-click start-all.bat
# OR run from terminal:
start-all.bat
```

**Option B: Manually in Separate Terminals**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - MFApp:
```bash
cd MFApp
npm start
```

Terminal 3 - AuthApp:
```bash
cd AuthApp
npm start
```

Terminal 4 - ProjectApp:
```bash
cd ProjectApp
npm start
```

### Step 4: Access Your Application

- **Main App**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AuthApp**: http://localhost:3005
- **ProjectApp**: http://localhost:3004

---

## Testing Before Deployment

Before deploying, ensure everything works locally:

### ✅ Test Checklist

1. **Authentication**
   - [ ] Register a new user
   - [ ] Login with email/password
   - [ ] Google OAuth login works (if configured)
   - [ ] Logout works
   - [ ] Session persists on page refresh

2. **Profile & Settings**
   - [ ] View profile page
   - [ ] Edit profile information
   - [ ] Role badge displays correctly
   - [ ] Change password works

3. **Projects**
   - [ ] Create a new project
   - [ ] View project list
   - [ ] Edit project
   - [ ] Delete project with confirmation

4. **Tasks**
   - [ ] Add tasks to projects
   - [ ] Edit tasks
   - [ ] Delete tasks
   - [ ] Mark tasks as complete

5. **RBAC (Role-Based Access Control)**
   - [ ] Different roles see appropriate content
   - [ ] Permissions are enforced
   - [ ] Use `node change-role.js` to test different roles

6. **Navigation**
   - [ ] All routes work
   - [ ] Browser back/forward works
   - [ ] Direct URL access works

---

## Deployment Option 1: Vercel + Railway

**Best for**: Beginners, fast deployment, automatic CI/CD
**Cost**: Free tier available
**Time**: ~30-45 minutes

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Railway account (sign up at railway.app)

---

### Part A: Push Code to GitHub

#### Step 1: Initialize Git Repository (if not already done)

```bash
cd "C:\Users\Jadha\Desktop\1. MFEs-with-react"

# Initialize git
git init

# Create .gitignore file
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo .dist/ >> .gitignore
echo database.db >> .gitignore
```

#### Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `microfrontend-app` (or your preferred name)
4. Description: "Microfrontend application with Module Federation"
5. **DO NOT** initialize with README (you already have code)
6. Click "Create repository"

#### Step 3: Push Code to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - Microfrontend application"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/microfrontend-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### Part B: Deploy Backend to Railway

#### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your `microfrontend-app` repository
6. Railway will detect it's a Node.js app

#### Step 2: Configure Backend Service

1. Railway creates a service automatically
2. Click on the service → "Settings"
3. **Root Directory**: Set to `backend`
4. **Start Command**: `node src/server.js`

#### Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway provisions a PostgreSQL database
4. Note: You'll need to migrate from SQLite to PostgreSQL (see migration guide below)

#### Step 4: Set Environment Variables

1. Click on your backend service
2. Go to "Variables" tab
3. Add the following variables:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://your-mfapp.vercel.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Note**: `DATABASE_URL` will auto-populate if you connected PostgreSQL

#### Step 5: Deploy Backend

1. Railway auto-deploys on git push
2. Click "Deploy" to trigger manual deployment
3. Wait for deployment to complete (~2-5 minutes)
4. Copy your backend URL (e.g., `https://microfrontend-backend-production.up.railway.app`)

#### Step 6: Test Backend API

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/api/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

### Part C: Deploy Frontend Microfrontends to Vercel

You'll deploy **3 separate apps** to Vercel: MFApp, AuthApp, ProjectApp

---

#### Deploy MFApp (Host)

##### Step 1: Import Project to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel detects the project

##### Step 2: Configure MFApp Build Settings

**Framework Preset**: Other
**Root Directory**: `MFApp`
**Build Command**: `npm run build`
**Output Directory**: `.dist`
**Install Command**: `npm install`

##### Step 3: Add Environment Variables

Click "Environment Variables" and add:

```
NODE_ENV=production
```

##### Step 4: Update webpack.config.js for Production

**IMPORTANT**: Before deploying, update MFApp webpack config with production URLs.

In `MFApp/webpack.config.js`, find the `remotes` section and change:

```javascript
remotes: {
  "AuthAppHost": process.env.NODE_ENV === 'production'
    ? "AuthApp@https://your-authapp.vercel.app/remoteEntry.js"
    : "AuthApp@http://localhost:3005/remoteEntry.js",
  "ProjectAppHost": process.env.NODE_ENV === 'production'
    ? "ProjectApp@https://your-projectapp.vercel.app/remoteEntry.js"
    : "ProjectApp@http://localhost:3004/remoteEntry.js"
}
```

**Note**: You'll get the actual URLs after deploying AuthApp and ProjectApp. For now, use placeholders.

##### Step 5: Deploy MFApp

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Copy your MFApp URL (e.g., `https://microfrontend-host.vercel.app`)

---

#### Deploy AuthApp

##### Step 1: Create New Vercel Project

1. Vercel Dashboard → "Add New" → "Project"
2. Select same GitHub repository
3. Click "Import"

##### Step 2: Configure AuthApp Build Settings

**Framework Preset**: Other
**Root Directory**: `AuthApp`
**Build Command**: `npm run build`
**Output Directory**: `.dist`
**Install Command**: `npm install`

##### Step 3: Add Environment Variables

```
NODE_ENV=production
REACT_APP_API_URL=https://your-backend.railway.app
```

##### Step 4: Deploy AuthApp

1. Click "Deploy"
2. Wait for deployment
3. Copy AuthApp URL (e.g., `https://auth-microfrontend.vercel.app`)

---

#### Deploy ProjectApp

##### Step 1: Create New Vercel Project

1. Vercel Dashboard → "Add New" → "Project"
2. Select same repository
3. Click "Import"

##### Step 2: Configure ProjectApp Build Settings

**Framework Preset**: Other
**Root Directory**: `ProjectApp`
**Build Command**: `npm run build`
**Output Directory**: `.dist`
**Install Command**: `npm install`

##### Step 3: Add Environment Variables

```
NODE_ENV=production
REACT_APP_API_URL=https://your-backend.railway.app
```

##### Step 4: Deploy ProjectApp

1. Click "Deploy"
2. Copy ProjectApp URL (e.g., `https://projects-microfrontend.vercel.app`)

---

### Part D: Connect All Services

Now that all apps are deployed, you need to update configurations:

#### Step 1: Update MFApp Remote URLs

1. Go to your GitHub repository
2. Edit `MFApp/webpack.config.js`
3. Update the remotes section with your actual Vercel URLs:

```javascript
remotes: {
  "AuthAppHost": process.env.NODE_ENV === 'production'
    ? "AuthApp@https://auth-microfrontend.vercel.app/remoteEntry.js"
    : "AuthApp@http://localhost:3005/remoteEntry.js",
  "ProjectAppHost": process.env.NODE_ENV === 'production'
    ? "ProjectApp@https://projects-microfrontend.vercel.app/remoteEntry.js"
    : "ProjectApp@http://localhost:3004/remoteEntry.js"
}
```

4. Commit and push:
```bash
git add MFApp/webpack.config.js
git commit -m "Update production remote URLs"
git push
```

5. Vercel will auto-redeploy MFApp

#### Step 2: Update Backend CORS Settings

In Railway:

1. Go to your backend service → "Variables"
2. Update `FRONTEND_URL`:
```
FRONTEND_URL=https://microfrontend-host.vercel.app
```

3. Redeploy backend

#### Step 3: Update Frontend API URLs

In each frontend app, update API base URL.

**For AuthApp and ProjectApp**, if you have a config file, update:

```javascript
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend.railway.app'
  : 'http://localhost:5000';
```

#### Step 4: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Click on your OAuth Client ID
4. Add Authorized redirect URIs:
```
https://microfrontend-host.vercel.app/auth/google/callback
https://microfrontend-host.vercel.app
```
5. Add Authorized JavaScript origins:
```
https://microfrontend-host.vercel.app
```

#### Step 5: Test Production Deployment

1. Open your MFApp URL: `https://microfrontend-host.vercel.app`
2. Test all features:
   - ✅ Registration
   - ✅ Login
   - ✅ Projects CRUD
   - ✅ Tasks CRUD
   - ✅ Profile management
   - ✅ Password change
   - ✅ RBAC permissions

---

### Part E: Set Up Custom Domain (Optional)

#### On Vercel:

1. Go to your MFApp project → "Settings" → "Domains"
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Vercel provides DNS records to add to your domain registrar
4. Add DNS records:
   - Type: `CNAME`
   - Name: `app` (or `@` for root)
   - Value: `cname.vercel-dns.com`

5. Wait for DNS propagation (~10-60 minutes)
6. Vercel automatically provisions SSL certificate

#### Update All References:

After custom domain is set up, update:
- Railway backend `FRONTEND_URL`
- Google OAuth redirect URIs
- MFApp webpack remote URLs (if needed)

---

## Deployment Option 2: Render

**Best for**: Single platform management, automatic deployments
**Cost**: Free tier available
**Time**: ~45-60 minutes

### Prerequisites
- GitHub account
- Render account (sign up at render.com)
- Code pushed to GitHub

---

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Deploy Backend

#### A. Create PostgreSQL Database

1. Render Dashboard → "New" → "PostgreSQL"
2. Name: `microfrontend-db`
3. Database: `microfrontend`
4. User: `admin`
5. Region: Choose closest to your users
6. Plan: Free
7. Click "Create Database"
8. Copy the "Internal Database URL" (starts with `postgresql://`)

#### B. Create Backend Web Service

1. Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `microfrontend-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   DATABASE_URL=[Paste the Internal Database URL from PostgreSQL]
   FRONTEND_URL=https://microfrontend-host.onrender.com
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. Click "Create Web Service"
6. Wait for deployment (~5-10 minutes)
7. Copy your backend URL (e.g., `https://microfrontend-backend.onrender.com`)

### Step 3: Deploy Frontends as Static Sites

#### A. Deploy MFApp

1. Render Dashboard → "New" → "Static Site"
2. Connect repository
3. Configure:
   - **Name**: `microfrontend-host`
   - **Branch**: `main`
   - **Root Directory**: `MFApp`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.dist`

4. Add Environment Variables:
   ```
   NODE_ENV=production
   ```

5. Click "Create Static Site"

#### B. Deploy AuthApp

1. "New" → "Static Site"
2. Configure:
   - **Name**: `microfrontend-auth`
   - **Root Directory**: `AuthApp`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.dist`

3. Environment Variables:
   ```
   NODE_ENV=production
   REACT_APP_API_URL=https://microfrontend-backend.onrender.com
   ```

#### C. Deploy ProjectApp

1. "New" → "Static Site"
2. Configure:
   - **Name**: `microfrontend-projects`
   - **Root Directory**: `ProjectApp`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.dist`

3. Environment Variables:
   ```
   NODE_ENV=production
   REACT_APP_API_URL=https://microfrontend-backend.onrender.com
   ```

### Step 4: Update Configurations

Same as Vercel deployment:
- Update MFApp webpack remote URLs
- Update backend CORS
- Update Google OAuth settings
- Test production deployment

---

## Deployment Option 3: AWS

**Best for**: Enterprise, full control, scalability
**Cost**: Pay-as-you-go (can be expensive)
**Time**: ~2-3 hours
**Skill Level**: Advanced

### Architecture Overview

- **S3 + CloudFront**: Host static frontend files
- **Elastic Beanstalk or ECS**: Run backend Node.js app
- **RDS PostgreSQL**: Database
- **Route 53**: DNS management
- **Certificate Manager**: SSL certificates

### Step-by-Step AWS Deployment

Due to complexity, detailed AWS deployment is beyond this guide. However, here's the high-level process:

#### 1. Set Up AWS Account
- Create AWS account
- Set up IAM user with appropriate permissions
- Configure AWS CLI locally

#### 2. Deploy Backend to Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
cd backend
eb init -p node.js microfrontend-backend --region us-east-1

# Create environment
eb create microfrontend-backend-env

# Deploy
eb deploy
```

#### 3. Create RDS PostgreSQL Database

1. AWS Console → RDS → Create Database
2. PostgreSQL, Free Tier
3. Configure security groups
4. Note connection string

#### 4. Deploy Frontends to S3 + CloudFront

```bash
# Build frontends
cd MFApp && npm run build
cd ../AuthApp && npm run build
cd ../ProjectApp && npm run build

# Create S3 buckets
aws s3 mb s3://microfrontend-host
aws s3 mb s3://microfrontend-auth
aws s3 mb s3://microfrontend-projects

# Upload builds
aws s3 sync MFApp/.dist s3://microfrontend-host --acl public-read
aws s3 sync AuthApp/.dist s3://microfrontend-auth --acl public-read
aws s3 sync ProjectApp/.dist s3://microfrontend-projects --acl public-read

# Enable static website hosting
aws s3 website s3://microfrontend-host --index-document index.html
```

#### 5. Set Up CloudFront CDN

1. AWS Console → CloudFront → Create Distribution
2. Origin: Your S3 bucket website endpoint
3. Configure cache behaviors
4. Add SSL certificate from Certificate Manager

#### 6. Configure Route 53

1. Create hosted zone for your domain
2. Add A records pointing to CloudFront
3. Update domain registrar nameservers

---

## Deployment Option 4: DigitalOcean VPS with Docker

**Best for**: Cost-effective production, full control
**Cost**: $6-12/month
**Time**: ~1-2 hours

### Step 1: Create DigitalOcean Droplet

1. Sign up at https://www.digitalocean.com
2. Create Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic, $12/month (2GB RAM, 1 CPU)
   - **Datacenter**: Closest to your users
   - **Authentication**: SSH key (recommended) or password
   - **Hostname**: `microfrontend-app`

3. Click "Create Droplet"
4. Note your droplet's IP address

### Step 2: Connect to Server

```bash
# SSH into your droplet (replace IP with yours)
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y
```

### Step 3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### Step 4: Clone Repository

```bash
# Install Git
apt install git -y

# Clone your repository
cd /opt
git clone https://github.com/YOUR_USERNAME/microfrontend-app.git
cd microfrontend-app
```

### Step 5: Configure Environment

```bash
# Create .env file
nano backend/.env
```

Add:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://your_droplet_ip:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Save: `Ctrl + X`, `Y`, `Enter`

### Step 6: Build and Run with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 7: Configure Nginx Reverse Proxy

```bash
# Install Nginx
apt install nginx -y

# Create Nginx configuration
nano /etc/nginx/sites-available/microfrontend
```

Add:
```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Main App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/microfrontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 8: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS

# Auto-renewal is automatic, test with:
certbot renew --dry-run
```

### Step 9: Set Up Firewall

```bash
# Enable UFW firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Verify
ufw status
```

### Step 10: Set Up Auto-Restart

```bash
# Create systemd service for Docker Compose
nano /etc/systemd/system/microfrontend.service
```

Add:
```ini
[Unit]
Description=Microfrontend Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/microfrontend-app
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
systemctl enable microfrontend
systemctl start microfrontend
```

### Step 11: Point Domain to Droplet

1. Go to your domain registrar
2. Add an A record:
   - **Type**: A
   - **Name**: `@` (or subdomain like `app`)
   - **Value**: Your droplet IP address
   - **TTL**: 3600

3. Wait for DNS propagation (~10-60 minutes)

### Step 12: Test Deployment

```bash
# Check if services are running
docker-compose ps

# Test backend
curl http://localhost:5000/api/health

# Access via domain
curl https://yourdomain.com
```

---

## SQLite to PostgreSQL Migration

Your app currently uses SQLite, which doesn't work well in cloud environments. Here's how to migrate:

### Step 1: Install PostgreSQL Adapter

```bash
cd backend
npm install pg
```

### Step 2: Update Database Configuration

Create `backend/src/config/database-postgres.js`:

```javascript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
  }
});

export default pool;
```

### Step 3: Update Database Queries

Replace better-sqlite3 synchronous queries with async PostgreSQL queries:

**Before (SQLite):**
```javascript
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
```

**After (PostgreSQL):**
```javascript
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
const user = result.rows[0];
```

### Step 4: Create Database Schema

Create `backend/migrations/001_initial_schema.sql`:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  avatar TEXT,
  role VARCHAR(50) DEFAULT 'Developer',
  department VARCHAR(100),
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tasks_completed INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  provider VARCHAR(50),
  google_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
```

### Step 5: Run Migration

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL

# Run the migration
\i backend/migrations/001_initial_schema.sql

# Verify tables
\dt
```

---

## Post-Deployment Checklist

After deployment, verify everything works:

### ✅ Functionality Checklist

- [ ] **Homepage loads** without errors
- [ ] **User Registration** creates new accounts
- [ ] **Login** works with email/password
- [ ] **Google OAuth** works (if configured)
- [ ] **Session persistence** - refresh doesn't log out
- [ ] **Protected routes** redirect to login
- [ ] **Profile page** displays user info
- [ ] **Role badge** shows correct role
- [ ] **Change password** works
- [ ] **Projects CRUD** - create, edit, delete projects
- [ ] **Tasks CRUD** - create, edit, delete tasks
- [ ] **RBAC permissions** - different roles see different content
- [ ] **Logout** clears session

### ✅ Security Checklist

- [ ] **HTTPS enabled** - all URLs use https://
- [ ] **JWT_SECRET** is strong and secret
- [ ] **.env files** not committed to GitHub
- [ ] **CORS** only allows your frontend URL
- [ ] **SQL injection** protection (parameterized queries)
- [ ] **XSS protection** (React sanitizes by default)
- [ ] **Password hashing** with bcrypt
- [ ] **Google OAuth credentials** are production credentials

### ✅ Performance Checklist

- [ ] **Page load time** < 3 seconds
- [ ] **API response time** < 500ms
- [ ] **Images optimized**
- [ ] **Gzip compression** enabled
- [ ] **CDN configured** (if using CloudFront/Vercel CDN)
- [ ] **Database indexes** created

### ✅ Monitoring Setup

- [ ] **Error tracking** (Sentry, LogRocket)
- [ ] **Analytics** (Google Analytics, Plausible)
- [ ] **Uptime monitoring** (UptimeRobot, Pingdom)
- [ ] **Performance monitoring** (New Relic, DataDog)
- [ ] **Database backups** automated

---

## Troubleshooting

### Issue 1: "Module Federation remote not loading"

**Symptoms**: Console error: "Cannot load remote entry"

**Solutions**:
1. Check remote URLs in webpack.config.js
2. Ensure CORS is configured correctly
3. Verify remoteEntry.js exists at the URL
4. Check browser network tab for 404 errors
5. Ensure production URLs use https://

```javascript
// Debug: Log remote URLs
console.log('Remote URLs:', {
  authApp: 'https://your-authapp-url/remoteEntry.js',
  projectApp: 'https://your-projectapp-url/remoteEntry.js'
});
```

### Issue 2: "API requests failing with CORS error"

**Symptoms**: Browser console shows CORS policy error

**Solutions**:
1. Update backend CORS configuration:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-url.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

2. Verify FRONTEND_URL environment variable in backend
3. Check that API URL in frontend matches backend URL

### Issue 3: "Database connection failed"

**Symptoms**: Backend logs show database connection error

**Solutions**:
1. Verify DATABASE_URL is correct
2. Check database is running
3. Ensure IP whitelist includes your server
4. Test connection:
```bash
psql $DATABASE_URL
```

5. Check firewall rules

### Issue 4: "Google OAuth not working"

**Symptoms**: OAuth redirect fails or shows error

**Solutions**:
1. Check authorized redirect URIs in Google Console
2. Add production URL: `https://yourdomain.com/auth/google/callback`
3. Add authorized JavaScript origins: `https://yourdomain.com`
4. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
5. Ensure using production credentials, not localhost credentials

### Issue 5: "Build fails on Vercel/Railway"

**Symptoms**: Deployment fails during build step

**Solutions**:
1. Check build logs for specific error
2. Ensure all dependencies are in package.json
3. Verify build command is correct: `npm run build`
4. Check Node.js version compatibility
5. Clear build cache and retry

### Issue 6: "Role badge not showing"

**Symptoms**: Profile page doesn't display role badge

**Solutions**:
1. Check Profile.jsx has role badge code
2. Verify CSS is loaded (Profile.css)
3. Check user object has role property
4. Inspect element to see if classes are applied

### Issue 7: "Session lost on page refresh"

**Symptoms**: User logged out on refresh

**Solutions**:
1. Check localStorage for token
2. Verify JWT token expiration
3. Ensure AuthContext persists state
4. Check browser console for errors
5. Verify token is sent in API requests

### Issue 8: "Docker build fails"

**Symptoms**: docker-compose up fails

**Solutions**:
1. Check Dockerfile paths (use `.dist` not `dist`)
2. Ensure all files are copied correctly
3. Verify nginx.conf exists
4. Check Docker logs: `docker-compose logs`
5. Rebuild without cache: `docker-compose build --no-cache`

---

## Maintenance & Updates

### Updating Your Application

When you make changes and want to deploy:

#### For Vercel/Railway (Auto-Deploy):
```bash
git add .
git commit -m "Your update message"
git push
```
Both platforms auto-deploy on git push!

#### For Render:
Same as above - auto-deploys on push.

#### For DigitalOcean VPS:
```bash
# SSH into server
ssh root@your_droplet_ip

# Navigate to project
cd /opt/microfrontend-app

# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Backups

#### Railway/Render:
Both provide automatic backups. Configure in dashboard.

#### DigitalOcean:
```bash
# Backup database
docker exec microfrontend-db pg_dump -U postgres > backup-$(date +%Y%m%d).sql

# Restore from backup
cat backup-20231215.sql | docker exec -i microfrontend-db psql -U postgres
```

### Monitoring Logs

#### Vercel:
Dashboard → Your Project → Logs

#### Railway:
Dashboard → Service → Deploy Logs

#### DigitalOcean:
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
```

---

## Cost Breakdown

### Free Tier (Good for Learning/Testing)

| Service | Provider | Cost |
|---------|----------|------|
| Frontend Hosting | Vercel | FREE |
| Backend API | Railway | FREE (500 hrs/month) |
| Database | Railway PostgreSQL | FREE (500 MB) |
| **Total** | | **$0/month** |

**Limitations**: Slower cold starts, limited compute, small database

### Production Tier (Recommended)

| Service | Provider | Cost |
|---------|----------|------|
| Frontend Hosting | Vercel Pro | $20/month |
| Backend API | Railway Hobby | $5/month |
| Database | Railway PostgreSQL | $10/month |
| Domain | Namecheap | $12/year |
| SSL Certificate | Let's Encrypt | FREE |
| **Total** | | **~$36/month** |

### Enterprise Tier (High Traffic)

| Service | Provider | Cost |
|---------|----------|------|
| Frontend + CDN | AWS CloudFront + S3 | $50-200/month |
| Backend API | AWS ECS/Fargate | $50-150/month |
| Database | AWS RDS PostgreSQL | $40-100/month |
| Monitoring | DataDog/New Relic | $15-50/month |
| **Total** | | **$155-500/month** |

---

## Getting Help

### Official Documentation
- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app
- **Render**: https://render.com/docs
- **Docker**: https://docs.docker.com
- **PostgreSQL**: https://www.postgresql.org/docs/

### Community Support
- **Stack Overflow**: Tag questions with `microfrontends`, `module-federation`, `webpack`
- **Discord**: Join React and Webpack communities
- **GitHub Issues**: Report bugs in respective projects

### Debugging Tools
- **Browser DevTools**: Console, Network, Application tabs
- **React DevTools**: Chrome extension for React debugging
- **Postman/Insomnia**: API testing
- **pgAdmin**: PostgreSQL database GUI

---

## Next Steps

After successful deployment:

1. **Set up CI/CD pipeline** with GitHub Actions
2. **Add automated testing** (Jest, React Testing Library)
3. **Implement monitoring** (Sentry for errors, Google Analytics for usage)
4. **Add rate limiting** to API endpoints
5. **Optimize images and assets**
6. **Set up staging environment** for testing before production
7. **Document API endpoints** with Swagger/OpenAPI
8. **Add end-to-end tests** with Cypress or Playwright

---

## Conclusion

You now have a complete guide to deploy your microfrontend application! Start with Option 1 (Vercel + Railway) for the easiest deployment, then migrate to more advanced options as your needs grow.

**Recommended Path**:
1. Start: Vercel + Railway (Free)
2. Scale: Keep Vercel + Railway (Paid tiers)
3. Enterprise: Move to AWS/GCP/Azure

Good luck with your deployment! 🚀

---

**Need help?** Create an issue in your GitHub repository with:
- Deployment platform (Vercel/Railway/etc.)
- Error message
- Steps you've tried
- Screenshots (if applicable)
