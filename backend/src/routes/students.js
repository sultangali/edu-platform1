import { Router } from 'express';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import { protect, role } from '../middleware/auth.js';

const router = Router();

router.get('/leaderboard', protect, async (req, res) => {
  const top = await User.find({ role: 'student' })
    .sort({ rating: -1 })
    .limit(50)
    .select('fullName avatar rating xp level streak badges school city');
  res.json({ leaderboard: top });
});

router.get('/me/stats', protect, role('student'), async (req, res) => {
  const subs = await Submission.find({ student: req.user._id }).populate('task', 'topic title');
  const correct = subs.filter(s => s.isCorrect).length;
  const total = subs.length;
  const byTopic = {};
  for (const s of subs) {
    const t = s.task?.topic || 'general';
    byTopic[t] = byTopic[t] || { total: 0, correct: 0 };
    byTopic[t].total++;
    if (s.isCorrect) byTopic[t].correct++;
  }
  res.json({
    user: req.user,
    stats: {
      total, correct,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
      byTopic
    },
    recentSubmissions: subs.slice(-10).reverse()
  });
});

router.get('/:id', protect, async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ message: 'Not found' });
  res.json({ user: u });
});

export default router;
