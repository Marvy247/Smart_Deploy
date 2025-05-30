import { Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Request } from 'express';

interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails?: Array<{ value: string }>;
}

declare global {
  namespace Express {
    interface User extends GitHubProfile {}
    interface Request {
      user?: User;
    }
  }
}

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// GitHub OAuth configuration
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback'
},
async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: (error: any, user?: GitHubProfile) => void) => {
  // Simple profile handling for MVP
  const user = {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    email: profile.emails?.[0]?.value
  };
  return done(null, user);
}));

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, generate JWT
    const token = jwt.sign({ 
      userId: req.user?.id,
      githubUsername: req.user?.username 
    }, SECRET_KEY, { expiresIn: '1h' });
    
    // Redirect with token for MVP simplicity
    res.redirect(`${process.env.FRONTEND_URL}/auth?token=${token}`);
  }
);

router.post('/github/callback', 
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = jwt.sign({
      userId: req.user?.id,
      githubUsername: req.user?.username
    }, SECRET_KEY, { expiresIn: '1h' });
    
    res.json({ token });
  }
);

// Keep simple login for development
router.post('/login', (req, res) => {
  const token = jwt.sign({ userId: 1 }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

export default router;
