import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentProfile() {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    refresh();
    api.get('/students/me/stats').then(r => setStats(r.data));
    api.get('/students/leaderboard').then(r => setLeaderboard(r.data.leaderboard));
  }, []);

  if (!user) return null;

  const xpForNext = 100 * user.level * user.level;
  const xpProgress = Math.min(100, Math.round((user.xp / xpForNext) * 100));
  const myRank = leaderboard.findIndex(s => String(s._id) === String(user._id)) + 1;

  const topicData = Object.entries(stats?.stats?.byTopic || {}).map(([topic, v]) => ({
    topic, total: v.total, correct: v.correct, accuracy: v.total ? Math.round(v.correct / v.total * 100) : 0
  }));

  const allBadges = [
    { code: 'first_step', icon: '🌱', title: 'Алғашқы қадам' },
    { code: 'week_warrior', icon: '⚔️', title: 'Апта жауынгері' },
    { code: 'rising_star', icon: '⭐', title: 'Жұлдыз' },
    { code: 'genius', icon: '🧠', title: 'Данышпан' },
    { code: 'streak_master', icon: '🔥', title: 'Марафоншы' },
    { code: 'champion', icon: '🏆', title: 'Чемпион' }
  ];
  const ownedSet = new Set(user.badges.map(b => b.code));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-fuchsia-600 via-pink-500 to-amber-400 text-white shadow-2xl">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex items-start gap-6">
            <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur border-4 border-white/40 flex items-center justify-center text-5xl font-extrabold">
              {user.fullName.split(' ').map(s => s[0]).slice(0,2).join('')}
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-80 font-bold">#{myRank > 0 ? myRank : '—'} жалпы рейтингте</div>
              <h1 className="heading text-4xl font-extrabold">{user.fullName}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-bold">📍 {user.city}</span>
                {user.school && <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-bold">🏫 {user.school}</span>}
                {user.grade && <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-bold">🎒 {user.grade}</span>}
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between mb-1">
                  <div className="text-sm font-bold opacity-90">{t('student.level')} {user.level}</div>
                  <div className="text-sm opacity-80">{user.xp} / {xpForNext} XP</div>
                </div>
                <div className="h-4 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { l: t('student.rating'), v: user.rating, c: 'from-amber-400 to-orange-500', i: '🏆' },
            { l: t('student.coins'), v: user.coins, c: 'from-yellow-400 to-amber-500', i: '🪙' },
            { l: t('student.streak'), v: `${user.streak} 🔥`, c: 'from-rose-500 to-pink-500', i: '🔥' },
            { l: t('student.completed'), v: user.completedTasks?.length || 0, c: 'from-emerald-400 to-teal-500', i: '✅' }
          ].map(s => (
            <div key={s.l} className={`relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br ${s.c} text-white shadow-lg`}>
              <div className="text-3xl mb-1">{s.i}</div>
              <div className="text-xs opacity-90 font-bold uppercase">{s.l}</div>
              <div className="text-3xl font-extrabold">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="text-3xl">📊</div>
            <h2 className="heading text-2xl font-extrabold">Тақырыптар бойынша дұрыстық</h2>
          </div>
          {topicData.length === 0 ? (
            <div className="text-slate-500 py-10 text-center">Алғашқы тапсырманы орындаңыз 🚀</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="topic" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="accuracy" fill="url(#g1)" radius={[12, 12, 0, 0]} name="%" />
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#d946ef" />
                    <stop offset="1" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="text-3xl">🎖️</div>
            <h2 className="heading text-2xl font-extrabold">{t('student.badges')}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {allBadges.map(b => {
              const owned = ownedSet.has(b.code);
              return (
                <div key={b.code} className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-center p-2 ${owned ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300 grayscale'}`}>
                  <div className="text-3xl">{b.icon}</div>
                  <div className="text-[10px] font-bold mt-1 leading-tight">{b.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="text-3xl">📜</div>
          <h2 className="heading text-2xl font-extrabold">Соңғы жауаптар</h2>
        </div>
        <div className="space-y-2">
          {stats?.recentSubmissions?.length === 0 && <div className="text-slate-500">Жауаптар жоқ</div>}
          {stats?.recentSubmissions?.map(s => (
            <div key={s._id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${s.isCorrect ? 'border-emerald-100 bg-emerald-50/40' : 'border-rose-100 bg-rose-50/40'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {s.isCorrect ? '✓' : '✕'}
              </div>
              <div className="flex-1">
                <div className="font-bold">{s.task?.title?.ru || s.task?.title?.kk || 'Task'}</div>
                <div className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm font-bold text-fuchsia-600">+{s.xpEarned} XP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
