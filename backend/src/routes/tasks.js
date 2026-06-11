import { Router } from 'express';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Case from '../models/Case.js';
import { protect, role } from '../middleware/auth.js';
import { recomputeLevel, awardBadges, updateStreak } from '../utils/gamification.js';
import { sanitizeTask, sanitizeTasks } from '../utils/sanitize.js';
import { isAnswerCorrect } from '../utils/grading.js';

const router = Router();

router.get('/', protect, async (req, res) => {
  const filter = {};
  if (req.query.case) filter.case = req.query.case;
  if (req.query.module) filter.module = req.query.module;
  const tasks = await Task.find(filter);
  res.json({ tasks: sanitizeTasks(tasks, req.user) });
});

router.get('/:id', protect, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json({ task: sanitizeTask(task, req.user) });
});

router.post('/', protect, role('teacher', 'admin'), async (req, res) => {
  const c = await Case.findById(req.body.case);
  if (!c) return res.status(400).json({ message: 'Case not found' });
  const data = { ...req.body, module: c.module, createdBy: req.user._id };
  const task = await Task.create(data);
  res.status(201).json({ task });
});

router.put('/:id', protect, role('teacher', 'admin'), async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ task });
});

router.delete('/:id', protect, role('teacher', 'admin'), async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  await Submission.deleteMany({ task: req.params.id });
  res.json({ ok: true });
});

// Submit answer
router.post('/:id/submit', protect, role('student'), async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const existing = await Submission.findOne({ student: req.user._id, task: task._id });
  if (existing) return res.status(400).json({ message: 'Already submitted', submission: existing });

  const { selectedIndex, answer } = req.body;
  const isCorrect = isAnswerCorrect(task, { selectedIndex, answer });

  const sub = await Submission.create({
    student: req.user._id,
    task: task._id,
    case: task.case,
    module: task.module,
    answer: answer || '',
    selectedIndex,
    isCorrect,
    xpEarned: isCorrect ? task.xpReward : Math.floor(task.xpReward / 4),
    ratingEarned: isCorrect ? task.ratingReward : 0
  });

  const user = await User.findById(req.user._id);
  user.xp += sub.xpEarned;
  user.rating += sub.ratingEarned;
  if (isCorrect) {
    user.coins += task.coinReward;
    if (!user.completedTasks.find(t => String(t) === String(task._id))) {
      user.completedTasks.push(task._id);
    }
  }
  updateStreak(user);
  recomputeLevel(user);
  const newBadges = awardBadges(user);
  await user.save();

  res.json({ submission: sub, user, newBadges });
});

export default router;
