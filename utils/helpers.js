// Smart PYQ Finder — Utility Helpers

/**
 * Sanitize user input — trim whitespace, convert to uppercase.
 * @param {string} value
 * @returns {string}
 */
function sanitizeInput(value) {
  return (value || "").trim().toUpperCase();
}

/**
 * Generate a standardised PYQ filename.
 * Format: <courseCode>_<examType>_<year>.pdf
 * @param {string} course
 * @param {string} exam
 * @param {string|number} year
 * @returns {string}
 */
function formatFileName(course, exam, year) {
  const c = sanitizeInput(course).replace(/[^A-Z0-9]/g, "");
  const e = sanitizeInput(exam).replace(/[^A-Z0-9]/g, "");
  const y = year || "UNKNOWN";
  return `${c}_${e}_${y}.pdf`;
}

/**
 * Extract a 4-digit year (20xx) from a string.
 * @param {string} text
 * @returns {string|null}
 */
function extractYear(text) {
  const match = (text || "").match(/\b(20\d{2})\b/);
  return match ? match[1] : null;
}

/**
 * Detect exam type from text content.
 * @param {string} text
 * @returns {string|null}
 */
function detectExamType(text) {
  const t = (text || "").toUpperCase();
  if (/\bCAT[\s-]*1\b/.test(t) || /\bCAT[\s-]*I\b/.test(t)) return "CAT1";
  if (/\bCAT[\s-]*2\b/.test(t) || /\bCAT[\s-]*II\b/.test(t)) return "CAT2";
  if (/\bFAT\b/.test(t) || /\bFINAL\s*(ASSESSMENT|EXAM)\b/.test(t)) return "FAT";
  if (/\bMID\b/.test(t) || /\bMID[\s-]*TERM\b/.test(t)) return "MID";
  return null;
}

/**
 * Escape HTML entities to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}
