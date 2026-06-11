import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  const linkCls = ({ isActive }) =>
    `px-4 py-2 rounded-xl font-semibold transition ${isActive ? 'bg-fuchsia-100 text-fuchsia-700' : 'text-slate-600 hover:bg-white/70'}`;

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-fuchsia-300/40">
            🎓
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-xl tracking-tight">EduKZ</div>
            <div className="text-xs text-slate-500 -mt-0.5">{t('app.tagline')}</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-4">
          <NavLink to="/" end className={linkCls}>{t('nav.home')}</NavLink>
          {user && <NavLink to="/modules" className={linkCls}>{t('nav.modules')}</NavLink>}
          {user && (
            <NavLink to="/live" className={({ isActive }) =>
              `px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-white/70'}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />{t('nav.live')}
            </NavLink>
          )}
          {user && <NavLink to="/leaderboard" className={linkCls}>{t('nav.leaderboard')}</NavLink>}
          {user?.role === 'student' && <NavLink to="/profile" className={linkCls}>{t('nav.profile')}</NavLink>}
          {user?.role === 'teacher' && <NavLink to="/teacher" className={linkCls}>{t('nav.teacher')}</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={linkCls}>{t('nav.admin')}</NavLink>}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center bg-white/80 rounded-2xl border border-slate-200 p-1">
            {['kk', 'ru', 'en'].map(l => (
              <button key={l} onClick={() => changeLang(l)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold uppercase ${i18n.language === l ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
                {l}
              </button>
            ))}
          </div>
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.fullName.split(' ').map(s => s[0]).slice(0,2).join('')}
                </div>
                <div className="text-sm font-semibold">{user.fullName.split(' ')[0]}</div>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary !py-2 !px-4">{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2 !px-4">{t('nav.login')}</Link>
              <Link to="/register" className="btn-primary !py-2 !px-4">{t('nav.register')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
