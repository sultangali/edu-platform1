import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api.js';
import { loc } from '../utils/locale.js';

export default function Modules() {
  const { t, i18n } = useTranslation();
  const [modules, setModules] = useState([]);

  useEffect(() => { api.get('/modules').then(r => setModules(r.data.modules)); }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="pill bg-violet-100 text-violet-700 mb-3">📚 {t('nav.modules')}</div>
          <h1 className="heading text-5xl font-extrabold">Барлық модульдер</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(m => (
          <Link key={m._id} to={`/modules/${m._id}`}
            className={`group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br ${m.color || 'from-fuchsia-500 to-violet-600'} text-white shadow-xl hover:-translate-y-2 transition-all duration-300`}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl group-hover:scale-150 transition" />
            <div className="relative">
              <div className="text-6xl mb-4">{m.icon}</div>
              <h3 className="font-display text-3xl font-extrabold mb-2">{loc(m.title, i18n.language)}</h3>
              <p className="opacity-90 mb-6">{loc(m.description, i18n.language)}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
                <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1">📅 {m.weeks || 4} {t('module.weeks')}</span>
                <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1">🎯 {m.caseCount} {t('module.cases')}</span>
                <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1">📝 {m.taskCount} {t('module.tasks')}</span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm opacity-80">👨‍🏫 {m.teacher?.fullName?.split(' ')[0]}</div>
                <div className="bg-white text-slate-900 rounded-full px-4 py-2 font-bold group-hover:scale-105 transition">{t('module.open')} →</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
