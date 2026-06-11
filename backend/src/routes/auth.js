import { Router } from 'express';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, school, grade, city } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already used' });
    const user = await User.create({
      fullName, email, password,
      role: role === 'teacher' ? 'teacher' : 'student',
      school: school || '', grade: grade || '', city: city || 'Алматы'
    });
    res.status(201).json({
      token: signToken(user._id),
      user: sanitize(user)
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await user.matchPassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({ token: signToken(user._id), user: sanitize(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: sanitize(req.user) });
});

router.put('/me', protect, async (req, res) => {
  const fields = ['fullName', 'avatar', 'city', 'school', 'grade', 'language', 'bio', 'subject'];
  for (const f of fields) if (req.body[f] !== undefined) req.user[f] = req.body[f];
  await req.user.save();
  res.json({ user: sanitize(req.user) });
});

function sanitize(u) {
  const obj = u.toObject();
  delete obj.password;
  return obj;
}

export default router;
