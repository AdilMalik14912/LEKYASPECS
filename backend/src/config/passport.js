/**
 * passport.js — Google OAuth 2.0 configuration
 * Requires env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../config/db');
const { signToken } = require('../utils/jwt');
const { sendWelcomeEmail } = require('../utils/mailer');
require('dotenv').config();

const clientID = process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_to_prevent_passport_crash';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret';

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const name  = profile.displayName || 'Google User';

        if (!email) return done(new Error('No email from Google'), null);

        // Check if user already exists
        let userRes = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userRes.rows.length === 0) {
          // New user — register them (no password needed for OAuth)
          await db.query(
            `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
            [name, email, 'OAUTH_GOOGLE_NO_PASSWORD']
          );
          userRes = await db.query('SELECT * FROM users WHERE email = ?', [email]);

          // Send welcome email (non-blocking)
          sendWelcomeEmail({ to: email, name }).catch(console.warn);
        }

        const user = userRes.rows[0];
        const token = signToken({ id: user.id, name: user.name, email: user.email });

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;
