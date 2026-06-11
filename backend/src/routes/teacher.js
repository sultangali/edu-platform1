import { Router } from 'express';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Module from '../models/Module.js';
import Task from '../models/Task.js';
import Case from '../models/Case.js';
import { protect, role } from '../middleware/auth.js';

const router = Router();

router.get('/analytics', protect, role('teacher', 'admin'), async (req, res) => {
  const myModules = await Module.find({ teacher: req.user._id });
  const moduleIds = myModules.map(m => m._id);
  const tasks = await Task.find({ module: { $in: moduleIds } });
  const cases = await Case.find({ module: { $in: moduleIds } });
  const submissions = await Submission.find({ module: { $in: moduleIds } })
    .populate('student', 'fullName avatar rating xp level school grade')
    .populate('task', 'title topic difficulty');

  const studentMap = new Map();
  for (const s of submissions) {
    if (!s.student) continue;
    const id = String(s.student._id);
    const cur = studentMap.get(id) || {
      student: s.student, total: 0, correct: 0, xpEarned: 0, ratingEarned: 0
    };
    cur.total++;
    if (s.isCorrect) cur.correct++;
    cur.xpEarned += s.xpEarned;
    cur.ratingEarned += s.ratingEarned;
    studentMap.set(id, cur);
  }
  const students = Array.from(studentMap.values()).sort((a, b) => b.ratingEarned - a.ratingEarned);

  const topicMap = {};
  for (const s of submissions) {
    const t = s.task?.topic || 'general';
    topicMap[t] = topicMap[t] || { total: 0, correct: 0 };
    topicMap[t].total++;
    if (s.isCorrect) topicMap[t].correct++;
  }

  const caseMap = {};
  for (const s of submissions) {
    const cid = String(s.case);
    caseMap[cid] = caseMap[cid] || { total: 0, correct: 0 };
    caseMap[cid].total++;
    if (s.isCorrect) caseMap[cid].correct++;
  }
  const caseStats = cases.map(c => ({
    case: c,
    total: caseMap[String(c._id)]?.total || 0,
    correct: caseMap[String(c._id)]?.correct || 0
  }));

  res.json({
    summary: {
      modules: myModules.length,
      cases: cases.length,
      tasks: tasks.length,
      submissions: submissions.length,
      activeStudents: students.length
    },
    students,
    byTopic: topicMap,
    caseStats,
    modules: myModules
  });
});

router.get('/students', protect, role('teacher', 'admin'), async (req, res) => {
  const list = await User.find({ role: 'student' })
    .select('fullName email avatar rating xp level streak school grade city');
  res.json({ students: list });
});

export default router;
