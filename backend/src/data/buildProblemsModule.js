// Builds the "90 problem-based tasks" module from the auto-generated data.
//
//   Module  →  10 Cases (one per real-world context, grouped into 4 weeks)
//           →  90 Tasks (9 problem types per context)
//
// Reused by both the full seed (seed.js) and the standalone seed (seedProblems.js).

import Module from '../models/Module.js';
import Case from '../models/Case.js';
import Task from '../models/Task.js';
import { PROBLEMS, PROBLEM_SECTIONS } from './problems90.js';

export const DEFAULT_ZOOM_URL = 'https://zoom.us/j/7513111698';

const MODULE_META = {
  title: {
    kk: 'Проблемалық есептер: Квадраттық функция (90 есеп)',
    ru: 'Проблемные задачи: Квадратичная функция (90 задач)',
    en: 'Problem-based tasks: Quadratic Function (90 problems)'
  },
  description: {
    kk: '8-сынып. 10 нақты өмірлік контекст × 9 тапсырма түрі = 90 проблемалық есеп. Әр есеп есептеу, график, түрлендіру, модель құру және шешім қабылдау дағдыларын дамытады.',
    ru: '8 класс. 10 реальных контекстов × 9 типов заданий = 90 проблемных задач: вычисления, графики, преобразования, моделирование и принятие решений.',
    en: 'Grade 8. 10 real-world contexts × 9 task types = 90 problem-based tasks: computation, graphs, transformations, modelling and decision-making.'
  },
  color: 'from-emerald-500 to-teal-600',
  icon: '🧮',
  order: 2
};

const CASE_ICONS = ['⚽', '🌱', '🎭', '🎪', '🚚', '⛲', '🔆', '🌉', '🏫', '📚'];
const CASE_COLORS = [
  'from-pink-500 to-rose-500', 'from-green-400 to-emerald-600', 'from-violet-500 to-purple-600',
  'from-amber-400 to-orange-500', 'from-sky-400 to-blue-600', 'from-cyan-400 to-teal-600',
  'from-yellow-400 to-amber-500', 'from-indigo-500 to-blue-600', 'from-fuchsia-500 to-pink-600',
  'from-lime-400 to-green-600'
];

// Difficulty + reward tiers by problem type (1..9).
const DIFFICULTY_BY_TYPE = {
  1: 'easy', 2: 'medium', 3: 'medium', 4: 'medium', 5: 'medium',
  6: 'medium', 7: 'hard', 8: 'hard', 9: 'hard'
};
const REWARDS = {
  easy:   { xp: 10, rating: 5,  coin: 2 },
  medium: { xp: 20, rating: 10, coin: 3 },
  hard:   { xp: 30, rating: 15, coin: 4 }
};

// Light, answer-free hints (kk) keyed by problem type.
const HINTS = {
  1: 'Әрбір берілген мәнді формулаға қойып есепте де, ең тиімдісін таңда.',
  2: 'F=0 деп квадрат теңдеуді құр; дискриминант D=b²−4ac арқылы түбірлерді тап.',
  3: 'Төбе абсциссасы x₀=−b/2a, ал ординатасы y₀=F(x₀).',
  4: 'y=a(x−m)²+n түрінде төбе (m; n), симметрия осі x=m.',
  5: 'Әр x үшін F(x)-ті есепте; мәндердің төбе айналасында симметриялы екенін бай қа.',
  6: 'Ауданды S=x·(P−x) түрінде жаз; ол төбеде ең үлкен мәнге жетеді.',
  7: 'F(x) ≥ берілген мән теңсіздігін шешіп, x аралығын тап.',
  8: 'Әрбір функцияның төбесі мен тармақтарының бағытын анықтап сәйкестендір.',
  9: 'Төбені тауып, одан кейін өсу/кему аралықтарын анықта.'
};

const localizedTitle = (n) => {
  const s = PROBLEM_SECTIONS.find((x) => x.section === n);
  return { kk: s.kk, ru: s.ru, en: s.en };
};

const weekOf = (section) => Math.ceil(section / 3);        // 1..10 -> 1..4
const caseNoOf = (section) => ((section - 1) % 3) + 1;     // 1,2,3 within a week

/**
 * Create the module, its cases and all 90 tasks.
 * @returns {{ module, cases, tasks }}
 */
export async function buildProblemsModule({ teacherId, zoomUrl = DEFAULT_ZOOM_URL } = {}) {
  const module = await Module.create({
    ...MODULE_META,
    weeks: 4,
    zoomUrl,
    teacher: teacherId
  });

  const caseBySection = {};
  for (const sec of PROBLEM_SECTIONS) {
    const n = sec.section;
    const week = weekOf(n);
    const caseNumber = caseNoOf(n);
    const c = await Case.create({
      module: module._id,
      title: localizedTitle(n),
      description: {
        kk: `${n}-контекст. «${sec.kk}» бойынша 9 проблемалық тапсырма.`,
        ru: `Контекст ${n}. 9 проблемных заданий по теме «${sec.ru}».`,
        en: `Context ${n}. 9 problem-based tasks on "${sec.en}".`
      },
      week,
      caseNumber,
      color: CASE_COLORS[(n - 1) % CASE_COLORS.length],
      icon: CASE_ICONS[(n - 1) % CASE_ICONS.length]
    });
    caseBySection[n] = c;
  }

  const tasks = [];
  for (const p of PROBLEMS) {
    const c = caseBySection[p.section];
    const difficulty = DIFFICULTY_BY_TYPE[p.type] || 'medium';
    const reward = REWARDS[difficulty];
    const task = await Task.create({
      case: c._id,
      module: module._id,
      section: p.section,
      title: p.subtypeI18n,
      question: { kk: p.question, ru: p.question, en: p.question },
      type: 'open',
      difficulty,
      correctAnswer: p.answerKey,
      solution: { kk: p.solution, ru: p.solution, en: p.solution },
      hint: { kk: HINTS[p.type] || '', ru: HINTS[p.type] || '', en: HINTS[p.type] || '' },
      ...(p.graph ? { graph: { a: p.graph[0], b: p.graph[1], c: p.graph[2] } } : {}),
      ...(p.tableX ? { tableX: p.tableX } : {}),
      xpReward: reward.xp,
      ratingReward: reward.rating,
      coinReward: reward.coin,
      topic: p.subtypeI18n.kk,
      createdBy: teacherId
    });
    tasks.push(task);
  }

  return { module, cases: Object.values(caseBySection), tasks };
}
