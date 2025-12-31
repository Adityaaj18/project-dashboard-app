import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './database.js';
import dotenv from 'dotenv';

dotenv.config();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.emails[0].value);

        if (user) {
          // User exists, update google_id if not set
          if (!user.google_id) {
            db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(profile.id, user.id);
            user.google_id = profile.id;
          }
        } else {
          // Create new user
          // Note: password is NOT NULL in SQLite, so we use a placeholder
          const stmt = db.prepare(`
            INSERT INTO users (name, email, password, google_id, role, department, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
          `);

          const result = stmt.run(
            profile.displayName,
            profile.emails[0].value,
            'GOOGLE_OAUTH_USER', // Placeholder password for Google users
            profile.id,
            'Developer', // Default role
            'Engineering' // Default department
          );

          user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        }

        // Remove sensitive data
        const { password, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
