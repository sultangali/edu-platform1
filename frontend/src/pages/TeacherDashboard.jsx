import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api.js';
import { loc } from '../utils/locale.js';
import { useAuth } from '../context/AuthContext.jsx';

const COLORS = ['#d946ef', '#22d3ee', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e'];

export default function TeacherDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [modules, setModules] = useState([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [topicDetail, setTopicDetail] = useState(null); // { topic, loading, tasks, submissions }

  const openTopic = async (topic) => {
    setTopicDetail({ topic, loading: true });
    const { data } = await api.get('/teacher/submissions', { params: { topic } });
    setTopicDetail({ topic, loading: false, ...data });
  };

  const reload = async () => {
    const [a, m] = await Promise.all([api.get('/teacher/analytics'), api.get('/modules')]);
    setAnalytics(a.data);
    setModules(m.data.modules.filter(x => String(x.teacher?._id) === String(user?._id)));
  };

  useEffect(() => { reload(); }, []);

  const loadCases = async (moduleId) => {
    const { data } = await api.get(`/cases?module=${moduleId}`);
    setCases(data.cases);
  };

  if (!analytics) return <div className="p-10 text-center">{t('common.loading')}</div>;

  const topicChart = Object.entries(analytics.byTopic).map(([k, v]) => ({
    topic: k, total: v.total, correct: v.correct, accuracy: v.total ? Math.round(v.correct / v.total * 100) : 0
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 text-white shadow-2xl">
        <div className="absolute -top-20 -right-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="text-sm opacity-80 font-bold">👨‍🏫 {t('nav.teacher')}</div>
          <h1 className="heading text-4xl font-extrabold">{user.fullName}</h1>
          <div className="opacity-90">{user.subject}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { l: 'Модульдер', v: analytics.summary.modules, c: 'from-fuchsia-500 to-pink-500', i: '📚' },
          { l: 'Кейстер', v: analytics.summary.cases, c: 'from-amber-400 to-orange-500', i: '🎯' },
          { l: 'Тапсырмалар', v: analytics.summary.tasks, c: 'from-cyan-400 to-blue-600', i: '📝' },
          { l: 'Жауаптар', v: analytics.summary.submissions, c: 'from-emerald-400 to-teal-500', i: '✉️' },
          { l: 'Оқушылар', v: analytics.summary.activeStudents, c: 'from-violet-500 to-purple-600', i: '🎒' }
        ].map(s => (
          <div key={s.l} className={`rounded-3xl p-5 bg-gradient-to-br ${s.c} text-white shadow-lg`}>
            <div className="text-3xl">{s.i}</div>
            <div className="text-3xl font-extrabold">{s.v}</div>
            <div className="text-xs opacity-90 font-bold uppercase">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          ['overview', '📊 ' + t('teacher.overview')],
          ['modules', '📚 ' + t('teacher.myModules')],
          ['students', '🎒 ' + t('teacher.students')],
          ['topics', '🏷️ ' + t('teacher.topics')]
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition ${tab === k ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="heading text-2xl font-extrabold mb-4">Тақырыптар бойынша дұрыстық</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#d946ef" radius={[12, 12, 0, 0]} name="%" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="heading text-2xl font-extrabold mb-4">Тақырыптар үлесі</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={topicChart} dataKey="total" nameKey="topic" cx="50%" cy="50%" outerRadius={100} label>
                  {topicChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card lg:col-span-2">
            <h3 className="heading text-2xl font-extrabold mb-4">Кейстер белсенділігі</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.caseStats.map(c => ({
                name: `Н${c.case.week}.К${c.case.caseNumber}`,
                total: c.total, correct: c.correct
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#22d3ee" radius={[8,8,0,0]} />
                <Bar dataKey="correct" fill="#10b981" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'modules' && (
        <div>
          <button onClick={() => { setEditingModule(null); setShowModuleForm(true); }}
            className="btn-primary mb-4">+ {t('teacher.createModule')}</button>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(m => (
              <div key={m._id} className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${m.color} text-white shadow-xl`}>
                <div className="text-5xl mb-3">{m.icon}</div>
                <h3 className="font-display text-2xl font-extrabold">{loc(m.title, i18n.language)}</h3>
                <p className="opacity-90 text-sm mt-1">{loc(m.description, i18n.language)}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setSelectedModule(m); loadCases(m._id); }}
                    className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 text-sm font-bold hover:bg-white/30">
                    🎯 Кейстер
                  </button>
                  <button onClick={() => { setEditingModule(m); setShowModuleForm(true); }}
                    className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 text-sm font-bold hover:bg-white/30">
                    ✏️ Өзгерту
                  </button>
                  <button onClick={async () => { if (confirm('Delete?')) { await api.delete(`/modules/${m._id}`); reload(); } }}
                    className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 text-sm font-bold hover:bg-rose-500">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedModule && (
            <div className="card mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{selectedModule.icon}</div>
                <h3 className="heading text-2xl font-extrabold">{loc(selectedModule.title, i18n.language)} — кейстер</h3>
                <button onClick={() => setShowCaseForm(true)} className="ml-auto btn-primary !py-2 !px-4">+ {t('teacher.createCase')}</button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cases.map(c => (
                  <div key={c._id} className="p-4 rounded-2xl bg-white border-2 border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center`}>{c.icon}</span>
                      <span className="text-xs text-slate-500 font-bold">Н{c.week}.К{c.caseNumber}</span>
                    </div>
                    <div className="font-bold">{loc(c.title, i18n.language)}</div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setSelectedCase(c); setShowTaskForm(true); }}
                        className="bg-fuchsia-100 text-fuchsia-700 rounded-xl px-3 py-1 text-xs font-bold">+ Тапсырма</button>
                      <button onClick={async () => { if (confirm('Delete?')) { await api.delete(`/cases/${c._id}`); loadCases(selectedModule._id); } }}
                        className="bg-rose-100 text-rose-700 rounded-xl px-3 py-1 text-xs font-bold">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'students' && (
        <div className="card">
          <h3 className="heading text-2xl font-extrabold mb-4">Менің оқушыларым</h3>
          <div className="space-y-2">
            {analytics.students.map((s, i) => {
              const acc = s.total ? Math.round(s.correct / s.total * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-white flex items-center justify-center font-bold">
                    {s.student.fullName.split(' ').map(x => x[0]).slice(0,2).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{s.student.fullName}</div>
                    <div className="text-xs text-slate-500">{s.student.school} • {s.student.grade}</div>
                  </div>
                  <div className="hidden sm:block w-40">
                    <div className="text-xs text-slate-500 mb-1">Дұрыстық: {acc}%</div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-fuchsia-500 to-emerald-500" style={{ width: `${acc}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-fuchsia-600">+{s.ratingEarned}</div>
                    <div className="text-xs text-slate-500">{s.correct}/{s.total} ✓</div>
                  </div>
                </div>
              );
            })}
            {analytics.students.length === 0 && <div className="text-slate-500 text-center py-10">Әлі жауап жоқ</div>}
          </div>
        </div>
      )}

      {tab === 'topics' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicChart.map(t => (
            <button key={t.topic} onClick={() => openTopic(t.topic)}
              className="card text-left hover:-translate-y-1 hover:shadow-xl transition cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="font-display text-xl font-extrabold capitalize">{t.topic}</div>
                <div className="pill bg-fuchsia-100 text-fuchsia-700">{t.accuracy}%</div>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400" style={{ width: `${t.accuracy}%` }} />
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>✅ Дұрыс: {t.correct}</span>
                <span>📊 Барлығы: {t.total}</span>
              </div>
              <div className="mt-3 text-fuchsia-600 font-bold text-sm">👁 Жауаптарды қарау →</div>
            </button>
          ))}
          {topicChart.length === 0 && <div className="text-slate-500">Әлі деректер жоқ</div>}
        </div>
      )}

      {topicDetail && (
        <TopicDetailModal data={topicDetail} lang={i18n.language} onClose={() => setTopicDetail(null)} />
      )}

      {showModuleForm && <ModuleForm initial={editingModule} onClose={() => setShowModuleForm(false)} onSaved={reload} />}
      {showCaseForm && selectedModule && (
        <CaseForm module={selectedModule} onClose={() => setShowCaseForm(false)} onSaved={() => loadCases(selectedModule._id)} />
      )}
      {showTaskForm && selectedCase && (
        <TaskForm caseObj={selectedCase} onClose={() => setShowTaskForm(false)} onSaved={() => {}} />
      )}
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="heading text-2xl font-extrabold">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-bold">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Drill-down: every student's answer for a topic, grouped by task, with the answer key.
function TopicDetailModal({ data, lang, onClose }) {
  const { topic, loading, tasks = [], submissions = [] } = data;
  const byTask = {};
  for (const s of submissions) (byTask[s.task] = byTask[s.task] || []).push(s);
  const totalCorrect = submissions.filter(s => s.isCorrect).length;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h3 className="heading text-2xl font-extrabold capitalize">🏷️ {topic}</h3>
            {!loading && (
              <div className="text-sm text-slate-500">{tasks.length} тапсырма • {submissions.length} жауап • {totalCorrect} дұрыс</div>
            )}
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-bold">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {loading && <div className="text-center py-12 text-slate-500">Жүктелуде...</div>}

          {!loading && tasks.map(tk => {
            const subs = byTask[tk._id] || [];
            return (
              <div key={tk._id} className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="pill bg-slate-200 text-slate-700">{loc(tk.title, lang)}</span>
                    <span className="pill bg-amber-100 text-amber-700">{tk.difficulty}</span>
                    <span className="pill bg-cyan-100 text-cyan-700">{subs.length} жауап</span>
                  </div>
                  <div className="font-bold text-slate-800">{loc(tk.question, lang)}</div>
                  {tk.correctAnswer && (
                    <div className="mt-2 text-sm">
                      <span className="font-bold text-emerald-700">🔑 Дұрыс жауап: </span>
                      <span className="font-mono font-bold text-emerald-900">{tk.correctAnswer}</span>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-slate-100">
                  {subs.length === 0 && <div className="p-4 text-sm text-slate-400">Бұл тапсырмаға әлі жауап жоқ</div>}
                  {subs.map(s => (
                    <div key={s._id} className="flex items-center gap-3 p-3">
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold">
                        {s.student.fullName.split(' ').map(x => x[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">
                          {s.student.fullName} <span className="text-slate-400 font-normal">{s.student.grade}</span>
                        </div>
                        <div className="text-sm text-slate-600 break-words">💬 {s.answer || '—'}</div>
                      </div>
                      <span className={`pill shrink-0 ${s.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {s.isCorrect ? '✓ дұрыс' : '✗ қате'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {!loading && tasks.length === 0 && <div className="text-center py-12 text-slate-500">Тапсырма табылмады</div>}
        </div>
      </div>
    </div>
  );
}

const COLOR_CHOICES = [
  'from-fuchsia-500 to-violet-600', 'from-pink-500 to-rose-500',
  'from-cyan-400 to-blue-600', 'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600', 'from-violet-500 to-purple-600'
];
const ICON_CHOICES = ['📚','🎯','💡','🚀','⭐','🧮','⚛️','💻','📖','🎨','🔥','🏆'];

function ModuleForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || {
    title: { kk: '', ru: '', en: '' },
    description: { kk: '', ru: '', en: '' },
    color: COLOR_CHOICES[0], icon: '📚'
  });
  const submit = async (e) => {
    e.preventDefault();
    if (initial) await api.put(`/modules/${initial._id}`, form);
    else await api.post('/modules', form);
    onSaved(); onClose();
  };
  return (
    <Modal title={initial ? 'Модульді өзгерту' : 'Жаңа модуль'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <MultiLangInput label="Атауы" value={form.title} onChange={v => setForm({...form, title: v})} />
        <MultiLangInput label="Сипаттама" value={form.description} onChange={v => setForm({...form, description: v})} textarea />
        <ColorIconPicker form={form} setForm={setForm} />
        <button className="btn-primary w-full">💾 Сақтау</button>
      </form>
    </Modal>
  );
}

function CaseForm({ module, onClose, onSaved }) {
  const [form, setForm] = useState({
    module: module._id,
    title: { kk: '', ru: '', en: '' },
    description: { kk: '', ru: '', en: '' },
    week: 1, caseNumber: 1, color: COLOR_CHOICES[1], icon: '🎯'
  });
  const submit = async (e) => {
    e.preventDefault();
    await api.post('/cases', form);
    onSaved(); onClose();
  };
  return (
    <Modal title="Жаңа кейс" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <MultiLangInput label="Атауы" value={form.title} onChange={v => setForm({...form, title: v})} />
        <MultiLangInput label="Сипаттама" value={form.description} onChange={v => setForm({...form, description: v})} textarea />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold">Апта (1-4)</span>
            <input type="number" min="1" max="4" className="input mt-1" value={form.week} onChange={e => setForm({...form, week: +e.target.value})} />
          </label>
          <label className="block">
            <span className="text-sm font-bold">Кейс (1-9)</span>
            <input type="number" min="1" max="9" className="input mt-1" value={form.caseNumber} onChange={e => setForm({...form, caseNumber: +e.target.value})} />
          </label>
        </div>
        <ColorIconPicker form={form} setForm={setForm} />
        <button className="btn-primary w-full">💾 Сақтау</button>
      </form>
    </Modal>
  );
}

function TaskForm({ caseObj, onClose, onSaved }) {
  const [form, setForm] = useState({
    case: caseObj._id,
    title: { kk: 'Тапсырма', ru: 'Задание', en: 'Task' },
    question: { kk: '', ru: '', en: '' },
    type: 'quiz',
    options: [{kk:'',ru:'',en:''},{kk:'',ru:'',en:''},{kk:'',ru:'',en:''},{kk:'',ru:'',en:''}],
    correctIndex: 0,
    difficulty: 'easy', topic: 'general',
    xpReward: 10, ratingReward: 5, coinReward: 3
  });
  const submit = async (e) => {
    e.preventDefault();
    await api.post('/tasks', form);
    onSaved(); onClose();
  };
  return (
    <Modal title="Жаңа тапсырма" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <MultiLangInput label="Атауы" value={form.title} onChange={v => setForm({...form, title: v})} />
        <MultiLangInput label="Сұрақ" value={form.question} onChange={v => setForm({...form, question: v})} textarea />
        <div>
          <div className="text-sm font-bold mb-2">Жауап нұсқалары (дұрысын белгілеңіз)</div>
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => setForm({...form, correctIndex: i})}
                className={`w-10 h-10 rounded-xl font-bold ${form.correctIndex === i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {form.correctIndex === i ? '✓' : String.fromCharCode(65+i)}
              </button>
              <input className="input !py-2" placeholder="kk" value={opt.kk} onChange={e => {
                const next = [...form.options]; next[i] = {...next[i], kk: e.target.value, ru: e.target.value, en: e.target.value}; setForm({...form, options: next});
              }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label><span className="text-sm font-bold">Қиындық</span>
            <select className="input mt-1" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
              <option value="easy">Оңай</option><option value="medium">Орташа</option><option value="hard">Қиын</option>
            </select>
          </label>
          <label><span className="text-sm font-bold">Тақырып</span>
            <input className="input mt-1" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} />
          </label>
          <label><span className="text-sm font-bold">XP</span>
            <input type="number" className="input mt-1" value={form.xpReward} onChange={e => setForm({...form, xpReward: +e.target.value})} />
          </label>
        </div>
        <button className="btn-primary w-full">💾 Сақтау</button>
      </form>
    </Modal>
  );
}

function MultiLangInput({ label, value, onChange, textarea }) {
  return (
    <div>
      <div className="text-sm font-bold mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {['kk', 'ru', 'en'].map(l => (
          textarea ? (
            <textarea key={l} className="input !py-2" rows="2" placeholder={l.toUpperCase()}
              value={value[l] || ''} onChange={e => onChange({...value, [l]: e.target.value})} />
          ) : (
            <input key={l} className="input !py-2" placeholder={l.toUpperCase()}
              value={value[l] || ''} onChange={e => onChange({...value, [l]: e.target.value})} />
          )
        ))}
      </div>
    </div>
  );
}

function ColorIconPicker({ form, setForm }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="text-sm font-bold mb-2">Түс</div>
        <div className="flex flex-wrap gap-2">
          {COLOR_CHOICES.map(c => (
            <button type="button" key={c} onClick={() => setForm({...form, color: c})}
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c} ${form.color === c ? 'ring-4 ring-offset-2 ring-fuchsia-400' : ''}`} />
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-bold mb-2">Иконка</div>
        <div className="flex flex-wrap gap-1">
          {ICON_CHOICES.map(i => (
            <button type="button" key={i} onClick={() => setForm({...form, icon: i})}
              className={`w-10 h-10 rounded-xl text-xl ${form.icon === i ? 'bg-fuchsia-100 ring-2 ring-fuchsia-400' : 'bg-slate-100'}`}>{i}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
