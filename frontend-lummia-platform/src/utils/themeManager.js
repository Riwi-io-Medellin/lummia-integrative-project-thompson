// src/utils/themeManager.js - Unified theme system (single source of truth)
const STORAGE_KEY = 'lummia_theme';

let styleEl = null;

function getStyleEl() {
  if (!styleEl) {
    styleEl = document.getElementById('theme-overrides');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-overrides';
      document.head.appendChild(styleEl);
    }
  }
  return styleEl;
}

function applyPanelClasses(theme) {
  const nav = document.getElementById('nav-container');
  const ai = document.getElementById('ai-panel-container');

  const navClasses = ['bg-[#050505]', 'bg-[#09090b]', 'bg-white', 'shadow-sm', 'shadow-[4px_0_24px_rgba(0,0,0,0.5)]', 'shadow-2xl'];
  const aiClasses = ['bg-[#050505]', 'bg-[#09090b]', 'bg-white/95', 'shadow-2xl', 'shadow-[-20px_0_50px_rgba(0,0,0,0.5)]', 'shadow-[-10px_0_30px_rgba(0,0,0,0.05)]'];

  if (nav) nav.classList.remove(...navClasses);
  if (ai) ai.classList.remove(...aiClasses);

  if (theme === 'neon') {
    if (nav) nav.classList.add('bg-[#050505]', 'shadow-[4px_0_24px_rgba(0,0,0,0.5)]');
    if (ai) ai.classList.add('bg-[#050505]', 'shadow-[-20px_0_50px_rgba(0,0,0,0.5)]');
  } else if (theme === 'black') {
    if (nav) nav.classList.add('bg-[#09090b]', 'shadow-2xl');
    if (ai) ai.classList.add('bg-[#09090b]', 'shadow-2xl');
  } else if (theme === 'white') {
    if (nav) nav.classList.add('bg-white', 'shadow-sm');
    if (ai) ai.classList.add('bg-white/95', 'shadow-[-10px_0_30px_rgba(0,0,0,0.05)]');
  }
}

function applyWrapperClasses(theme) {
  const wrapper = document.getElementById('app-wrapper');
  if (!wrapper) return;

  // Use CSS variable classes — they adapt automatically per theme
  const selectionColor = theme === 'neon' ? 'selection:bg-purple-500/30'
    : theme === 'black' ? 'selection:bg-zinc-700'
    : 'selection:bg-fuchsia-200';

  wrapper.className = `h-screen w-full bg-app text-main flex overflow-hidden ${selectionColor} relative z-0 transition-colors duration-500`;
  wrapper.setAttribute('data-current-theme', theme);
}

function applyCSSOverrides(theme) {
  const el = getStyleEl();

  if (theme === 'white') {
    // Global overrides using [data-theme="white"] so they apply EVERYWHERE
    // (including login page which is outside #app-wrapper)
    el.innerHTML = `
      /* ── Text colors ── */
      [data-theme="white"] .text-white:not(
        [class*="bg-fuchsia-"], [class*="bg-indigo-"], [class*="bg-emerald-"],
        [class*="bg-purple-"], [class*="bg-violet-"], [class*="bg-blue-"],
        [class*="bg-red-"], [class*="bg-amber-"], [class*="bg-green-"],
        [class*="bg-cyan-"], [class*="bg-accent"],
        .bg-fuchsia-500, .bg-fuchsia-600, .bg-indigo-500, .bg-indigo-600,
        .bg-emerald-500, .bg-emerald-600, .bg-blue-500, .bg-purple-500,
        .bg-purple-600, .bg-violet-600, .bg-red-500, .bg-amber-500
      ) { color: #1e293b !important; }

      [data-theme="white"] .text-zinc-100,
      [data-theme="white"] .text-zinc-200,
      [data-theme="white"] .text-zinc-300 { color: #1e293b !important; }

      [data-theme="white"] .text-zinc-400,
      [data-theme="white"] .text-zinc-500,
      [data-theme="white"] .text-slate-400,
      [data-theme="white"] .text-slate-500 { color: #64748b !important; }

      [data-theme="white"] .text-zinc-600 { color: #475569 !important; }

      [data-theme="white"] .placeholder-zinc-500::placeholder,
      [data-theme="white"] .placeholder-zinc-600::placeholder { color: #94a3b8 !important; }

      /* ── Background colors ── */
      [data-theme="white"] .bg-black:not(.fixed),
      [data-theme="white"] [class*="bg-black/"]:not(.fixed):not([class*="bg-black/8"]),
      [data-theme="white"] [class*="bg-zinc-800"],
      [data-theme="white"] [class*="bg-zinc-900"],
      [data-theme="white"] [class*="bg-slate-800"],
      [data-theme="white"] [class*="bg-slate-900"] {
        background-color: #ffffff !important;
        border-color: #e2e8f0 !important;
      }

      /* Subtle white overlays → subtle dark overlays on light */
      [data-theme="white"] [class*="bg-white/5"],
      [data-theme="white"] [class*="bg-white/10"],
      [data-theme="white"] [class*="bg-white/["] {
        background-color: rgba(15, 23, 42, 0.03) !important;
      }

      /* Preserve dark modal overlays */
      [data-theme="white"] .fixed[class*="bg-black/8"],
      [data-theme="white"] .fixed.bg-black\\/80 {
        background-color: rgba(0, 0, 0, 0.6) !important;
        border-color: transparent !important;
      }

      /* ── Inputs & Textareas ── */
      [data-theme="white"] input,
      [data-theme="white"] textarea {
        background-color: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
        color: #0f172a !important;
      }

      /* ── Borders ── */
      [data-theme="white"] [class*="border-white/"],
      [data-theme="white"] [class*="border-zinc-"],
      [data-theme="white"] [class*="border-slate-"] {
        border-color: #e2e8f0 !important;
      }

      /* ── Scrollbar for white theme ── */
      [data-theme="white"] .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1 !important;
      }

      /* ── Hover states with white → adapt ── */
      [data-theme="white"] [class*="hover:bg-white/"]:hover {
        background-color: rgba(15, 23, 42, 0.05) !important;
      }
      [data-theme="white"] [class*="hover:text-white"]:hover:not(
        [class*="bg-fuchsia-"], [class*="bg-indigo-"], [class*="bg-emerald-"],
        [class*="bg-red-"], [class*="bg-accent"], [class*="hover:bg-fuchsia-"],
        [class*="hover:bg-indigo-"], [class*="hover:bg-emerald-"],
        [class*="hover:bg-red-"], [class*="hover:bg-accent"]
      ) { color: #0f172a !important; }
    `;
  } else if (theme === 'black') {
    // Black theme: enhance border visibility and card separation
    el.innerHTML = `
      /* ── Better border contrast for black theme ── */
      [data-theme="black"] [class*="border-line"] {
        border-color: rgba(63, 63, 70, 0.5) !important;
      }

      /* ── Cards slightly lifted from background ── */
      [data-theme="black"] [class*="bg-main/[0.02]"],
      [data-theme="black"] [class*="bg-main/\\[0.02\\]"] {
        background-color: rgba(255, 255, 255, 0.04) !important;
      }

      [data-theme="black"] [class*="bg-main/5"],
      [data-theme="black"] [class*="bg-main/[0.05]"] {
        background-color: rgba(255, 255, 255, 0.06) !important;
      }

      /* ── Subtle border glow on cards ── */
      [data-theme="black"] [class*="rounded-[2.5rem]"][class*="border"] {
        border-color: rgba(82, 82, 91, 0.35) !important;
      }

      /* ── Scrollbar for black theme ── */
      [data-theme="black"] .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(82, 82, 91, 0.5) !important;
      }
    `;
  } else {
    el.innerHTML = '';
  }
}

function updateButtons(theme) {
  const buttons = document.querySelectorAll('.theme-btn');
  if (buttons.length === 0) return;

  // Reset all buttons with theme-aware classes
  buttons.forEach(b => {
    b.className = 'theme-btn flex-1 py-2 rounded-lg bg-transparent text-muted hover:text-main hover:bg-main/5 transition-all';
  });

  const activeBtn = Array.from(buttons).find(b => b.getAttribute('data-theme') === theme);
  if (!activeBtn) return;

  if (theme === 'neon') {
    activeBtn.className = 'theme-btn flex-1 py-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-400 transition-all';
  } else if (theme === 'black') {
    activeBtn.className = 'theme-btn flex-1 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white transition-all';
  } else if (theme === 'white') {
    activeBtn.className = 'theme-btn flex-1 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-900 shadow-sm transition-all';
  }
}

export const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem(STORAGE_KEY) || 'neon';
    this.apply(savedTheme);
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    applyWrapperClasses(theme);
    applyPanelClasses(theme);
    applyCSSOverrides(theme);
    updateButtons(theme);

    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  },

  current() {
    return localStorage.getItem(STORAGE_KEY) || 'neon';
  }
};
