// Standalone seed for the "90 problem-based tasks" module ONLY.
//
//   npm run seed:problems
//
// Idempotent: removes a previously-seeded problems module (and its cases/tasks/
// submissions) and rebuilds it. Does NOT touch users or other modules, so it is
// safe to run on an existing database.

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/User.js';
import Module from './models/Module.js';
import Case from './models/Case.js';
import Task from './models/Task.js';
import Submission from './models/Submission.js';
import { buildProblemsModule, DEFAULT_ZOOM_URL } from './data/buildProblemsModule.js';

const TITLE_KK = 'Проблемалық есептер: Квадраттық функция (90 есеп)';

async function run() {
  await connectDB(process.env.MONGO_URI);

  // Pick a teacher to own the module: the math teacher if present, else any teacher,
  // else fall back to an admin.
  const teacher =
    (await User.findOne({ email: 'teacher1@edu.kz' })) ||
    (await User.findOne({ role: 'teacher' })) ||
    (await User.findOne({ role: 'admin' }));

  if (!teacher) {
    console.error('❌ Алдымен қолданушыларды сидтеңіз (npm run seed). Ұстаз табылмады.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // Remove any previously seeded problems module(s) and their dependents.
  const existing = await Module.find({ 'title.kk': TITLE_KK });
  for (const m of existing) {
    await Promise.all([
      Task.deleteMany({ module: m._id }),
      Case.deleteMany({ module: m._id }),
      Submission.deleteMany({ module: m._id })
    ]);
    await Module.deleteOne({ _id: m._id });
  }
  if (existing.length) console.log(`♻️  Ескі «90 есеп» модулі тазартылды (${existing.length}).`);

  console.log('🧮 «90 проблемалық есеп» модулі құрылуда...');
  const { module, cases, tasks } = await buildProblemsModule({
    teacherId: teacher._id,
    zoomUrl: DEFAULT_ZOOM_URL
  });

  console.log(`✅ Дайын: 1 модуль · ${cases.length} кейс · ${tasks.length} тапсырма`);
  console.log(`   Иесі: ${teacher.fullName} (${teacher.email})`);
  console.log(`   Zoom: ${module.zoomUrl}`);
  console.log('   ⚠️  Жауаптар тек ұстаз/әкімшіге көрінеді.');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
