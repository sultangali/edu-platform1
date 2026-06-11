import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const badgeSchema = new mongoose.Schema({
  code: String,
  title: String,
  icon: String,
  awardedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  avatar: { type: String, default: '' },
  iin: { type: String, default: '' },
  city: { type: String, default: 'Алматы' },
  school: { type: String, default: '' },
  grade: { type: String, default: '' },
  language: { type: String, enum: ['kk', 'ru', 'en'], default: 'kk' },
  // Gamification
  rating: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  badges: [badgeSchema],
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  // For teacher
  bio: { type: String, default: '' },
  subject: { type: String, default: '' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
