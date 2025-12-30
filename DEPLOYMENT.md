# Deployment Guide - Microfrontend Application

This guide covers deploying your microfrontend application using Docker and various cloud platforms.

## Table of Contents
- [Local Deployment with Docker](#local-deployment-with-docker)
- [Cloud Deployment Options](#cloud-deployment-options)
- [Production Checklist](#production-checklist)

---

## Local Deployment with Docker

### Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### Quick Start   

1. **Clone/Navigate to your project directory**
   ```bash
   cd "c:\Users\Jadha\Desktop\1. MFEs-with-react"
   ```

2. **Create environment file**
   ```bash
   copy .env.example .env
   ```

   Edit `.env` and update the following:
   - `JWT_SECRET` - Use a strong random string
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Your OAuth credentials
   - `FRONTEND_URL` - Your frontend URL

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access your application**
   - Main App: http://localhost:3000
   - Auth App: http://localhost:3001
   - Project App: http://localhost:3002
   - Backend API: http://localhost:5000

### Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Remove all containers and volumes
docker-compose down -v
```

---

## Cloud Deployment Options

### Option 1: Vercel + Railway (Recommended for beginners)

**Frontend (Vercel)**
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Deploy each microfrontend separately:
   - MFApp: Root directory = `/MFApp`
   - AuthApp: Root directory = `/AuthApp`
   - ProjectApp: Root directory = `/ProjectApp`
5. Set build command: `npm run build`
6. Set output directory: `dist`

**Backend (Railway)**
1. Go to [Railway](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select your repository and `/backend` directory
4. Add environment variables:
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `FRONTEND_URL` (your Vercel URL)
5. Railway auto-detects Node.js and deploys

**Database**
- Railway provides PostgreSQL for free
- You'll need to migrate from SQLite to PostgreSQL (see below)

### Option 2: Render (All-in-one)

1. Go to [Render](https://render.com)
2. Create Web Services for each:
   - **Backend**:
     - Build: `npm install`
     - Start: `node src/server.js`
     - Add environment variables
   - **MFApp, AuthApp, ProjectApp**:
     - Build: `npm run build`
     - Publish directory: `dist`
     - Add as Static Sites

### Option 3: AWS (Advanced)

**S3 + CloudFront (Frontend)**
```bash
# Build all frontends
npm run build

# Upload to S3
aws s3 sync ./MFApp/dist s3://your-mfapp-bucket
aws s3 sync ./AuthApp/dist s3://your-authapp-bucket
aws s3 sync ./ProjectApp/dist s3://your-projectapp-bucket

# Create CloudFront distributions for CDN
```

**EC2 or ECS (Backend)**
- Launch EC2 instance
- Install Docker
- Pull and run your backend container

**RDS (Database)**
- Create PostgreSQL RDS instance
- Update connection string in backend

### Option 4: Docker on VPS (DigitalOcean, Linode, etc.)

1. **Create a droplet/VPS**
   - Ubuntu 22.04 LTS
   - At least 2GB RAM

2. **SSH into your server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Clone your repository**
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your values
   ```

6. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

7. **Set up reverse proxy (Nginx)**
   ```bash
   apt install nginx certbot python3-certbot-nginx

   # Configure Nginx (see nginx-config-example below)
   nano /etc/nginx/sites-available/mfe-app

   # Enable site
   ln -s /etc/nginx/sites-available/mfe-app /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx

   # Get SSL certificate
   certbot --nginx -d yourdomain.com
   ```

**Nginx Configuration Example** (`/etc/nginx/sites-available/mfe-app`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Main App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth App
    location /auth/ {
        proxy_pass http://localhost:3001/;
    }

    # Project App
    location /projects/ {
        proxy_pass http://localhost:3002/;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
    }
}
```

---

## Migrating from SQLite to PostgreSQL

For production, you should use PostgreSQL instead of SQLite.

### 1. Install PostgreSQL adapter
```bash
cd backend
npm install pg
```

### 2. Update database configuration

Create `backend/src/config/database-postgres.js`:
```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

### 3. Convert SQL queries
Replace SQLite `better-sqlite3` queries with PostgreSQL async queries:

```javascript
// SQLite (before)
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// PostgreSQL (after)
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
const user = result.rows[0];
```

### 4. Run migrations
Create and run SQL migration file to set up PostgreSQL schema.

---

## Production Checklist

Before deploying to production:

- [ ] **Environment Variables**
  - [ ] Set strong `JWT_SECRET` (min 32 characters)
  - [ ] Configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
  - [ ] Update `FRONTEND_URL` to production URL
  - [ ] Set `NODE_ENV=production`

- [ ] **Security**
  - [ ] Enable CORS for production URLs only
  - [ ] Use HTTPS/SSL certificates
  - [ ] Set secure cookie flags
  - [ ] Add rate limiting to API
  - [ ] Remove console.logs from production code

- [ ] **Database**
  - [ ] Migrate from SQLite to PostgreSQL/MySQL
  - [ ] Set up automated backups
  - [ ] Create database indexes for performance

- [ ] **Performance**
  - [ ] Enable gzip compression (already in nginx.conf)
  - [ ] Set up CDN for static assets
  - [ ] Optimize images
  - [ ] Enable caching headers

- [ ] **Monitoring**
  - [ ] Set up error tracking (Sentry, LogRocket)
  - [ ] Add application monitoring (New Relic, DataDog)
  - [ ] Configure log aggregation
  - [ ] Set up uptime monitoring

- [ ] **Google OAuth**
  - [ ] Add production URLs to Google Console authorized redirects
  - [ ] Update OAuth consent screen

- [ ] **Testing**
  - [ ] Test all features in production environment
  - [ ] Verify RBAC permissions work correctly
  - [ ] Test login/logout flows
  - [ ] Verify project and task CRUD operations

---

## Environment-Specific URLs

Update webpack configs to use environment-specific URLs:

### MFApp/webpack.config.js
```javascript
new ModuleFederationPlugin({
  remotes: {
    authApp: process.env.NODE_ENV === 'production'
      ? 'authApp@https://auth.yourdomain.com/remoteEntry.js'
      : 'authApp@http://localhost:3001/remoteEntry.js',
    projectApp: process.env.NODE_ENV === 'production'
      ? 'projectApp@https://projects.yourdomain.com/remoteEntry.js'
      : 'projectApp@http://localhost:3002/remoteEntry.js'
  }
})
```

---

## Troubleshooting

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

**Docker build fails:**
```bash
# Clear Docker cache
docker system prune -a
docker-compose build --no-cache
```

**Module Federation not loading:**
- Check CORS settings
- Verify remote URLs are accessible
- Check browser console for errors

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check firewall rules
- Ensure PostgreSQL is running

---

## Support

For deployment issues:
- Check application logs: `docker-compose logs -f`
- Verify environment variables are set correctly
- Ensure all ports are accessible
- Review CORS and security settings

## Next Steps

After deployment:
1. Set up automated backups
2. Configure monitoring and alerts
3. Set up CI/CD pipeline (GitHub Actions, GitLab CI)
4. Implement automated testing
5. Add documentation for your team
