import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const features = [
    { icon: '🎯', title: 'Кейс-сабақтар', text: '4 апта × 9 кейс құрылымы', color: 'from-pink-500 to-rose-500' },
    { icon: '🏆', title: 'Геймификация', text: 'XP, деңгейлер, белгілер, серия', color: 'from-amber-400 to-orange-500' },
    { icon: '📊', title: 'Аналитика', text: 'Ұстаздарға толық статистика', color: 'from-cyan-400 to-blue-600' },
    { icon: '🌍', title: '3 тілде', text: 'Қазақ • Орыс • Ағылшын', color: 'from-emerald-400 to-teal-600' },
    { icon: '🚀', title: 'Жылдам интерфейс', text: 'Vite + React + Tailwind', color: 'from-violet-500 to-purple-600' },
    { icon: '🎨', title: 'Заманауи дизайн', text: 'Жарқын түстер мен анимация', color: 'from-fuchsia-500 to-pink-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <section className="pt-16 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="pill bg-fuchsia-100 text-fuchsia-700 mb-6">
            <span>✨</span> EduKZ — Қазақстандық платформа
          </div>
          <h1 className="heading text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
            {t('hero.title')}
            <span className="block bg-gradient-to-r from-fuchsia-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              ойнап үйрен
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-xl">{t('hero.subtitle')}</p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link to="/modules" className="btn-primary text-lg !py-4 !px-8">{t('nav.modules')} →</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg !py-4 !px-8">{t('hero.cta')} →</Link>
                <Link to="/login" className="btn-secondary text-lg !py-4 !px-8">{t('nav.login')}</Link>
              </>
            )}
          </div>
          <div className="mt-10 flex items-center gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 border-4 border-white -ml-3 first:ml-0" />
            ))}
            <div className="text-sm">
              <div className="font-bold">10 000+ оқушы</div>
              <div className="text-slate-500">Қазақстан бойынша</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 bg-gradient-to-br from-fuchsia-300/40 via-pink-300/30 to-amber-300/40 rounded-full blur-3xl animate-pulse-slow" />
          <div className="relative card !p-8 transform rotate-2 hover:rotate-0 transition">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-sm text-slate-500 font-semibold">Деңгей 5</div>
                <div className="font-display text-3xl font-extrabold">Ержан Сұлтанов</div>
              </div>
              <div className="text-5xl animate-float">🎓</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                {l:'XP', v:'2 480', c:'from-fuchsia-500 to-pink-500'},
                {l:'Рейтинг', v:'847', c:'from-amber-400 to-orange-500'},
                {l:'Серия', v:'12🔥', c:'from-cyan-400 to-blue-500'}
              ].map(x => (
                <div key={x.l} className={`bg-gradient-to-br ${x.c} text-white rounded-2xl p-4`}>
                  <div className="text-xs opacity-80">{x.l}</div>
                  <div className="text-2xl font-extrabold">{x.v}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm font-semibold">Прогресс</div>
              <div className="ml-auto text-sm text-slate-500">28 / 36</div>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-[78%] bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 rounded-full" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {['🌱','⚔️','⭐','🔥'].map(b => (
                <div key={b} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-2xl border-2 border-white shadow">{b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(f => (
          <div key={f.title} className="card hover:-translate-y-1 transition">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} text-white text-3xl flex items-center justify-center mb-4 shadow-lg`}>
              {f.icon}
            </div>
            <div className="font-display text-2xl font-extrabold mb-1">{f.title}</div>
            <div className="text-slate-600">{f.text}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
