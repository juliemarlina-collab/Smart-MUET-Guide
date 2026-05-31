/**
 * Smart MUET — backend-config.js
 * Blueprint v3.3 — Google Apps Script + Google Sheets backend connector
 *
 * HOW TO ACTIVATE:
 * 1. Deploy your Google Apps Script Web App (see muet-appscript.gs)
 * 2. Replace the placeholder URL below with your deployed Web App URL
 * 3. Set SMART_MUET_BACKEND_ENABLED = true
 *
 * While URL is not configured, all attempts save silently to localStorage only.
 * No console warnings are shown to students.
 */

const SMART_MUET_BACKEND_ENABLED = false; // set true after deploying Apps Script
const SMART_MUET_BACKEND_URL     = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

async function saveSmartMuetAttempt(payload) {
  // Always save to localStorage as the primary record
  _saveAttemptLocally(payload);

  // Only attempt remote save if explicitly enabled and URL is configured
  if (!SMART_MUET_BACKEND_ENABLED) return { ok: false, localOnly: true };
  if (!SMART_MUET_BACKEND_URL || SMART_MUET_BACKEND_URL.includes('PASTE_')) return { ok: false, localOnly: true };

  try {
    await fetch(SMART_MUET_BACKEND_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    JSON.stringify({ action: 'saveAttempt', ...payload })
    });
    return { ok: true, sent: true };
  } catch (err) {
    // Silent fail — student experience is unaffected
    return { ok: false, error: String(err) };
  }
}

// ── Local attempt log (always runs) ──────────────────────────────────────────
function _saveAttemptLocally(payload) {
  try {
    const key  = 'muet_attempt_log';
    const log  = JSON.parse(localStorage.getItem(key) || '[]');
    log.push({ ...payload, _savedAt: new Date().toISOString() });
    // Keep last 200 attempts only
    if (log.length > 200) log.splice(0, log.length - 200);
    localStorage.setItem(key, JSON.stringify(log));
  } catch (_) { /* silent */ }
}
