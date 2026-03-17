import { auth, users, achievements, gamification, clearToken } from '../api/client.js';
import { getState, setState, refreshUser } from '../utils/state.js';

export async function renderProfile() {
  const container = document.getElementById('main-container');
  if (!container) return;

  const freshUser = await refreshUser();
  const session = freshUser || {
      username: 'User_Admin',
      id: '0000',
      level: 1,
      expbara: 0,
      role: 'student'
  };

  container.innerHTML = /* html */`
    <style>
      .bio-scrollbar::-webkit-scrollbar { width: 6px; }
      .bio-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 12px; }
      .bio-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(217, 70, 239, 0.2);
        border-radius: 10px;
        transition: all 0.3s;
      }
      .bio-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217, 70, 239, 0.5); }
    </style>

    <div id="profile-view" class="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <div class="relative mb-10 rounded-[2.5rem] bg-card/40 backdrop-blur-2xl border border-line/10 p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
         
         <div class="relative group cursor-pointer">
            <div class="absolute inset-0 bg-fuchsia-500 blur-3xl opacity-10 group-hover:opacity-25 transition-opacity"></div>
            
            <div class="relative w-40 h-40 flex-shrink-0">
               <img src="../../assets/completedCapi.png" 
                    class="w-full h-full rounded-[2rem] object-cover border-2 border-fuchsia-500/20 group-hover:border-fuchsia-500/50 transition-all shadow-2xl" 
                    alt="User Avatar">
               
               <div class="absolute inset-0 flex items-center justify-center bg-card/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]">
                  <div class="text-center">
                     <i class="fa-solid fa-camera text-main text-xl mb-1"></i>
                     <p class="text-[8px] font-black uppercase text-main tracking-widest">Change Photo</p>
                  </div>
               </div>
            </div>
            <div class="absolute -bottom-2 -right-2 bg-fuchsia-600 text-white text-[10px] font-black px-4 py-1.5 rounded-xl shadow-lg border border-fuchsia-400/30 italic">
                LVL ${session.level || 1}
            </div>
         </div>

         <div class="text-center md:text-left flex-1">
            <h2 class="text-4xl font-black text-main uppercase tracking-tighter italic">Profile Dashboard</h2>
            <p class="text-muted text-sm font-medium mt-1">Configure your account and view achievements in <span class="text-fuchsia-500 font-bold">Lummia</span></p>
            
            <div class="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
               <div class="px-4 py-1.5 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
                  <span class="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">${session.username}</span>
               </div>
               <div class="px-4 py-1.5 bg-line/5 rounded-xl border border-line/10">
                  <span class="text-[10px] font-bold text-muted uppercase tracking-widest">ID: #${session.id || 'N/A'}</span>
               </div>
               <div class="px-4 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">EXP: ${session.expbara || 0}</span>
               </div>
            </div>
         </div>

         <button id="btn-save-profile" class="px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(217,70,239,0.3)] active:scale-95">
            Save All
         </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div class="lg:col-span-2 space-y-8">
            
            <div class="bg-card/30 border border-line/10 rounded-[2.5rem] p-8 space-y-6">
               <div class="flex items-center gap-3 pb-4 border-b border-line/5">
                  <div class="w-8 h-8 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
                     <i class="fa-solid fa-id-card text-fuchsia-400"></i>
                  </div>
                  <h3 class="text-xs font-black text-main uppercase tracking-[0.2em]">Digital Identity</h3>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                     <label class="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Username</label>
                     <input type="text" id="profile-username" value="${session.username}" class="w-full bg-line/[0.03] border border-line/10 rounded-2xl px-5 py-4 text-sm text-main focus:border-fuchsia-500/50 outline-none transition-all uppercase font-black italic">
                  </div>
                  <div class="space-y-2">
                     <label class="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Bio / Description</label>
                     <textarea id="profile-bio" rows="3" class="bio-scrollbar w-full bg-line/[0.03] border border-line/10 rounded-2xl px-5 py-4 pr-10 text-sm text-main focus:border-fuchsia-500/50 outline-none transition-all resize-none">${session.bio || 'New member, eager to learn.'}</textarea>
                  </div>
               </div>
               <p id="profile-msg" class="text-xs font-bold hidden"></p>
            </div>

            <div class="bg-card/30 border border-line/10 rounded-[2.5rem] p-8">
               <div class="flex items-center justify-between pb-6 border-b border-line/5 mb-6">
                  <div class="flex items-center gap-3">
                     <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <i class="fa-solid fa-trophy text-amber-500"></i>
                     </div>
                     <h3 class="text-xs font-black text-main uppercase tracking-[0.2em]">Featured Achievements</h3>
                  </div>
                  <span id="achievements-counter" class="text-[10px] font-bold text-muted">Loading...</span>
               </div>

               <div id="achievements-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="col-span-full flex flex-col items-center justify-center py-10 opacity-60">
                     <img src="/assets/loading.gif" class="w-14 h-14" alt="Loading">
                  </div>
               </div>
            </div>

            <div class="bg-card/30 border border-line/10 rounded-[2.5rem] p-8">
               <div class="flex items-center gap-3 pb-4 border-b border-line/5 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                     <i class="fa-solid fa-chart-line text-indigo-400"></i>
                  </div>
                  <h3 class="text-xs font-black text-main uppercase tracking-[0.2em]">Rank Progress</h3>
               </div>
               <div id="rank-progress-bar" class="space-y-3">
                  <div class="flex flex-col items-center justify-center py-6 opacity-60">
                     <img src="/assets/loading.gif" class="w-14 h-14" alt="Loading">
                  </div>
               </div>
            </div>
         </div>

         <div class="bg-card/30 border border-line/10 rounded-[2.5rem] p-8 space-y-6">
            <div class="flex items-center gap-3 pb-4 border-b border-line/5">
               <div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <i class="fa-solid fa-shield-halved text-red-500"></i>
               </div>
               <h3 class="text-xs font-black text-main uppercase tracking-[0.2em]">Security</h3>
            </div>

            <form id="form-password" class="space-y-5">
               <div class="space-y-2">
                  <label class="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Current Password</label>
                  <input type="password" id="input-curr-pass" placeholder="••••••••" class="w-full bg-line/[0.03] border border-line/10 rounded-2xl px-5 py-4 text-sm text-main outline-none focus:border-fuchsia-500/30 transition-all">
               </div>
               <div class="space-y-2">
                  <label class="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">New Password</label>
                  <input type="password" id="input-new-pass" required placeholder="••••••••" class="w-full bg-line/[0.03] border border-line/10 rounded-2xl px-5 py-4 text-sm text-main outline-none focus:border-fuchsia-500/30 transition-all">
               </div>
               <div class="space-y-2">
                  <label class="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input type="password" id="input-conf-pass" required placeholder="••••••••" class="w-full bg-line/[0.03] border border-line/10 rounded-2xl px-5 py-4 text-sm text-main outline-none focus:border-fuchsia-500/30 transition-all">
               </div>
               
               <p id="pwd-msg" class="text-xs font-bold hidden"></p>

               <button type="submit" id="btn-update-pwd" class="w-full py-4 bg-line/5 hover:bg-line/10 border border-line/10 rounded-2xl text-[10px] font-black text-muted hover:text-main uppercase tracking-[0.2em] transition-all cursor-pointer">
                  Update Password
               </button>
            </form>
            
            <div class="pt-6 border-t border-line/5">
               <button id="btn-logout" class="w-full py-3 text-red-500/40 hover:text-red-500 text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer">
                  Close All Sessions (Logout)
               </button>
            </div>
         </div>

      </div>
    </div>
  `;

  setTimeout(() => {
    attachProfileEvents();
    loadAchievements();
    loadRankProgress(session);
  }, 50);
}

async function loadAchievements() {
    const grid = document.getElementById('achievements-grid');
    const counter = document.getElementById('achievements-counter');
    if (!grid) return;

    try {
        const [allAch, myAch] = await Promise.all([achievements.list(), achievements.mine()]);
        const unlockedIds = new Set((myAch || []).map(a => a.id));
        const total = (allAch || []).length;
        const unlocked = unlockedIds.size;

        if (counter) counter.textContent = `${unlocked} / ${total} UNLOCKED`;

        if (!total) {
            grid.innerHTML = '<p class="col-span-full text-[10px] text-muted text-center py-4">No achievements defined yet.</p>';
            return;
        }

        const iconMap = { videos_completed: 'fa-play', posts_approved: 'fa-pen', comments_made: 'fa-comment', login_streak: 'fa-fire', pomodoros_completed: 'fa-clock' };
        grid.innerHTML = (allAch || []).map(a => {
            const owned = unlockedIds.has(a.id);
            const icon = iconMap[a.criteria] || 'fa-star';
            return `
                <div class="p-5 bg-line/5 border border-line/10 rounded-[2rem] flex flex-col items-center text-center ${owned ? 'group hover:bg-fuchsia-500/10' : 'opacity-30 grayscale cursor-not-allowed'} transition-all">
                    <i class="fa-solid ${icon} text-2xl ${owned ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'text-muted'} mb-3"></i>
                    <p class="text-[9px] font-black ${owned ? 'text-main' : 'text-muted'} uppercase tracking-tighter">${a.name}</p>
                </div>`;
        }).join('');
    } catch (e) {
        console.error('Failed to load achievements', e);
        grid.innerHTML = '<p class="col-span-full text-[10px] text-red-400 text-center py-4">Failed to load achievements</p>';
    }
}

async function loadRankProgress(session) {
    const container = document.getElementById('rank-progress-bar');
    if (!container) return;

    try {
        const ranks = await gamification.listRanks();
        if (!ranks || !ranks.length) {
            container.innerHTML = '<p class="text-[10px] text-muted text-center">No ranks configured.</p>';
            return;
        }

        const currentXP = session.expbara || 0;
        let currentRank = ranks[0];
        let nextRank = null;

        for (let i = 0; i < ranks.length; i++) {
            if (currentXP >= ranks[i].min_expbara) currentRank = ranks[i];
            else { nextRank = ranks[i]; break; }
        }

        const minXP = currentRank.min_expbara || 0;
        const maxXP = nextRank ? nextRank.min_expbara : minXP;
        const pct = maxXP > minXP ? Math.min(100, Math.round(((currentXP - minXP) / (maxXP - minXP)) * 100)) : 100;

        container.innerHTML = `
            <div class="flex justify-between text-[10px] font-bold text-muted uppercase tracking-widest mb-2">
                <span class="text-indigo-400">${currentRank.name}</span>
                <span>${nextRank ? nextRank.name : 'MAX RANK'}</span>
            </div>
            <div class="h-3 w-full bg-app/80 rounded-full border border-line/10 overflow-hidden p-[1px]">
                <div class="h-full bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)] relative overflow-hidden" style="width:${pct}%">
                    <div class="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
            <p class="text-[10px] text-muted text-center mt-1">${currentXP} / ${nextRank ? maxXP : currentXP} XP</p>
        `;
    } catch (e) {
        console.error('Failed to load rank progress', e);
        container.innerHTML = '<p class="text-[10px] text-red-400 text-center">Failed to load rank progress</p>';
    }
}

function attachProfileEvents() {
    const btnSave = document.getElementById('btn-save-profile');
    const formPwd = document.getElementById('form-password');
    const btnLogout = document.getElementById('btn-logout');

    if (btnSave) {
        btnSave.addEventListener('click', async () => {
            const msgEl = document.getElementById('profile-msg');
            btnSave.innerHTML = '<img src="/assets/loading.gif" class="w-5 h-5 inline" alt="Loading">';
            try {
                const newName = document.getElementById('profile-username').value.trim();
                const newBio = document.getElementById('profile-bio').value.trim();
                await users.updateProfile({ username: newName, bio: newBio });
                const { user } = getState();
                if (user) {
                    user.username = newName;
                    user.bio = newBio;
                    setState({ user });
                }
                btnSave.innerHTML = 'Save All';
                msgEl.textContent = 'Profile updated successfully!';
                msgEl.className = 'text-xs font-bold text-emerald-400 mt-2 block';
            } catch (e) {
                btnSave.innerHTML = 'Save All';
                msgEl.textContent = e.message || 'Failed to update profile';
                msgEl.className = 'text-xs font-bold text-red-400 mt-2 block';
            }
        });
    }

    if (formPwd) {
        formPwd.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-update-pwd');
            const newPass = document.getElementById('input-new-pass').value;
            const confPass = document.getElementById('input-conf-pass').value;
            const msgEl = document.getElementById('pwd-msg');

            msgEl.classList.remove('hidden');

            if (newPass !== confPass) {
                msgEl.textContent = 'Passwords do not match!';
                msgEl.className = 'text-xs font-bold text-red-500 mb-4 block';
                return;
            }

            btn.innerHTML = '<img src="/assets/loading.gif" class="w-5 h-5 inline" alt="Loading">';
            try {
                const currPass = document.getElementById('input-curr-pass').value;
                await auth.changePassword(currPass, newPass, confPass);
                msgEl.textContent = 'Password changed successfully!';
                msgEl.className = 'text-xs font-bold text-emerald-500 mb-4 block';
                formPwd.reset();
            } catch (err) {
                msgEl.textContent = err.message || 'Failed to change password';
                msgEl.className = 'text-xs font-bold text-red-500 mb-4 block';
            } finally {
                btn.innerHTML = 'Update Password';
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            clearToken();
            window.location.reload();
        });
    }
}