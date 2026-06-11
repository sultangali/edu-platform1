import { Router } from 'express';
import Case from '../models/Case.js';
import Task from '../models/Task.js';
import { protect, role } from '../middleware/auth.js';
import { sanitizeTasks } from '../utils/sanitize.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  const filter = {};
  if (req.query.module) filter.module = req.query.module;
  const cases = await Case.find(filter).sort({ week: 1, caseNumber: 1 });
  res.json({ cases });
});

router.get('/:id', protect, async (req, res) => {
  const c = await Case.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  const tasks = await Task.find({ case: c._id }).sort({ section: 1, difficulty: 1, _id: 1 });
  res.json({ case: c, tasks: sanitizeTasks(tasks, req.user) });
});

router.post('/', protect, role('teacher', 'admin'), async (req, res) => {
  const c = await Case.create(req.body);
  res.status(201).json({ case: c });
});

router.put('/:id', protect, role('teacher', 'admin'), async (req, res) => {
  const c = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ case: c });
});

router.delete('/:id', protect, role('teacher', 'admin'), async (req, res) => {
  await Case.findByIdAndDelete(req.params.id);
  await Task.deleteMany({ case: req.params.id });
  res.json({ ok: true });
});

export default router;
