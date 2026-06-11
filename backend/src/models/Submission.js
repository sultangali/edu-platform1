import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  answer: { type: String, default: '' },
  selectedIndex: { type: Number },
  isCorrect: { type: Boolean, default: false },
  xpEarned: { type: Number, default: 0 },
  ratingEarned: { type: Number, default: 0 }
}, { timestamps: true });

submissionSchema.index({ student: 1, task: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
