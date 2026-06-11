import { Router } from 'express';
import User from '../models/User.js';
import Module from '../models/Module.js';
import Case from '../models/Case.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import { protect, role } from '../middleware/auth.js';

const router = Router();

router.get('/overview', protect, role('admin'), async (req, res) => {
  const [users, students, teachers, modules, cases, tasks, submissions] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    Module.countDocuments(),
    Case.countDocuments(),
    Task.countDocuments(),
    Submission.countDocuments()
  ]);
  res.json({ stats: { users, students, teachers, modules, cases, tasks, submissions } });
});

router.get('/users', protect, role('admin'), async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

router.put('/users/:id', protect, role('admin'), async (req, res) => {
  const allowed = ['fullName', 'role', 'school', 'grade', 'city', 'rating'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
  const u = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ user: u });
});

router.delete('/users/:id', protect, role('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Submission.deleteMany({ student: req.params.id });
  res.json({ ok: true });
});

export default router;
