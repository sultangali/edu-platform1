import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api.js';
import { loc } from '../utils/locale.js';

export default function ModuleDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);

  useEffect(() => { api.get(`/modules/${id}`).then(r => setData(r.data)); }, [id]);

  if (!data) return <div className="p-10 text-center">{t('common.loading')}</div>;
  const { module, cases } = data;

  const byWeek = {};
  for (const c of cases) {
    byWeek[c.week] = byWeek[c.week] || [];
    byWeek[c.week].push(c);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className={`relative overflow-hidden rounded-3xl p-10 mb-8 bg-gradient-to-br ${module.color} text-white shadow-2xl`}>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-6">
          <div className="text-7xl animate-float">{module.icon}</div>
          <div>
            <h1 className="heading text-5xl font-extrabold mb-2">{loc(module.title, i18n.language)}</h1>
            <p className="text-xl opacity-90 mb-4">{loc(module.description, i18n.language)}</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/20 backdrop-blur rounded-full px-4 py-2 font-bold">📅 {module.weeks || 4} {t('module.weeks')}</span>
              <span className="bg-white/20 backdrop-blur rounded-full px-4 py-2 font-bold">🎯 {cases.length} {t('module.cases')}</span>
              <span className="bg-white/20 backdrop-blur rounded-full px-4 py-2 font-bold">👨‍🏫 {module.teacher?.fullName}</span>
            </div>
            {module.zoomUrl && (
              <a href={module.zoomUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 bg-white text-blue-700 font-extrabold rounded-2xl px-6 py-3 shadow-lg hover:scale-105 transition">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> 🎥 {t('live.join')}
              </a>
            )}
          </div>
        </div>
      </div>

      {[1,2,3,4].map(w => (
        <div key={w} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white font-extrabold flex items-center justify-center">{w}</div>
            <h2 className="heading text-2xl font-extrabold">{t('module.week')} {w}</h2>
            <div className="ml-auto text-sm text-slate-500">{(byWeek[w] || []).length} {t('module.cases')}</div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(byWeek[w] || []).map(c => (
              <Link key={c._id} to={`/cases/${c._id}`}
                className="group card hover:-translate-y-1 transition relative overflow-hidden">
                <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${c.color} opacity-20 group-hover:opacity-40 transition blur-xl`} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl text-white shadow`}>{c.icon}</div>
                    <div className="pill bg-slate-100 text-slate-700">Кейс {c.caseNumber}</div>
                  </div>
                  <h3 className="font-display text-xl font-extrabold mb-1">{loc(c.title, i18n.language)}</h3>
                  <p className="text-sm text-slate-500">{loc(c.description, i18n.language)}</p>
                  <div className="mt-4 text-fuchsia-600 font-bold text-sm group-hover:translate-x-1 transition">Ашу →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
