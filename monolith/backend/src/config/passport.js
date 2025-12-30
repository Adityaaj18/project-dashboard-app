const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');

// Generate avatar URL
const generateAvatar = (name) => {
  const initial = name.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
};

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').get('google', profile.id);

          if (!user) {
            // Check if email exists with different provider
            const emailUser = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.emails[0].value);

            if (emailUser) {
              return done(null, false, { message: 'Email already exists with different provider' });
            }

            // Create new user
            const name = profile.displayName || profile.emails[0].value.split('@')[0];
            const avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : generateAvatar(name);

            const result = db.prepare(`
              INSERT INTO users (name, email, role, department, avatar, provider, provider_id)
              VALUES (?, ?, 'viewer', 'General', ?, 'google', ?)
            `).run(name, profile.emails[0].value, avatar, profile.id);

            user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth configured');
} else {
  console.log('⚠️  Google OAuth not configured (missing credentials in .env)');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, department, avatar, provider FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
