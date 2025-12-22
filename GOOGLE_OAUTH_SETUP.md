# Google OAuth Setup Guide

This guide will help you configure Google OAuth authentication for your microfrontend application.

## Overview

The Google OAuth implementation allows users to sign in using their Google accounts. The flow works as follows:

1. User clicks "Continue with Google" button
2. User is redirected to Google's OAuth consent screen
3. After authorization, Google redirects back to your backend callback URL
4. Backend exchanges the authorization code for user info
5. Backend creates/updates user in database and generates JWT token
6. Backend redirects to frontend with token and user data
7. Frontend stores the token and redirects to dashboard

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing one)
   - Click "Select a project" → "New Project"
   - Enter project name (e.g., "Microfrontend Auth")
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" user type → Click "Create"
   - Fill in the required fields:
     - App name: Your app name
     - User support email: Your email
     - Developer contact email: Your email
   - Click "Save and Continue"
   - Skip scopes (or add email and profile if needed)
   - Add test users if needed
   - Click "Save and Continue"

5. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Microfrontend Web Client"
   - Authorized JavaScript origins:
     ```
     http://localhost:3004
     http://localhost:5000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these!)

## Step 2: Update Backend Environment Variables

1. Open the file: `backend/.env`

2. Update the Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   FRONTEND_URL=http://localhost:3004
   ```

3. Replace `your-actual-client-id-here` and `your-actual-client-secret-here` with the values from Step 1.

## Step 3: Restart the Backend Server

1. Stop the backend server (Ctrl+C if running)

2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```

3. You should see the server start successfully with OAuth routes:
   ```
   🚀 Server running on http://localhost:5000
   ```

## Step 4: Test the OAuth Flow

1. **Make sure all servers are running:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - AuthApp
   cd AuthApp
   npm start

   # Terminal 3 - DashboardApp
   cd DashboardApp
   npm start

   # Terminal 4 - ProjectApp
   cd ProjectApp
   npm start

   # Terminal 5 - MFApp (host)
   cd MFApp
   npm start
   ```

2. **Open your browser**
   - Navigate to: http://localhost:3004
   - Click "Login" (or you'll be redirected automatically if not logged in)

3. **Click "Continue with Google"**
   - You'll be redirected to Google's consent screen
   - Select your Google account
   - Grant permissions
   - You'll be redirected back to your app and logged in!

## How It Works

### Backend Components

1. **`backend/src/config/passport.js`**
   - Configures Passport.js with Google OAuth strategy
   - Handles user creation/update when logging in with Google
   - Stores Google ID in the database

2. **`backend/src/routes/googleAuth.js`**
   - `/api/auth/google` - Initiates OAuth flow
   - `/api/auth/google/callback` - Handles OAuth callback

3. **`backend/src/config/database.js`**
   - Users table now includes `google_id` column
   - Password is nullable for Google OAuth users

### Frontend Components

1. **`AuthApp/src/context/AuthContext.jsx`**
   - `loginWithGoogle()` redirects to backend OAuth endpoint

2. **`MFApp/src/pages/AuthCallbackPage.jsx`**
   - Handles the OAuth redirect from backend
   - Extracts token and user data from URL
   - Stores in localStorage and redirects to dashboard

3. **`MFApp/src/App.jsx`**
   - Added `/auth/callback` route

## Database Schema Changes

The users table now supports Google OAuth with these additions:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,              -- Now nullable for OAuth users
  google_id TEXT UNIQUE,      -- NEW: Stores Google OAuth ID
  avatar TEXT,
  role TEXT DEFAULT 'Developer',
  department TEXT DEFAULT 'Engineering',
  -- ... other fields
);
```

## Security Considerations

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Validate redirect URIs** - Ensure they match Google Console settings
4. **Store tokens securely** - Use httpOnly cookies in production
5. **Implement CSRF protection** - Add state parameter to OAuth flow

## Production Deployment

When deploying to production:

1. **Update Google Console:**
   - Add production domain to "Authorized JavaScript origins"
   - Add production callback URL to "Authorized redirect URIs"
   - Example: `https://yourdomain.com/api/auth/google/callback`

2. **Update Environment Variables:**
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   SESSION_SECRET=use-a-strong-random-secret-here
   ```

3. **Enable HTTPS:**
   - Set `secure: true` for cookies in production
   - Use reverse proxy (nginx) with SSL certificate

## Troubleshooting

### "redirect_uri_mismatch" error
- Ensure the callback URL in Google Console exactly matches your backend URL
- Check for trailing slashes and http vs https

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user if using External user type

### User not created in database
- Check backend logs for errors
- Verify database connection
- Ensure google_id column exists in users table

### Token not being stored
- Check browser console for errors
- Verify AuthCallbackPage is rendering
- Check localStorage in browser DevTools

## Testing with Multiple Google Accounts

To test with different Google accounts:

1. Use browser's incognito/private mode
2. Clear cookies and localStorage between tests
3. Add multiple test users in Google Console (for External apps)

## Support

For issues or questions, check:
- Backend logs: Terminal where `npm run dev` is running
- Browser console: Press F12 → Console tab
- Network tab: Check OAuth redirect flows
