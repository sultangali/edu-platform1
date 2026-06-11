// Lenient grader for open-ended math answers.
//
// The 90 problem-based tasks have short canonical answers like "(4; 17)",
// "2 ≤ x ≤ 6", "t=8.12, t=-0.12" or matchings like "A-3, B-1, C-2, D-4".
// Students phrase answers differently, so we compare by *significant numeric
// tokens* (and a dedicated path for letter-matchings) instead of exact strings.

// Treat the comma as a decimal separator (kk/ru convention: 8,12 === 8.12)
// then pull out every signed decimal number.
export function extractNumbers(s) {
  const t = String(s || '').replace(/(\d),(?=\d)/g, '$1.');
  return (t.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}

export function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/(\d),(?=\d)/g, '$1.')      // decimal comma -> dot
    .replace(/[≤≥<>=()\[\];,]/g, ' ')    // drop comparison/grouping punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

const isMatching = (key) => /[A-DА-Г]\s*-\s*\d/.test(String(key));
const matchingTokens = (s) =>
  (String(s).match(/[a-dа-г]\s*-?\s*\d/gi) || [])
    .map((p) => p.replace(/[^a-dа-г0-9]/gi, '').toLowerCase())
    .sort()
    .join(',');

/**
 * @returns {boolean} whether `student` answer satisfies the canonical `key`.
 */
export function gradeOpen(student, key) {
  if (!key) return false;
  const sN = normalizeText(student);
  if (!sN) return false;
  const kN = normalizeText(key);
  if (sN === kN) return true;

  // Letter matchings (A-3, B-1, ...): compare the set of letter→digit pairs.
  if (isMatching(key)) {
    const a = matchingTokens(student);
    return a.length > 0 && a === matchingTokens(key);
  }

  // Numeric answers: every number in the key must be present in the student's answer.
  const kNums = extractNumbers(key);
  if (kNums.length) {
    const sNums = extractNumbers(student);
    return kNums.every((n) => sNums.some((m) => Math.abs(m - n) < 1e-6));
  }

  // Pure-text fallback.
  return sN.includes(kN) || kN.includes(sN);
}

// Shared check used by both the submit route and the seed generator.
export function isAnswerCorrect(task, { selectedIndex, answer }) {
  if (task.type === 'quiz') return Number(selectedIndex) === task.correctIndex;
  return gradeOpen(answer, task.correctAnswer);
}
