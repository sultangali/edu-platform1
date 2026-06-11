// Strip teacher-only answer fields before sending tasks to students.
//
// Students must NEVER receive the correct answer / worked solution — they only
// learn whether their own submission was right. Teachers and admins see everything.

export const isTeacher = (user) => !!user && (user.role === 'teacher' || user.role === 'admin');

export function sanitizeTask(task, user) {
  const obj = typeof task.toObject === 'function' ? task.toObject() : { ...task };
  if (!isTeacher(user)) {
    delete obj.correctAnswer;
    delete obj.correctIndex;
    delete obj.solution;
    // hint stays — students may reveal it on purpose
  }
  return obj;
}

export const sanitizeTasks = (tasks, user) => tasks.map((t) => sanitizeTask(t, user));
