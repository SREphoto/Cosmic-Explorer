import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * Never let the player stare at a blank white screen: any crash that escapes
 * React is painted onto the page with enough detail to diagnose it.
 */
function paintCrashScreen(title: string, detail: string) {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div style="min-height:100vh;background:#020617;color:#e2e8f0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;">
      <div style="max-width:560px;width:100%;background:#0f172a;border:1px solid #334155;border-radius:16px;padding:22px;text-align:left;">
        <div style="font-size:18px;font-weight:800;margin-bottom:6px;">🛰️ ${title}</div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:12px;">
          The home planet hit an unexpected anomaly. Details below — please share them with the dev team.
        </div>
        <pre style="background:#020617;border:1px solid #1e293b;border-radius:10px;padding:12px;font-size:11px;white-space:pre-wrap;word-break:break-word;color:#fca5a5;max-height:300px;overflow:auto;">${detail}</pre>
        <button onclick="location.reload()" style="margin-top:12px;background:#38bdf8;color:#0f172a;font-weight:800;border:none;border-radius:10px;padding:10px 18px;cursor:pointer;font-size:13px;">Retry Launch</button>
        <button onclick="localStorage.clear();location.reload()" style="margin-top:12px;margin-left:8px;background:#1e293b;color:#e2e8f0;font-weight:700;border:1px solid #334155;border-radius:10px;padding:10px 18px;cursor:pointer;font-size:13px;">Reset Save & Retry</button>
      </div>
    </div>`;
}

let crashed = false;
const reportCrash = (source: string, err: unknown) => {
  if (crashed) return;
  crashed = true;
  const detail = err instanceof Error ? `${err.name}: ${err.message}\n\n${err.stack || ''}` : String(err);
  console.error(`[CosmicExplorer] ${source}:`, err);
  paintCrashScreen(source, detail.slice(0, 4000));
};

window.addEventListener('error', (e) => reportCrash('Runtime Error', e.error || e.message));
window.addEventListener('unhandledrejection', (e) => reportCrash('Unhandled Promise Rejection', e.reason));

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (err) {
  reportCrash('Boot Failure', err);
}
