export const xpForLevel = (level) => 100 * level * level;

export function recomputeLevel(user) {
  let lvl = 1;
  while (user.xp >= xpForLevel(lvl)) lvl++;
  user.level = lvl;
}

export const BADGES = [
  { code: 'first_step', title: { kk: 'Алғашқы қадам', ru: 'Первый шаг', en: 'First Step' }, icon: '🌱', condition: u => u.completedTasks.length >= 1 },
  { code: 'week_warrior', title: { kk: 'Апта жауынгері', ru: 'Воин недели', en: 'Week Warrior' }, icon: '⚔️', condition: u => u.completedTasks.length >= 9 },
  { code: 'rising_star', title: { kk: 'Жұлдыз', ru: 'Восходящая звезда', en: 'Rising Star' }, icon: '⭐', condition: u => u.rating >= 100 },
  { code: 'genius', title: { kk: 'Данышпан', ru: 'Гений', en: 'Genius' }, icon: '🧠', condition: u => u.level >= 5 },
  { code: 'streak_master', title: { kk: 'Марафоншы', ru: 'Мастер серий', en: 'Streak Master' }, icon: '🔥', condition: u => u.streak >= 7 },
  { code: 'champion', title: { kk: 'Чемпион', ru: 'Чемпион', en: 'Champion' }, icon: '🏆', condition: u => u.rating >= 500 }
];

export function awardBadges(user) {
  const owned = new Set(user.badges.map(b => b.code));
  const newly = [];
  for (const b of BADGES) {
    if (!owned.has(b.code) && b.condition(user)) {
      const badge = { code: b.code, title: b.title.ru, icon: b.icon };
      user.badges.push(badge);
      newly.push(badge);
    }
  }
  return newly;
}

export function updateStreak(user) {
  const now = new Date();
  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (!last) {
    user.streak = 1;
  } else {
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // same day, no change
    } else if (diffDays === 1) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }
  }
  user.lastActiveDate = now;
}
