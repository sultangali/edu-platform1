import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { kk: String, ru: String, en: String },
  description: { kk: String, ru: String, en: String },
  color: { type: String, default: 'from-fuchsia-500 to-violet-600' },
  icon: { type: String, default: '📚' },
  weeks: { type: Number, default: 4 },
  order: { type: Number, default: 0 },
  // Live lesson link (e.g. teacher's Zoom room) — students join from the module page
  zoomUrl: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Module', moduleSchema);
