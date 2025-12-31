import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3004'}/login?error=auth_failed`,
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3004'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3004'}/login?error=token_generation_failed`);
    }
  }
);

export default router;
