import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { kk: String, ru: String, en: String },
  description: { kk: String, ru: String, en: String },
  week: { type: Number, required: true, min: 1, max: 4 },
  caseNumber: { type: Number, required: true, min: 1, max: 9 },
  color: { type: String, default: 'from-pink-500 to-rose-500' },
  icon: { type: String, default: '🎯' }
}, { timestamps: true });

caseSchema.index({ module: 1, week: 1, caseNumber: 1 }, { unique: true });

export default mongoose.model('Case', caseSchema);
