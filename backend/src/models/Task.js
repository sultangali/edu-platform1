import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { kk: String, ru: String, en: String },
  question: { kk: String, ru: String, en: String },
  type: { type: String, enum: ['quiz', 'open', 'code'], default: 'quiz' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  options: [{ kk: String, ru: String, en: String }],
  correctIndex: { type: Number, default: 0 },
  correctAnswer: { type: String, default: '' },
  // Teacher-only: full worked solution, shown only to teachers/admin (never sent to students)
  solution: { kk: String, ru: String, en: String },
  // Optional hint a student may reveal before answering
  hint: { kk: String, ru: String, en: String },
  // Optional parabola coefficients for graph visualization: y = a·x² + b·x + c
  graph: { a: Number, b: Number, c: Number },
  // Optional x-values for "fill the table" problems
  tableX: [Number],
  // Source section index (1..10) for problem-based modules
  section: { type: Number },
  xpReward: { type: Number, default: 10 },
  ratingReward: { type: Number, default: 5 },
  coinReward: { type: Number, default: 3 },
  topic: { type: String, default: 'general' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
