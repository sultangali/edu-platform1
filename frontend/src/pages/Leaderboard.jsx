import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Leaderboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => { api.get('/students/leaderboard').then(r => setList(r.data.leaderboard)); }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <div className="text-7xl mb-3 animate-float">🏆</div>
        <h1 className="heading text-5xl font-extrabold bg-gradient-to-r from-amber-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
          {t('student.leaderboardTitle')}
        </h1>
      </div>

      {list.slice(0,3).length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[1,0,2].map(idx => {
            const s = list[idx];
            const place = idx + 1;
            const heights = { 1: 'h-72 from-amber-400 to-yellow-500', 2: 'h-60 from-slate-300 to-slate-400', 3: 'h-52 from-orange-400 to-amber-600' };
            return (
              <div key={s._id} className="flex flex-col items-center justify-end">
                <div className="text-5xl mb-2">{['🥇','🥈','🥉'][place-1]}</div>
                <div className="font-bold text-center">{s.fullName.split(' ')[0]}</div>
                <div className="text-sm text-slate-500 mb-2">{s.rating} pts</div>
                <div className={`w-full rounded-t-3xl bg-gradient-to-b ${heights[place]} flex items-start justify-center pt-4 text-white font-extrabold text-3xl shadow-xl`}>
                  {place}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card !p-2">
        {list.map((s, i) => (
          <div key={s._id}
            className={`flex items-center gap-4 p-4 rounded-2xl ${String(s._id) === String(user?._id) ? 'bg-gradient-to-r from-fuchsia-100 to-pink-100' : i % 2 ? 'bg-white' : 'bg-slate-50/50'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg ${
              i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
              i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
              i === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white' :
              'bg-slate-100 text-slate-700'
            }`}>{i+1}</div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
              {s.fullName.split(' ').map(x => x[0]).slice(0,2).join('')}
            </div>
            <div className="flex-1">
              <div className="font-bold">{s.fullName}</div>
              <div className="text-xs text-slate-500">{s.school || s.city} • Деңгей {s.level}</div>
            </div>
            <div className="hidden sm:flex gap-2">
              {s.badges?.slice(0,3).map(b => (
                <div key={b.code} className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-sm">{b.icon}</div>
              ))}
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-600 to-amber-500 bg-clip-text text-transparent">{s.rating}</div>
              <div className="text-xs text-slate-500">🔥 {s.streak}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
