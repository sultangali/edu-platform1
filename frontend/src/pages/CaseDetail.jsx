import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api.js';
import { loc } from '../utils/locale.js';
import { useAuth } from '../context/AuthContext.jsx';
import ParabolaGraph from '../components/ParabolaGraph.jsx';

export default function CaseDetail() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { setUser, user } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const [data, setData] = useState(null);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);   // quiz
  const [answer, setAnswer] = useState('');          // open
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState(new Set());

  useEffect(() => {
    api.get(`/cases/${id}`).then(r => {
      setData(r.data);
      setCompletedTaskIds(new Set((user?.completedTasks || []).map(String)));
    });
  }, [id, user]);

  if (!data) return <div className="p-10 text-center">{t('common.loading')}</div>;
  const { case: c, tasks } = data;
  const task = tasks[active];

  const resetForTask = () => { setSelected(null); setAnswer(''); setResult(null); setShowHint(false); };

  const submit = async () => {
    const payload = task.type === 'quiz' ? { selectedIndex: selected } : { answer };
    try {
      const { data: res } = await api.post(`/tasks/${task._id}/submit`, payload);
      setResult(res);
      if (res.user) setUser(res.user);
      setCompletedTaskIds(prev => new Set([...prev, String(task._id)]));
    } catch (e) {
      setResult({ error: e.response?.data?.message || 'Error' });
    }
  };

  const goto = (i) => { setActive(i); resetForTask(); };
  const next = () => { resetForTask(); setActive(a => Math.min(a + 1, tasks.length - 1)); };

  const isDone = completedTaskIds.has(String(task?._id));
  const doneCount = tasks.filter(tk => completedTaskIds.has(String(tk._id))).length;
  const progress = Math.round((doneCount / tasks.length) * 100);
  const canSubmit = task?.type === 'quiz' ? selected !== null : answer.trim().length > 0;
  const g = task?.graph;
  const hasGraph = g && (g.a ?? 0) !== 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-3xl p-8 mb-6 bg-gradient-to-br ${c.color} text-white shadow-2xl`}>
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="text-6xl animate-float">{c.icon}</div>
          <div>
            <div className="text-sm font-bold opacity-80">{t('module.week')} {c.week} • {t('module.case')} {c.caseNumber}</div>
            <h1 className="heading text-4xl font-extrabold">{loc(c.title, i18n.language)}</h1>
            <p className="opacity-90 mt-1">{loc(c.description, i18n.language)}</p>
          </div>
        </div>
        {/* Progress */}
        <div className="relative mt-5">
          <div className="flex justify-between text-xs font-bold opacity-90 mb-1">
            <span>{t('task.progress')}</span><span>{doneCount}/{tasks.length} • {progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/25 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Task tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {tasks.map((tk, i) => {
          const done = completedTaskIds.has(String(tk._id));
          return (
            <button key={tk._id} onClick={() => goto(i)}
              className={`shrink-0 w-11 h-11 rounded-2xl font-bold text-sm transition ${i === active ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-700'}`}>
              {done ? '✓' : i + 1}
            </button>
          );
        })}
      </div>

      {task && (
        <div className="card">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="pill bg-slate-100 text-slate-700 font-bold">{loc(task.title, i18n.language)}</span>
            <span className="pill bg-amber-100 text-amber-700">⚡ {t(`task.difficulty.${task.difficulty}`)}</span>
            <span className="pill bg-fuchsia-100 text-fuchsia-700">+{task.xpReward} XP</span>
            <span className="pill bg-cyan-100 text-cyan-700">+{task.ratingReward} {t('student.rating')}</span>
            <span className="pill bg-yellow-100 text-yellow-700">+{task.coinReward} 🪙</span>
          </div>

          <h2 className="heading text-xl sm:text-2xl font-extrabold mb-5 leading-snug whitespace-pre-line">{loc(task.question, i18n.language)}</h2>

          {/* Graph */}
          {hasGraph && (
            <div className="mb-5 max-w-md">
              <ParabolaGraph a={g.a} b={g.b} c={g.c} />
            </div>
          )}

          {/* Table (fill F(x)) */}
          {task.tableX?.length > 0 && (
            <div className="mb-5 overflow-x-auto">
              <table className="border-collapse text-center text-sm">
                <tbody>
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 px-3 py-2 font-extrabold">x</th>
                    {task.tableX.map((x, i) => <td key={i} className="border border-slate-300 px-4 py-2 font-bold">{x}</td>)}
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-100 px-3 py-2 font-extrabold">F(x)</th>
                    {task.tableX.map((_, i) => <td key={i} className="border border-slate-300 px-4 py-2 text-slate-400">?</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Quiz options */}
          {task.type === 'quiz' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {task.options.map((opt, i) => (
                <button key={i} disabled={isDone || result}
                  onClick={() => setSelected(i)}
                  className={`p-5 rounded-2xl border-2 text-left font-semibold transition ${
                    selected === i ? 'border-fuchsia-500 bg-fuchsia-50' : 'border-slate-200 bg-white hover:border-fuchsia-300'}`}>
                  <span className="inline-flex w-8 h-8 rounded-xl bg-slate-100 items-center justify-center text-sm mr-2">{String.fromCharCode(65 + i)}</span>
                  {loc(opt, i18n.language)}
                </button>
              ))}
            </div>
          )}

          {/* Open answer (students only) */}
          {task.type !== 'quiz' && !isTeacher && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">{t('task.yourAnswer')}</label>
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && canSubmit && !result && !isDone) submit(); }}
                disabled={isDone || (result && !result.error)}
                placeholder={t('task.placeholder')}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-fuchsia-400 outline-none font-semibold text-lg disabled:bg-slate-50"
              />
            </div>
          )}

          {/* Hint (students) */}
          {loc(task.hint, i18n.language) && !isTeacher && (
            <div className="mt-4">
              {!showHint ? (
                <button onClick={() => setShowHint(true)} className="text-fuchsia-600 font-bold text-sm hover:underline">💡 {t('task.showHint')}</button>
              ) : (
                <div className="p-4 rounded-2xl bg-violet-50 text-violet-800 font-semibold text-sm border border-violet-100">
                  💡 {loc(task.hint, i18n.language)}
                </div>
              )}
            </div>
          )}

          {/* Result — students only ever see right/wrong, never the answer */}
          {result && !result.error && (
            <div className={`mt-6 p-5 rounded-2xl font-bold text-lg ${result.submission.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {result.submission.isCorrect ? `🎉 ${t('task.correct', { xp: result.submission.xpEarned })}` : `❌ ${t('task.wrong')}`}
              {result.newBadges?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.newBadges.map(b => (
                    <div key={b.code} className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl px-4 py-2 flex items-center gap-2">
                      <span className="text-2xl">{b.icon}</span><span>+ {b.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {result?.error && <div className="mt-6 p-4 rounded-xl bg-amber-50 text-amber-700 font-semibold">{result.error}</div>}
          {isDone && !result && <div className="mt-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 font-semibold">✓ {t('task.already')}</div>}

          {/* Teacher-only answer key + worked solution */}
          {isTeacher && (task.correctAnswer || loc(task.solution, i18n.language)) && (
            <div className="mt-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold mb-2">
                🔑 {t('task.teacherAnswer')}
                <span className="pill bg-indigo-100 text-indigo-600 !text-xs">{t('task.teacherOnly')}</span>
              </div>
              {task.correctAnswer && (
                <div className="mb-2"><span className="font-bold text-slate-500">{t('task.answer')}: </span>
                  <span className="font-mono font-bold text-indigo-900">{task.correctAnswer}</span></div>
              )}
              {loc(task.solution, i18n.language) && (
                <div className="text-slate-700 text-sm leading-relaxed"><span className="font-bold text-slate-500">{t('task.solution')}: </span>{loc(task.solution, i18n.language)}</div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {!isTeacher && !result && !isDone && (
              <button onClick={submit} disabled={!canSubmit} className="btn-primary text-lg !py-4 !px-8 disabled:opacity-50">
                {t('task.submit')}
              </button>
            )}
            {(isTeacher || result || isDone) && active < tasks.length - 1 && (
              <button onClick={next} className="btn-primary !py-4 !px-8">{t('task.next')} →</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
