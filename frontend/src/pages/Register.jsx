import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student', school: '', grade: '', city: 'Алматы' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const u = await register(form);
      if (u.role === 'teacher') navigate('/teacher');
      else navigate('/profile');
    } catch (e) {
      setErr(e.response?.data?.message || 'Error');
    }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="card">
        <div className="text-5xl mb-3">✨</div>
        <h1 className="heading text-3xl font-extrabold mb-6">{t('auth.register')}</h1>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {['student', 'teacher'].map(r => (
              <button type="button" key={r} onClick={() => update('role', r)}
                className={`p-4 rounded-2xl border-2 font-bold text-left transition ${form.role === r ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                <div className="text-2xl mb-1">{r === 'student' ? '🎒' : '👨‍🏫'}</div>
                {t(`auth.${r}`)}
              </button>
            ))}
          </div>
          <input className="input" placeholder={t('auth.fullName')} value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
          <input className="input" placeholder={t('auth.email')} type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
          <input className="input" placeholder={t('auth.password')} type="password" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder={t('auth.city')} value={form.city} onChange={e => update('city', e.target.value)} />
            <input className="input" placeholder={t('auth.school')} value={form.school} onChange={e => update('school', e.target.value)} />
          </div>
          {form.role === 'student' && (
            <input className="input" placeholder={t('auth.grade')} value={form.grade} onChange={e => update('grade', e.target.value)} />
          )}
          {err && <div className="bg-rose-50 text-rose-700 p-3 rounded-xl font-semibold">{err}</div>}
          <button className="btn-primary w-full text-lg !py-4">{t('auth.submit')} →</button>
        </form>
        <div className="mt-6 text-center text-slate-500">
          {t('auth.haveAccount')}? <Link to="/login" className="text-fuchsia-600 font-bold">{t('nav.login')}</Link>
        </div>
      </div>
    </div>
  );
}
