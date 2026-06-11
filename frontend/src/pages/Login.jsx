import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const u = await login(form.email, form.password);
      if (u.role === 'admin') navigate('/admin');
      else if (u.role === 'teacher') navigate('/teacher');
      else navigate('/profile');
    } catch (e) {
      setErr(e.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="card">
        <div className="text-5xl mb-3">🔐</div>
        <h1 className="heading text-3xl font-extrabold mb-2">{t('auth.login')}</h1>
        <p className="text-slate-500 mb-6">admin@edu.kz / admin123</p>
        <form onSubmit={submit} className="space-y-4">
          <input className="input" placeholder={t('auth.email')} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input className="input" placeholder={t('auth.password')} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          {err && <div className="bg-rose-50 text-rose-700 p-3 rounded-xl font-semibold">{err}</div>}
          <button className="btn-primary w-full text-lg !py-4">{t('auth.submit')} →</button>
        </form>
        <div className="mt-6 text-center text-slate-500">
          {t('auth.noAccount')} <Link to="/register" className="text-fuchsia-600 font-bold">{t('nav.register')}</Link>
        </div>
      </div>
    </div>
  );
}
