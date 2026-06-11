export function loc(obj, lang) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] || obj.kk || obj.ru || obj.en || '';
}
