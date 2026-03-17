// src/features/navigation/sidebar.js
import { ThemeManager } from '../../utils/themeManager.js';
import { clearToken } from '../../api/client.js';
import { getState, clearState } from '../../utils/state.js';

export function renderSidebar() {
  const container = document.getElementById('nav-container');
  if (!container) return;

  // Read from JWT session instead of localStorage
  const { user } = getState();
  const session = user || { username: 'Guest', level: 1, role: 'user', expbara: 0, rank_name: 'Aprendiz' };
  const initial = session.username.charAt(0).toUpperCase();
  const isAdmin = session.role === 'super_admin' || session.role === 'tech_lead';

  const menuItems = [
    { name: 'Home', icon: 'home', route: 'home' },
    { name: 'Focus Hub', icon: 'pomodoro', route: 'pomodoro' },
    { name: 'Clan', icon: 'clan', route: 'clan' },
    { name: 'Courses', icon: 'courses', route: 'courses' },
    { name: 'Skill Tree', icon: 'skills', route: 'skills' },
  ];

  // Admin tab only for super_admin and tech_lead
  if (isAdmin) {
    menuItems.push({ name: 'Admin', icon: 'skills', route: 'admin' });
  }

  container.innerHTML = /* html */`
    <style>
      @keyframes infinite-scroll-text {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-infinite-scroll { animation: infinite-scroll-text 8s linear infinite; }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--sidebar-border); border-radius: 10px; }
      .nav-icon {
        filter: invert(var(--icon-invert));
        opacity: 0.5;
        transition: all 0.3s ease;
      }
      .nav-link:hover .nav-icon { opacity: 1; }
    </style>

    <div class="p-6 flex items-center justify-between border-b border-line/10 relative transition-colors duration-300">
      <div class="flex items-center gap-4">
          <div class="w-10 h-10 relative flex-shrink-0 group/logo">
              <div class="absolute inset-0 bg-accent/10 blur-2xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500"></div>
              <img src="/assets/logo.gif" alt="Logo" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[75px] h-auto z-10 transition-transform duration-300 group-hover/logo:scale-110 pointer-events-none" style="filter: brightness(1.1);">
          </div>
         <div class="flex flex-col justify-center z-20">
           <h1 class="text-main text-xl font-bold tracking-tight leading-none uppercase">Lummia</h1>
           <span class="text-[9px] text-accent font-bold tracking-[0.2em] uppercase mt-1">Platform</span>
         </div>
      </div>
      <button id="hide-sidebar-btn" class="w-8 h-8 flex items-center justify-center rounded-lg bg-main/5 border border-line/10 text-muted hover:text-main transition-all z-30 group">
         <i class="fa-solid fa-chevron-left text-xs group-hover:-translate-x-0.5 transition-transform"></i>
      </button>
    </div>

    <div class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
      <p class="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] px-4 mb-4">Core Systems</p>
      ${menuItems.map(item => `
        <a href="#" data-route="${item.route}" class="nav-link group relative flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 border border-transparent hover:bg-main/5">
          <div class="nav-indicator absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-accent rounded-r-full transition-all duration-300 shadow-[0_0_12px_var(--rgb-accent)]"></div>
          <img src="/assets/${item.icon}.png" alt="${item.name}" class="nav-icon w-5 h-5 object-contain">
          <span class="nav-text font-medium text-sm text-muted group-hover:text-main transition-colors">${item.name}</span>
        </a>
      `).join('')}
    </div>

    <div class="mt-auto p-4 border-t border-line/10 transition-colors duration-300">
       <div class="relative group w-full">
          <div class="bg-card/40 backdrop-blur-theme border border-line/10 rounded-2xl p-2 hover:bg-card/60 transition-all duration-300 flex flex-col overflow-hidden shadow-theme">

             <!-- Profile card: single row, truncated -->
             <div class="flex items-center gap-2 w-full cursor-pointer nav-link p-2 rounded-xl" data-route="profile">
                <div class="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">${initial}</div>
                <div class="flex-1 min-w-0">
                   <h4 class="text-xs font-bold text-main truncate">${session.username}</h4>
                   <span id="sidebar-user-info" class="text-[9px] text-muted truncate block">${session.rank_name || 'Aprendiz'} - ${session.expbara || 0} XP</span>
                </div>
                <span id="sidebar-user-level" class="text-[9px] font-bold text-accent bg-accent/5 border border-accent/10 px-1.5 py-0.5 rounded flex-shrink-0">L${session.level || 1}</span>
             </div>

             <div class="p-3 border-t border-line/10 bg-main/5 rounded-xl mt-2">
                <h4 class="text-[8px] font-black text-muted uppercase tracking-widest mb-2 text-center">System Theme</h4>
                <div class="flex gap-1.5 bg-card/60 p-1 rounded-xl border border-line/10 shadow-inner">
                    <button data-theme="neon" class="theme-btn flex-1 py-1.5 rounded-lg hover:bg-main/5 text-muted transition-all flex items-center justify-center">
                      <i class="fa-solid fa-wand-magic-sparkles text-[10px] pointer-events-none"></i>
                    </button>
                    <button data-theme="black" class="theme-btn flex-1 py-1.5 rounded-lg hover:bg-main/5 text-muted transition-all flex items-center justify-center">
                      <i class="fa-solid fa-moon text-[10px] pointer-events-none"></i>
                    </button>
                    <button data-theme="white" class="theme-btn flex-1 py-1.5 rounded-lg hover:bg-main/5 text-muted transition-all flex items-center justify-center">
                      <i class="fa-solid fa-sun text-[10px] pointer-events-none"></i>
                    </button>
                </div>
             </div>

             <div class="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500">
                <div class="overflow-hidden">
                   <div class="pt-2 pb-1 px-2 border-t border-line/10 mt-1 flex flex-col gap-2">
                      <div class="flex gap-2">
                         <button class="nav-link flex-1 py-1.5 bg-main/5 hover:bg-accent hover:text-white rounded-lg text-[9px] text-main font-black uppercase tracking-wider transition-all" data-route="profile">Profile</button>
                         <button id="logout-btn" class="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg text-[9px] text-red-500 font-bold uppercase tracking-wider transition-all">Exit</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  `;

  setTimeout(() => {
    // 1. Theme Switcher
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => ThemeManager.apply(e.currentTarget.dataset.theme));
    });

    // 2. Logout - clear JWT
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        clearToken();
        clearState();
        window.location.reload();
      };
    }

    // 3. Toggle Sidebar
    const hideBtn = document.getElementById('hide-sidebar-btn');
    let openBtn = document.getElementById('floating-sidebar-btn');
    if (!openBtn) {
       openBtn = document.createElement('button');
       openBtn.id = 'floating-sidebar-btn';
       openBtn.className = 'fixed top-5 left-5 z-[100] w-8 h-8 bg-card/10 backdrop-blur-sm border border-line/10 rounded-lg flex items-center justify-center text-accent scale-0 opacity-0 pointer-events-none transition-all duration-300 hover:bg-main/10 group';
       openBtn.innerHTML = '<div class="flex flex-col gap-1 items-start"><span class="w-4 h-0.5 bg-current rounded-full"></span><span class="w-2 h-0.5 bg-current rounded-full"></span><span class="w-3 h-0.5 bg-current rounded-full"></span></div>';
       document.body.appendChild(openBtn);
    }
    hideBtn.onclick = () => {
       container.style.marginLeft = `-${container.offsetWidth}px`;
       container.style.opacity = '0';
       openBtn.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
    };
    openBtn.onclick = () => {
       container.style.marginLeft = '0px';
       container.style.opacity = '1';
       openBtn.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
    };
  }, 0);
}
