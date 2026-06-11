import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/User.js';
import Module from './models/Module.js';
import Case from './models/Case.js';
import Task from './models/Task.js';
import Submission from './models/Submission.js';
import { recomputeLevel, awardBadges } from './utils/gamification.js';
import { MODULE, WEEKS, TASKS, LEVEL_TITLES } from './data/quadratic.js';
import { buildProblemsModule, DEFAULT_ZOOM_URL } from './data/buildProblemsModule.js';

const KZ_NAMES = [
  'Ержан Сұлтанов', 'Айгерім Нұрланқызы', 'Дамир Әлішерұлы', 'Айдана Темірбекқызы',
  'Бекзат Қайратұлы', 'Ақерке Серікқызы', 'Алмас Жанболатұлы', 'Динара Болатқызы',
  'Нұрлан Ермекұлы', 'Әсем Аманқызы', 'Тимур Дәуренұлы', 'Жанар Ғалымжанқызы',
  'Ғалымжан Сериков', 'Мадина Айтжанова', 'Арман Бекболатов', 'Балжан Ермекова',
  'Қуаныш Сатыбалдиев', 'Дария Ерболатова', 'Бауыржан Қасенов', 'Гүлнұр Ілиясова'
];

const TEACHER_NAMES = [
  'Айгүл Ермекқызы Сейтова',
  'Серік Болатұлы Жұмабаев',
  'Мейрамгүл Қайратқызы Дүйсенова'
];

const KZ_CITIES = ['Алматы', 'Астана', 'Шымкент', 'Қарағанды', 'Ақтөбе', 'Тараз', 'Павлодар', 'Орал'];
const SCHOOLS = ['№25 мектеп-гимназиясы', 'НЗМ Алматы', 'Дарын мектебі', 'РФМШ', 'БИЛ', 'Лицей №38'];
const GRADES = ['8А', '8Б', '8В', '8Г'];

const CASE_ICONS = ['🎯', '🚀', '💡', '🔥', '⭐', '🎨', '🧩', '🛠️', '🏁', '📐', '📊', '🏆'];
const CASE_COLORS = [
  'from-pink-500 to-rose-500', 'from-indigo-500 to-purple-600', 'from-green-400 to-emerald-600',
  'from-yellow-400 to-orange-500', 'from-red-400 to-pink-600', 'from-teal-400 to-cyan-600',
  'from-purple-500 to-fuchsia-600', 'from-blue-500 to-indigo-600', 'from-lime-400 to-green-600',
  'from-sky-400 to-blue-600', 'from-amber-400 to-orange-600', 'from-violet-500 to-purple-700'
];
const DIFFICULTY = { 1: 'easy', 2: 'medium', 3: 'hard' };

const weekOf = (day) => Math.ceil(day / 3);          // 1..12 -> 1..4
const caseNoOf = (day) => ((day - 1) % 3) + 1;       // 1..12 -> 1,2,3

const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];

async function run() {
  await connectDB(process.env.MONGO_URI);
  console.log('🌱 Ескі деректер тазартылуда...');
  await Promise.all([
    User.deleteMany({}),
    Module.deleteMany({}),
    Case.deleteMany({}),
    Task.deleteMany({}),
    Submission.deleteMany({})
  ]);

  console.log('👤 Қолданушылар жасалуда...');
  const admin = await User.create({
    fullName: 'Сұлтан Жұмағалиев',
    email: 'admin@edu.kz',
    password: 'admin123',
    role: 'admin',
    city: 'Астана',
    iin: '900101300123'
  });

  const teachers = [];
  for (let i = 0; i < TEACHER_NAMES.length; i++) {
    const t = await User.create({
      fullName: TEACHER_NAMES[i],
      email: `teacher${i + 1}@edu.kz`,
      password: 'teacher123',
      role: 'teacher',
      city: KZ_CITIES[i % KZ_CITIES.length],
      school: SCHOOLS[i % SCHOOLS.length],
      subject: ['Математика', 'Физика', 'Қазақ тілі'][i],
      bio: 'Жоғары санатты ұстаз, 10+ жыл тәжірибе.'
    });
    teachers.push(t);
  }

  const students = [];
  for (let i = 0; i < KZ_NAMES.length; i++) {
    const s = await User.create({
      fullName: KZ_NAMES[i],
      email: `student${i + 1}@edu.kz`,
      password: 'student123',
      role: 'student',
      city: KZ_CITIES[i % KZ_CITIES.length],
      school: SCHOOLS[i % SCHOOLS.length],
      grade: GRADES[i % GRADES.length],
      iin: `0801${String(10000 + i).slice(0, 6)}`,
      streak: 1 + rand(14),
      lastActiveDate: new Date()
    });
    students.push(s);
  }

  console.log('📚 «Квадраттық функция» модулі деректерден құрылуда...');
  const mathTeacher = teachers[0]; // Математика
  const module = await Module.create({ ...MODULE, weeks: 4, zoomUrl: DEFAULT_ZOOM_URL, teacher: mathTeacher._id });

  // Күн (1..12) бойынша кейс жасау. Әр кейс — бір сабақ күні; аптаның бірінші
  // кейсіне сол аптаның толық теориялық анықтамасы салынады.
  const casesByDay = {};
  for (let day = 1; day <= 12; day++) {
    const week = weekOf(day);
    const caseNo = caseNoOf(day);
    const wk = WEEKS[week - 1];

    const description = caseNo === 1
      ? wk.theory // аптаның анықтамасы (kk/ru/en)
      : {
          kk: `${day}-күн. ${wk.title.kk} тақырыбы бойынша деңгейлік тапсырмалар.`,
          ru: `День ${day}. Уровневые задания по теме «${wk.title.ru}».`,
          en: `Day ${day}. Levelled tasks on "${wk.title.en}".`
        };

    const c = await Case.create({
      module: module._id,
      title: {
        kk: `${day}-күн · ${wk.title.kk}`,
        ru: `День ${day} · ${wk.title.ru}`,
        en: `Day ${day} · ${wk.title.en}`
      },
      description,
      week,
      caseNumber: caseNo,
      color: CASE_COLORS[(day - 1) % CASE_COLORS.length],
      icon: CASE_ICONS[(day - 1) % CASE_ICONS.length]
    });
    casesByDay[day] = c;
  }

  // 36 тапсырманы сәйкес кейстерге тіркеу.
  const allTasks = [];
  for (const t of TASKS) {
    const c = casesByDay[t.day];
    const lvl = LEVEL_TITLES[t.level];
    const task = await Task.create({
      case: c._id,
      module: module._id,
      title: lvl, // деңгей атауы 3 тілде
      question: t.q,
      type: 'open',
      difficulty: DIFFICULTY[t.level],
      correctAnswer: t.answer,
      xpReward: 10 + (t.level - 1) * 10,   // 10 / 20 / 30
      ratingReward: 5 + (t.level - 1) * 5, // 5 / 10 / 15
      coinReward: 2 + (t.level - 1),       // 2 / 3 / 4
      topic: t.topic,
      createdBy: mathTeacher._id
    });
    allTasks.push(task);
  }
  console.log(`   ✓ 1 модуль · 12 кейс · ${allTasks.length} тапсырма`);

  console.log('🧮 «90 проблемалық есеп» модулі деректерден құрылуда...');
  const { tasks: problemTasks } = await buildProblemsModule({
    teacherId: mathTeacher._id,
    zoomUrl: DEFAULT_ZOOM_URL
  });
  allTasks.push(...problemTasks);
  console.log(`   ✓ 1 модуль · 10 кейс · ${problemTasks.length} тапсырма`);

  console.log('📝 Оқушылардың жауаптары (submissions) генерациялануда...');
  let subCount = 0;
  for (const s of students) {
    // әр оқушы кездейсоқ 8..32 тапсырманы орындайды
    const shuffled = [...allTasks].sort(() => Math.random() - 0.5);
    const n = 8 + rand(Math.min(25, allTasks.length - 8));
    const taken = shuffled.slice(0, n);

    for (const task of taken) {
      const isCorrect = Math.random() < 0.72; // ~72% дұрыс
      const xpEarned = isCorrect ? task.xpReward : Math.floor(task.xpReward / 4);
      const ratingEarned = isCorrect ? task.ratingReward : 0;

      await Submission.create({
        student: s._id,
        task: task._id,
        case: task.case,
        module: task.module,
        answer: isCorrect ? task.correctAnswer : 'дұрыс емес жауап',
        isCorrect,
        xpEarned,
        ratingEarned
      });
      subCount++;

      s.xp += xpEarned;
      s.rating += ratingEarned;
      if (isCorrect) {
        s.coins += task.coinReward;
        s.completedTasks.push(task._id);
      }
    }
    recomputeLevel(s);
    awardBadges(s);
    await s.save();
  }
  console.log(`   ✓ ${subCount} жауап жазылды`);

  console.log('✅ Сидтер дайын.');
  console.log('   admin@edu.kz / admin123');
  console.log('   teacher1@edu.kz / teacher123  (Математика — модуль иесі)');
  console.log('   student1@edu.kz … student20@edu.kz / student123');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
