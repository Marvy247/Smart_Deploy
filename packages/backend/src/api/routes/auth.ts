import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

router.post('/login', (req, res) => {
  // For demo purposes, accept any login attempt
  const token = jwt.sign({ userId: 1 }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

export default router;
