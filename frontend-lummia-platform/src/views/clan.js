import { io } from 'socket.io-client';
import { getState } from '../utils/state.js';
import { getToken, clanChat, gamification, admin } from '../api/client.js';

export function renderClan() {
  const { user } = getState();
  const session = user || { clan_name: 'Unaffiliated' };
  const isPrivileged = session.role === 'super_admin' || session.role === 'tech_lead';

  return /* html */`
    <div class="animate-system-boot h-full flex flex-col relative z-0 p-4 lg:p-6 lg:px-8">

      <div class="flex-none bg-main/[0.02] backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-2xl group flex-shrink-0">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[80px] group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
        <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
           <div class="relative">
             <div class="w-24 h-24 lg:w-28 lg:h-28 rounded-[2rem] bg-card/60 border-2 border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center justify-center text-5xl transform group-hover:scale-105 transition-all duration-300 backdrop-blur-md">
                <i class="fa-solid fa-shield-halved text-5xl text-indigo-400"></i>
             </div>
             <div class="absolute -bottom-3 -right-3 bg-black border border-indigo-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-[0_0_10px_rgba(99,102,241,0.5)]">LVL ${session.level || 1}</div>
           </div>
           <div class="flex-1 w-full text-center md:text-left">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
                <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_8px_#818cf8]"></span>
                <span class="text-indigo-400 text-[9px] font-bold uppercase tracking-widest">${isPrivileged ? 'All Clans Overview' : 'Elite Alliance'}</span>
              </div>
              <h1 class="text-3xl lg:text-4xl font-bold text-main tracking-wide mb-4 truncate drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">${isPrivileged ? 'Clan Management' : (session.clan_name || 'Unaffiliated')}</h1>
              <div class="max-w-xl">
                 <div class="flex justify-between text-[10px] font-bold text-muted uppercase tracking-widest mb-2">
                    <span class="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] flex items-center gap-1.5"><i class="fa-solid fa-users"></i> ${isPrivileged ? 'All Clan Members' : 'Clan Members'}</span>
                    <span>Next Guild Perk: 15,000 XP</span>
                 </div>
                 <div class="h-3.5 w-full bg-card/80 rounded-full border border-line/10 overflow-hidden shadow-inner p-[1px]">
                    <div class="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full w-[75%] shadow-[0_0_15px_rgba(99,102,241,0.6)] relative overflow-hidden">
                       <div class="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                 </div>
              </div>
           </div>
           <div class="hidden lg:flex gap-4">
              <div class="flex flex-col items-center justify-center bg-card/40 backdrop-blur-md border border-line/10 rounded-3xl p-5 min-w-[100px] shadow-lg">
                 <span class="text-2xl mb-1 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"><i class="fa-solid fa-trophy text-amber-400"></i></span>
                 <span class="text-xl font-black text-main tracking-tighter">${session.rank_name || 'Member'}</span>
                 <span class="text-[9px] text-amber-400 font-bold uppercase tracking-widest mt-1">Rank</span>
              </div>
           </div>
        </div>
      </div>

      <!-- Clan selector for admin/tech_lead -->
      <div id="clan-selector-container" class="hidden mb-6"></div>

      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">

         <div class="lg:col-span-8 flex flex-col gap-6 h-full">
            <div class="bg-main/[0.02] backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-6 lg:p-8 shadow-2xl flex-1 flex flex-col overflow-hidden relative">

               <div class="flex items-center justify-between mb-6">
                  <h3 class="text-sm font-black text-main uppercase tracking-widest flex items-center gap-3">
                     <i class="fa-solid fa-ranking-star text-amber-400"></i> Clan Ranking
                  </h3>
                  <div class="flex gap-2 bg-card/40 p-1 rounded-xl border border-line/10">
                     <button class="px-4 py-1.5 bg-main/10 text-main rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">Weekly</button>
                     <button class="px-4 py-1.5 hover:bg-main/5 text-muted hover:text-main rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">All Time</button>
                  </div>
               </div>

               <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div id="clan-ranking-list" class="space-y-3">
                     <div class="flex flex-col items-center justify-center opacity-60 py-12">
                        <img src="/assets/loading.gif" class="w-14 h-14" alt="Loading">
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div class="lg:col-span-4 flex flex-col gap-6 min-h-0">

            <div class="bg-main/[0.02] backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-6 shadow-2xl">
               <h3 class="text-xs font-black text-main uppercase tracking-widest flex items-center gap-3 mb-4">
                  <i class="fa-solid fa-crosshairs text-emerald-400"></i> Weekly Guild Quest
               </h3>
               <div class="bg-card/40 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px]"></div>
                  <h4 class="text-sm font-bold text-main mb-1 relative z-10">The Pomodoro Crusade</h4>
                  <p class="text-xs text-muted mb-4 relative z-10">Complete 100 Focus Sessions collectively as a clan to unlock the 'Time Lord' badge.</p>

                  <div class="relative z-10">
                     <div class="flex justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                        <span>Progress</span>
                        <span>72 / 100 Sessions</span>
                     </div>
                     <div class="h-2 w-full bg-card/80 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500 rounded-full w-[72%] shadow-[0_0_10px_rgba(16,185,129,0.8)] relative overflow-hidden">
                            <div class="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="bg-main/[0.02] backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-6 shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden">
               <h3 id="clan-chat-title" class="text-xs font-black text-main uppercase tracking-widest flex items-center gap-3 mb-4">
                  <i class="fa-solid fa-bolt text-indigo-400"></i> Clan Chat
               </h3>

               <div id="clan-chat-list" class="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 mb-4 min-h-0">
                  <div class="flex flex-col items-center justify-center opacity-60 py-12">
                    <img src="/assets/loading.gif" class="w-14 h-14" alt="Loading">
                  </div>
               </div>

               <div id="clan-chat-input-wrapper" class="relative mt-auto flex gap-2">
                 <input id="clan-chat-input" type="text" placeholder="Send a message..." class="flex-1 py-3 px-4 bg-main/5 border border-line/10 rounded-xl text-xs text-main placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50">
                 <button id="clan-chat-send" class="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-main rounded-xl transition-all cursor-pointer">
                    <i class="fa-solid fa-paper-plane"></i>
                 </button>
               </div>
            </div>

         </div>
      </div>
    </div>
  `;
}

let socket = null;

export async function initClanLogic() {
    const { user } = getState();
    const token = getToken();
    if (!token) return;

    const isPrivileged = user?.role === 'super_admin' || user?.role === 'tech_lead';

    window.addEventListener('popstate', () => {
        if (socket) socket.disconnect();
    }, { once: true });

    if (isPrivileged) {
        // ──── ADMIN / TL MODE: show all clans with tab selector ────
        try {
            const allClans = await admin.listClans();
            const selectorContainer = document.getElementById('clan-selector-container');

            if (selectorContainer && allClans.length) {
                selectorContainer.classList.remove('hidden');
                selectorContainer.innerHTML = `
                    <div class="flex flex-wrap gap-2 bg-main/[0.02] backdrop-blur-xl border border-line/10 rounded-2xl p-4 items-center">
                        <span class="text-[9px] font-black text-muted uppercase tracking-widest mr-2"><i class="fa-solid fa-shield-halved text-indigo-400 mr-1"></i> View Clan:</span>
                        ${allClans.map((c, i) => `
                            <button class="clan-tab px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer
                                ${i === 0 ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-main/5 text-muted hover:bg-main/10 hover:text-main'}
                                border border-line/10"
                                data-clan-id="${c.id}" data-clan-name="${c.name}">
                                ${c.name} <span class="text-[8px] opacity-60">(${c.member_count})</span>
                            </button>
                        `).join('')}
                    </div>`;

                selectorContainer.querySelectorAll('.clan-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        selectorContainer.querySelectorAll('.clan-tab').forEach(t => {
                            t.classList.remove('bg-indigo-500', 'text-white', 'shadow-[0_0_15px_rgba(99,102,241,0.4)]');
                            t.classList.add('bg-main/5', 'text-muted');
                        });
                        tab.classList.remove('bg-main/5', 'text-muted');
                        tab.classList.add('bg-indigo-500', 'text-white', 'shadow-[0_0_15px_rgba(99,102,241,0.4)]');

                        const clanId = parseInt(tab.dataset.clanId);
                        const clanName = tab.dataset.clanName;
                        loadClanData(clanId, clanName, user);
                    });
                });

                // Load first clan by default
                if (allClans[0]) {
                    await loadClanData(allClans[0].id, allClans[0].name, user);
                }
            }
        } catch (e) {
            console.error('Failed to load clans for admin', e);
            // Fallback to own clan
            if (user?.clan_id) await loadClanData(user.clan_id, user.clan_name, user);
        }
    } else {
        // ──── REGULAR USER MODE: show own clan only ────
        if (user?.clan_id) {
            await loadClanData(user.clan_id, user.clan_name, user);
        } else {
            const chatList = document.getElementById('clan-chat-list');
            const listEl = document.getElementById('clan-ranking-list');
            if (chatList) chatList.innerHTML = '<p class="text-[10px] text-muted py-4 text-center">You are not in a clan.</p>';
            if (listEl) listEl.innerHTML = '<p class="text-[10px] text-muted py-4 text-center">Join a clan to see rankings.</p>';
        }
    }

    // Socket setup (always connects to user's OWN clan for real-time)
    setupClanSocket(user, token);
}

// ──── Load ranking + chat for a specific clan ────
async function loadClanData(clanId, clanName, currentUser) {
    const chatList = document.getElementById('clan-chat-list');
    const listEl = document.getElementById('clan-ranking-list');
    const chatTitle = document.getElementById('clan-chat-title');
    const isPrivileged = currentUser?.role === 'super_admin' || currentUser?.role === 'tech_lead';
    const isOwnClan = clanId === currentUser?.clan_id;

    // Update chat title with clan name for admin
    if (chatTitle && isPrivileged) {
        chatTitle.innerHTML = `<i class="fa-solid fa-bolt text-indigo-400"></i> ${clanName} Chat ${isOwnClan ? '<span class="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded ml-1">Your Clan</span>' : ''}`;
    }

    // ── Chat input: disable if admin/TL viewing another clan ──
    const chatInput = document.getElementById('clan-chat-input');
    const chatSend = document.getElementById('clan-chat-send');
    if (chatInput && chatSend && isPrivileged) {
        chatInput.disabled = !isOwnClan;
        chatSend.disabled = !isOwnClan;
        if (!isOwnClan) {
            chatInput.placeholder = 'Read-only — you can only chat in your own clan';
            chatInput.classList.add('opacity-50');
            chatSend.classList.add('opacity-50', 'cursor-not-allowed');
            chatSend.classList.remove('hover:bg-indigo-500');
        } else {
            chatInput.placeholder = 'Send a message...';
            chatInput.classList.remove('opacity-50');
            chatSend.classList.remove('opacity-50', 'cursor-not-allowed');
            chatSend.classList.add('hover:bg-indigo-500');
        }
    }

    // ── Load ranking ──
    if (listEl) {
        listEl.innerHTML = '<div class="flex flex-col items-center justify-center opacity-60 py-12"><img src="/assets/loading.gif" class="w-14 h-14" alt="Loading"></div>';
    }

    try {
        const clanMembers = await gamification.clanMembers(clanId);
        if (listEl && clanMembers) {
            if (!clanMembers.length) {
                listEl.innerHTML = '<p class="text-[10px] text-muted py-4 text-center">No members in this clan yet.</p>';
            } else {
                listEl.innerHTML = clanMembers.map((u, i) => `
                    <div class="flex items-center gap-4 p-4 rounded-2xl bg-main/[0.02] border border-line/10 hover:bg-main/[0.04] transition-all cursor-pointer" onclick="window.location.hash='#user-profile/${u.id}'">
                        <span class="text-lg w-8 text-center font-black text-muted">${i + 1}</span>
                        <div class="w-10 h-10 rounded-full bg-card/60 border border-line/10 flex items-center justify-center text-lg font-bold text-indigo-400 uppercase">${u.username.charAt(0)}</div>
                        <div class="flex-1">
                           <p class="text-sm font-bold text-main/90">
                               ${u.username}
                               ${u.id === currentUser?.id ? '<span class="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded uppercase tracking-widest ml-1">You</span>' : ''}
                           </p>
                           <p class="text-[10px] text-muted font-medium">${u.rank_name || 'Member'}</p>
                        </div>
                        <div class="text-right">
                           <p class="text-sm font-bold text-main/80">${u.expbara} XP</p>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error('Failed to load ranking', e);
        if (listEl) listEl.innerHTML = '<p class="text-[10px] text-red-400">Failed to load ranking</p>';
    }

    // ── Load chat history ──
    if (chatList) {
        chatList.innerHTML = '<div class="flex flex-col items-center justify-center opacity-60 py-12"><img src="/assets/loading.gif" class="w-14 h-14" alt="Loading"></div>';
    }

    try {
        const historyData = await clanChat.history(clanId);
        const messages = historyData.messages || [];
        if (chatList) {
            if (!messages.length) {
                chatList.innerHTML = '<p class="text-[10px] text-muted py-4 text-center">No messages yet in this clan.</p>';
            } else {
                chatList.innerHTML = messages.map(m => `
                    <div class="flex gap-3 items-start animate-fade-in">
                       <div class="w-8 h-8 rounded-full bg-main/10 border border-line/20 flex items-center justify-center text-xs flex-shrink-0 font-bold uppercase">${m.username ? m.username[0] : '?'}</div>
                       <div>
                          <p class="text-xs text-main/80"><span class="font-bold text-indigo-400">${m.username}</span> ${m.content}</p>
                          <p class="text-[9px] text-muted/60 mt-1 uppercase tracking-widest">${new Date(m.timestamp).toLocaleTimeString()}</p>
                       </div>
                    </div>
                `).join('');
                chatList.scrollTop = chatList.scrollHeight;
            }
        }
    } catch (e) {
        console.error('Failed to load chat history', e);
        if (chatList) chatList.innerHTML = '<p class="text-[10px] text-red-400">Failed to load history</p>';
    }
}

// ──── Socket setup (always connects to user's OWN clan) ────
function setupClanSocket(user, token) {
    if (socket) socket.disconnect();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(API_URL);

    socket.on('connect', () => {
        console.log('[CLAN SOCKET] Connected, sid:', socket.id);
        socket.emit('join_clan', { token });
    });

    socket.on('connect_error', (err) => {
        console.error('[CLAN SOCKET] Connection error:', err.message);
    });

    socket.on('joined', (data) => {
        console.log('[CLAN SOCKET] Joined room:', data);
    });

    socket.on('error', (data) => {
        console.error('[CLAN SOCKET] Server error:', data);
    });

    socket.on('receive_message', (m) => {
        console.log('[CLAN SOCKET] Received message:', m);
        // Always get fresh DOM ref in case content was swapped
        const cl = document.getElementById('clan-chat-list');
        if (!cl) return;
        // Clear "No messages yet" placeholder if present
        const placeholder = cl.querySelector('p.text-muted');
        if (placeholder) placeholder.remove();
        const html = `
            <div class="flex gap-3 items-start animate-fade-in">
               <div class="w-8 h-8 rounded-full bg-main/10 border border-line/20 flex items-center justify-center text-xs flex-shrink-0 font-bold uppercase">${m.username ? m.username[0] : '?'}</div>
               <div>
                  <p class="text-xs text-main/80"><span class="font-bold text-indigo-400">${m.username}</span> ${m.content}</p>
                  <p class="text-[9px] text-muted/60 mt-1 uppercase tracking-widest">${new Date(m.timestamp || Date.now()).toLocaleTimeString()}</p>
               </div>
            </div>`;
        cl.insertAdjacentHTML('beforeend', html);
        cl.scrollTop = cl.scrollHeight;
    });

    // sendMsg uses WebSocket event (not REST) for real-time broadcast
    const sendMsg = () => {
        const inp = document.getElementById('clan-chat-input');
        const cl = document.getElementById('clan-chat-list');
        if (!inp || inp.disabled || !cl) return;
        const val = inp.value.trim();
        if (val) {
            inp.value = '';
            // Send via WebSocket — the server saves to MongoDB AND broadcasts to the room
            socket.emit('send_message', { token, content: val });
            console.log('[CLAN SOCKET] Sent message via WebSocket:', val);
        }
    };

    // Replace buttons to remove old listeners, then re-attach fresh ones
    const chatSend = document.getElementById('clan-chat-send');
    const chatInput = document.getElementById('clan-chat-input');
    if (chatSend && chatInput) {
        const newSend = chatSend.cloneNode(true);
        chatSend.parentNode.replaceChild(newSend, chatSend);
        const newInput = chatInput.cloneNode(true);
        chatInput.parentNode.replaceChild(newInput, chatInput);

        newSend.addEventListener('click', sendMsg);
        newInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') sendMsg();
        });
    }

    // Cleanup when leaving view
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-link');
        if (btn && btn.getAttribute('data-route') !== 'clan') {
            if (socket) socket.disconnect();
        }
    });
}
