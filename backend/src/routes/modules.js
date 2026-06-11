import { Router } from 'express';
import Module from '../models/Module.js';
import Case from '../models/Case.js';
import Task from '../models/Task.js';
import { protect, role } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  const modules = await Module.find().populate('teacher', 'fullName email avatar').sort({ order: 1 });
  // Enrich with real case/task counts so the UI never shows hardcoded numbers.
  const [caseCounts, taskCounts] = await Promise.all([
    Case.aggregate([{ $group: { _id: '$module', n: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$module', n: { $sum: 1 } } }])
  ]);
  const caseMap = Object.fromEntries(caseCounts.map(c => [String(c._id), c.n]));
  const taskMap = Object.fromEntries(taskCounts.map(t => [String(t._id), t.n]));
  const withCounts = modules.map(m => ({
    ...m.toObject(),
    caseCount: caseMap[String(m._id)] || 0,
    taskCount: taskMap[String(m._id)] || 0
  }));
  res.json({ modules: withCounts });
});

router.get('/:id', protect, async (req, res) => {
  const module = await Module.findById(req.params.id).populate('teacher', 'fullName avatar');
  if (!module) return res.status(404).json({ message: 'Not found' });
  const cases = await Case.find({ module: module._id }).sort({ week: 1, caseNumber: 1 });
  res.json({ module, cases });
});

router.post('/', protect, role('teacher', 'admin'), async (req, res) => {
  const data = { ...req.body, teacher: req.user._id };
  const module = await Module.create(data);
  res.status(201).json({ module });
});

router.put('/:id', protect, role('teacher', 'admin'), async (req, res) => {
  const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ module });
});

router.delete('/:id', protect, role('teacher', 'admin'), async (req, res) => {
  await Module.findByIdAndDelete(req.params.id);
  await Case.deleteMany({ module: req.params.id });
  await Task.deleteMany({ module: req.params.id });
  res.json({ ok: true });
});

export default router;
