// Smart PYQ Finder — API Service
// Communicates with the Node.js backend

const API_BASE = "http://localhost:5000";
const UNIVERSITY_PYQ_URL = "http://172.18.8.72:8080/jspui/";

/**
 * Check if the university PYQ server is reachable (i.e. device is on campus WiFi).
 * Tries fetching the jspui page with a short timeout.
 * @returns {Promise<boolean>}
 */
async function checkUniversityNetwork() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(UNIVERSITY_PYQ_URL, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    // In no-cors mode, a successful fetch means the server is reachable
    // (opaque response with status 0 is still returned on success)
    return true;
  } catch (err) {
    console.warn("[Network] University PYQ server unreachable:", err.message);
    return false;
  }
}

/**
 * Search for PYQ papers via the backend API.
 * @param {string} course - Course code (e.g. "CS301")
 * @param {string} exam   - Exam type (e.g. "CAT1", "FAT")
 * @returns {Promise<Array<{name: string, url: string, year: string, detectedExam: string}>>}
 */
async function searchPYQ(course, exam) {
  const response = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course, exam }),
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }

  return response.json();
}

/**
 * Check if the backend server is reachable.
 * @returns {Promise<boolean>}
 */
async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}
