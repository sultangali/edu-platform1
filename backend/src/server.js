import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import moduleRoutes from './routes/modules.js';
import caseRoutes from './routes/cases.js';
import taskRoutes from './routes/tasks.js';
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teacher.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'EduKZ API', date: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`)))
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });
