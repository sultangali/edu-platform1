import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api.js';
import { loc } from '../utils/locale.js';

// Live lessons hub: lists modules whose teacher has opened a Zoom room and lets
// the student jump straight into the conference.
export default function Live() {
  const { t, i18n } = useTranslation();
  const [modules, setModules] = useState(null);

  useEffect(() => { api.get('/modules').then(r => setModules(r.data.modules)); }, []);

  if (!modules) return <div className="p-10 text-center">{t('common.loading')}</div>;
  const live = modules.filter(m => m.zoomUrl);

  const join = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="relative overflow-hidden rounded-3xl p-10 mb-8 bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 text-white shadow-2xl">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-bold mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" /> LIVE
          </div>
          <h1 className="heading text-5xl font-extrabold mb-2">🎥 {t('live.title')}</h1>
          <p className="text-xl opacity-90">{t('live.subtitle')}</p>
        </div>
      </div>

      {live.length === 0 ? (
        <div className="card text-center text-slate-500 py-16">{t('live.none')}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {live.map(m => (
            <div key={m._id} className="card flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-3xl text-white shadow`}>{m.icon}</div>
                <div>
                  <h3 className="font-display text-lg font-extrabold leading-tight">{loc(m.title, i18n.language)}</h3>
                  <div className="text-sm text-slate-500">👨‍🏫 {m.teacher?.fullName}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono break-all mb-4">{m.zoomUrl}</div>
              <button onClick={() => join(m.zoomUrl)}
                className="mt-auto btn-primary !py-4 w-full flex items-center justify-center gap-2 text-lg">
                🎥 {t('live.join')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-slate-400">{t('live.hint')}</div>
    </div>
  );
}
