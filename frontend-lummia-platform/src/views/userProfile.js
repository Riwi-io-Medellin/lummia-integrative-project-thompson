import { users } from '../api/client.js';

export function renderUserProfile(container, userId) {
    if (!container) return;

    container.innerHTML = `
    <div class="animate-system-boot h-full flex flex-col relative z-0 p-4 lg:p-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div class="mb-6">
            <button id="btn-back-profile" class="px-4 py-2 bg-main/5 hover:bg-main/10 border border-line/10 rounded-xl text-[10px] font-bold text-muted hover:text-main uppercase tracking-widest transition-all flex items-center gap-2">
                <i class="fa-solid fa-arrow-left"></i> Back
            </button>
        </div>
        
        <div id="user-profile-content" class="flex-1 flex flex-col gap-6">
            <div class="flex flex-col items-center justify-center py-20 opacity-60">
                <img src="/assets/loading.gif" class="w-20 h-20" alt="Loading">
            </div>
        </div>
    </div>`;

    setTimeout(() => {
        document.getElementById('btn-back-profile')?.addEventListener('click', () => {
            window.history.back();
        });
        loadUserProfile(userId);
    }, 50);
}

async function loadUserProfile(userId) {
    const content = document.getElementById('user-profile-content');
    if (!content) return;

    try {
        const u = await users.getProfile(userId);
        
        content.innerHTML = `
            <div class="bg-card/40 backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div class="absolute -right-20 -top-20 w-80 h-80 bg-accent/10 rounded-full blur-[80px]"></div>
                
                <div class="w-32 h-32 rounded-[2rem] bg-app/60 border-2 border-accent/40 shadow-[0_0_30px_rgba(var(--rgb-accent),0.2)] flex items-center justify-center text-accent text-4xl font-black uppercase overflow-hidden shrink-0">
                    ${u.username?.[0] || '?'}
                </div>
                
                <div class="flex-1 text-center md:text-left relative z-10 w-full">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-3">
                        <span class="text-accent text-[9px] font-bold uppercase tracking-widest">${u.rank_name || 'Player'}</span>
                    </div>
                    <h1 class="text-3xl font-black text-main tracking-wide mb-2 truncate uppercase">${u.username}</h1>
                    <p class="text-sm text-muted mb-4 max-w-xl">${u.bio || 'This user has not set a bio yet.'}</p>
                    
                    <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div class="bg-main/5 border border-line/10 px-4 py-2 rounded-xl flex items-center gap-2">
                            <i class="fa-solid fa-shield text-indigo-400"></i>
                            <span class="text-xs font-bold text-main">${u.clan_name || 'No Clan'}</span>
                        </div>
                        <div class="bg-main/5 border border-line/10 px-4 py-2 rounded-xl flex items-center gap-2">
                            <i class="fa-solid fa-calendar text-muted"></i>
                            <span class="text-[10px] font-bold text-muted uppercase tracking-widest">Joined ${new Date(u.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-card/40 border border-line/5 rounded-[2rem] p-6 text-center shadow-xl flex flex-col items-center justify-center">
                    <div class="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-3 border border-accent/20"><i class="fa-solid fa-trophy text-accent text-xl"></i></div>
                    <p class="text-3xl font-black text-main uppercase">${u.level || 1}</p>
                    <p class="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">Level</p>
                </div>
                
                <div class="bg-card/40 border border-line/5 rounded-[2rem] p-6 text-center shadow-xl flex flex-col items-center justify-center">
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3 border border-amber-500/20"><i class="fa-solid fa-bolt text-amber-500 text-xl"></i></div>
                    <p class="text-3xl font-black text-main uppercase">${u.expbara || 0}</p>
                    <p class="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">Expbara</p>
                </div>
                
                <div class="bg-card/40 border border-line/5 rounded-[2rem] p-6 text-center shadow-xl flex flex-col items-center justify-center">
                    <div class="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center mb-3 border border-fuchsia-500/20"><i class="fa-solid fa-medal text-fuchsia-500 text-xl"></i></div>
                    <p class="text-3xl font-black text-main uppercase">${u.achievement_count || 0}</p>
                    <p class="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">Achievements</p>
                </div>
            </div>
        `;

    } catch (e) {
        console.error(e);
        content.innerHTML = `
            <div class="bg-card/40 border border-line/10 rounded-[2.5rem] p-8 text-center shadow-xl">
                <i class="fa-solid fa-triangle-exclamation text-red-400 text-4xl mb-4"></i>
                <h2 class="text-xl font-black text-main uppercase tracking-widest">Profile Not Found</h2>
                <p class="text-muted mt-2 text-sm">We couldn't load the requested user's profile.</p>
            </div>
        `;
    }
}
