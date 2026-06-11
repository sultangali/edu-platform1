import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api.js';

export default function AdminPanel() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);

  const reload = async () => {
    const [s, u] = await Promise.all([api.get('/admin/overview'), api.get('/admin/users')]);
    setStats(s.data.stats);
    setUsers(u.data.users);
  };
  useEffect(() => { reload(); }, []);

  const removeUser = async (id) => {
    if (!confirm('Жоюды растайсыз ба?')) return;
    await api.delete(`/admin/users/${id}`);
    reload();
  };

  const saveEdit = async () => {
    await api.put(`/admin/users/${editing._id}`, {
      fullName: editing.fullName,
      role: editing.role,
      school: editing.school,
      grade: editing.grade,
      city: editing.city,
      rating: editing.rating
    });
    setEditing(null); reload();
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  if (!stats) return <div className="p-10 text-center">{t('common.loading')}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br from-violet-700 via-fuchsia-600 to-rose-500 text-white shadow-2xl">
        <div className="absolute -top-20 -right-10 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="text-sm opacity-80 font-bold">⚡ {t('nav.admin')}</div>
          <h1 className="heading text-5xl font-extrabold">{t('admin.overview')}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { l: 'Барлығы', v: stats.users, c: 'from-fuchsia-500 to-pink-500', i: '👥' },
          { l: 'Оқушы', v: stats.students, c: 'from-cyan-400 to-blue-600', i: '🎒' },
          { l: 'Ұстаз', v: stats.teachers, c: 'from-emerald-400 to-teal-500', i: '👨‍🏫' },
          { l: 'Модуль', v: stats.modules, c: 'from-violet-500 to-purple-600', i: '📚' },
          { l: 'Кейс', v: stats.cases, c: 'from-amber-400 to-orange-500', i: '🎯' },
          { l: 'Тапсырма', v: stats.tasks, c: 'from-rose-500 to-pink-500', i: '📝' },
          { l: 'Жауаптар', v: stats.submissions, c: 'from-indigo-500 to-blue-600', i: '✉️' }
        ].map(s => (
          <div key={s.l} className={`rounded-3xl p-4 bg-gradient-to-br ${s.c} text-white shadow-lg`}>
            <div className="text-2xl">{s.i}</div>
            <div className="text-2xl font-extrabold">{s.v}</div>
            <div className="text-[10px] opacity-90 font-bold uppercase">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <h3 className="heading text-2xl font-extrabold">{t('admin.users')}</h3>
          <div className="ml-auto flex gap-2">
            {[['all','Барлығы'],['student','Оқушылар'],['teacher','Ұстаздар'],['admin','Әкімші']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-xl font-bold text-sm ${filter === k ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u._id} className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white ${
                u.role === 'admin' ? 'bg-gradient-to-br from-rose-500 to-pink-500' :
                u.role === 'teacher' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                'bg-gradient-to-br from-emerald-400 to-teal-500'
              }`}>
                {u.fullName.split(' ').map(x => x[0]).slice(0,2).join('')}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="font-bold">{u.fullName}</div>
                <div className="text-xs text-slate-500">{u.email} • {u.city}</div>
              </div>
              <span className={`pill ${
                u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                u.role === 'teacher' ? 'bg-cyan-100 text-cyan-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>{u.role}</span>
              {u.role === 'student' && (
                <div className="text-sm">
                  <span className="font-bold text-fuchsia-600">{u.rating}</span>
                  <span className="text-slate-400"> рейтинг</span>
                </div>
              )}
              <button onClick={() => setEditing({...u})} className="bg-violet-100 text-violet-700 rounded-xl px-3 py-2 text-sm font-bold">✏️</button>
              <button onClick={() => removeUser(u._id)} className="bg-rose-100 text-rose-700 rounded-xl px-3 py-2 text-sm font-bold">🗑</button>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 className="heading text-2xl font-extrabold mb-4">Қолданушыны өзгерту</h3>
            <div className="space-y-3">
              <input className="input" value={editing.fullName} onChange={e => setEditing({...editing, fullName: e.target.value})} />
              <select className="input" value={editing.role} onChange={e => setEditing({...editing, role: e.target.value})}>
                <option value="student">Оқушы</option><option value="teacher">Ұстаз</option><option value="admin">Әкімші</option>
              </select>
              <input className="input" placeholder="Қала" value={editing.city || ''} onChange={e => setEditing({...editing, city: e.target.value})} />
              <input className="input" placeholder="Мектеп" value={editing.school || ''} onChange={e => setEditing({...editing, school: e.target.value})} />
              <input className="input" placeholder="Сынып" value={editing.grade || ''} onChange={e => setEditing({...editing, grade: e.target.value})} />
              <input className="input" type="number" placeholder="Рейтинг" value={editing.rating || 0} onChange={e => setEditing({...editing, rating: +e.target.value})} />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="btn-primary flex-1">💾 {t('admin.save')}</button>
                <button onClick={() => setEditing(null)} className="btn-secondary">✕</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
