// src/views/home.js
import { content, feed, gamification } from '../api/client.js';
import { getState, refreshUser } from '../utils/state.js';
import { initCoursesLogic } from '../features/services/courses/coursesLogic.js';

export async function renderHome() {
    const container = document.getElementById('main-container');
    if (!container) return;

    const freshUser = await refreshUser();
    const session = freshUser || { username: 'Code Apprentice', level: 1, expbara: 0, role: 'user', rank_name: 'Aprendiz' };

    container.innerHTML = /* html */`
    <div class="animate-in fade-in duration-500 min-h-full flex flex-col relative z-0 p-4 lg:p-6 lg:px-8 pb-32">

      <div class="flex-none bg-card/40 backdrop-blur-3xl border border-line/5 rounded-[2.5rem] p-8 mb-10 relative overflow-hidden shadow-2xl group flex-shrink-0">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-accent/10 rounded-full blur-[80px] group-hover:bg-accent/20 transition-colors duration-700"></div>
        <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
           <div class="relative">
                <div class="w-24 h-24 lg:w-28 lg:h-28 rounded-[2rem] bg-app/60 border-2 border-accent/40 shadow-[0_0_30px_rgba(var(--rgb-accent),0.2)] flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 backdrop-blur-md overflow-hidden">
                    <img src="../../assets/completedCapi.png" alt="capybara" class="w-full h-full object-cover">
                </div>
                <div class="absolute -bottom-3 -right-3 bg-card border border-accent text-main text-[10px] font-black px-2.5 py-1 rounded-lg">
                    LVL ${session.level || 1}
                </div>
           </div>
           <div class="flex-1 w-full text-center md:text-left">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-3">
                <span class="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--rgb-accent),0.8)]"></span>
                <span class="text-accent text-[9px] font-bold uppercase tracking-widest italic font-black">
                    ${session.rank_name || (session.role === 'tech_lead' ? 'Clan Leader' : 'Clan Member')}
                </span>
              </div>
              <h1 class="text-3xl lg:text-4xl font-bold text-main tracking-wide mb-4 truncate uppercase font-black">
                ${session.username}
              </h1>
              <div class="max-w-xl">
                 <div class="flex justify-between text-[10px] font-bold text-muted uppercase tracking-widest mb-2">
                    <span id="hero-xp-inline" class="text-amber-500 flex items-center gap-1.5 font-black"><i class="fa-solid fa-bolt"></i> ${session.expbara || 0} Expbara</span>
                    <span id="next-rank-label">Next Rank: --</span>
                 </div>
                 <div class="h-3.5 w-full bg-main/[0.08] rounded-full border border-line/20 overflow-hidden shadow-inner p-[1px]">
                    <div id="xp-bar" class="h-full bg-gradient-to-r from-accent via-fuchsia-400 to-amber-400 rounded-full shadow-[0_0_8px_rgba(var(--rgb-accent),0.4)] transition-all duration-1000" style="width: 0%"></div>
                 </div>
              </div>
           </div>
           <div class="hidden lg:flex flex-col items-center justify-center bg-card/40 backdrop-blur-md border border-line/10 rounded-3xl p-5 min-w-[130px] shadow-lg">
              <span id="hero-xp-total" class="text-2xl font-black text-main">${session.expbara || 0}</span>
              <span class="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-1">Total XP</span>
           </div>
        </div>
      </div>

      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div class="lg:col-span-8 flex flex-col gap-8 min-w-0">
            <div class="flex flex-col gap-4 min-w-0">
                <h3 class="text-xs font-black text-main uppercase tracking-widest flex items-center gap-3"><i class="fa-solid fa-fire text-amber-500"></i> Featured Videos</h3>
                <div class="relative group/carousel">
                    
                    <button id="btn-scroll-left" class="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-line/20 shadow-xl flex items-center justify-center text-main hover:text-accent hover:bg-card hover:scale-110 transition-all opacity-0 pointer-events-none cursor-pointer">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    
                    <button id="btn-scroll-right" class="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-line/20 shadow-xl flex items-center justify-center text-main hover:text-accent hover:bg-card hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>

                    <div id="video-scroll-container" class="scroll-x-container html-scroll scroll-mask flex overflow-x-auto gap-5 pb-8 pt-2 px-4 cursor-grab active:cursor-grabbing">
                        <div class="flex flex-col items-center justify-center py-16 w-full opacity-60">
                            <img src="/assets/loading.gif" class="w-16 h-16 mb-3" alt="Loading">
                            <span class="text-[10px] font-black text-main uppercase tracking-widest">Loading videos...</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-6 relative min-w-0">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs font-black text-main uppercase tracking-widest flex items-center gap-3"><i class="fa-solid fa-rss text-accent"></i> Global Feed</h3>
                    <button id="btn-new-post" class="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all cursor-pointer">+ New Feed</button>
                </div>

                <div id="new-post-form" class="hidden bg-card/40 backdrop-blur-md border border-line/5 rounded-[2rem] p-5 shadow-inner">
                    <input id="post-title-input" placeholder="Title..." class="w-full bg-app/50 border border-line/10 rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent mb-3">
                    
                    <div class="relative mb-3">
                        <textarea id="post-content-input" placeholder="Share your progress..." class="w-full bg-app/50 border border-line/10 rounded-xl px-4 py-3 pb-12 text-sm text-main placeholder-muted focus:outline-none focus:border-accent resize-none h-24"></textarea>
                        
                        <div class="absolute bottom-2 left-2 flex gap-2">
                            <button id="btn-add-video" class="p-2 rounded-lg bg-card border border-line/10 text-muted hover:text-red-500 hover:border-red-500/30 transition-colors text-xs flex items-center justify-center cursor-pointer group relative">
                                <i class="fa-brands fa-youtube pointer-events-none"></i>
                                <div class="absolute -top-8 left-0 hidden group-hover:block bg-card text-main text-[9px] px-2 py-1 rounded whitespace-nowrap border border-line/10">Add YouTube</div>
                            </button>
                            <button id="btn-add-code" class="p-2 rounded-lg bg-card border border-line/10 text-muted hover:text-emerald-500 hover:border-emerald-500/30 transition-colors text-xs flex items-center justify-center cursor-pointer group relative">
                                <i class="fa-solid fa-code pointer-events-none"></i>
                                <div class="absolute -top-8 left-0 hidden group-hover:block bg-card text-main text-[9px] px-2 py-1 rounded whitespace-nowrap border border-line/10">Add Code Snippet</div>
                            </button>
                        </div>
                    </div>

                    <div id="video-input-area" class="hidden mb-3 flex gap-2">
                        <input id="youtube-url-input" type="text" placeholder="Paste YouTube URL..." class="flex-1 bg-app border border-line/10 rounded-xl px-4 py-2 text-xs text-main focus:outline-none focus:border-red-500/50">
                        <button id="btn-insert-video" class="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all cursor-pointer">Insert</button>
                    </div>

                    <div id="code-input-area" class="hidden mb-3">
                        <textarea id="code-snippet-input" placeholder="Paste your code here..." class="w-full bg-[#0d1117] border border-line/10 rounded-xl px-4 py-3 text-xs text-green-400 font-mono focus:outline-none focus:border-emerald-500/50 resize-none h-32 mb-2"></textarea>
                        <div class="flex justify-end">
                            <button id="btn-insert-code" class="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">Insert Code</button>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2">
                        <button id="btn-cancel-post" class="px-4 py-2 bg-line/5 text-muted rounded-xl text-[10px] font-bold cursor-pointer hover:bg-line/10">Cancel</button>
                        <button id="btn-submit-post" class="px-6 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">Post</button>
                    </div>
                </div>

                <div id="posts-feed" class="flex flex-col gap-6 max-h-[600px] overflow-y-auto custom-scrollbar html-scroll px-1 pb-8">
                    <div class="flex flex-col items-center justify-center py-16 opacity-60">
                        <img src="/assets/loading.gif" class="w-16 h-16 mb-3" alt="Loading">
                        <span class="text-[10px] font-black text-main uppercase tracking-widest">Loading feed...</span>
                    </div>
                </div>
            </div>
         </div>

         <div class="lg:col-span-4 flex flex-col gap-8">
            <div class="grid grid-cols-2 gap-4">
               <div class="bg-card/40 border border-line/5 rounded-[2.5rem] p-6 text-center shadow-xl group hover:border-accent/30 transition-all">
                  <div class="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3 border border-accent/20"><i class="fa-solid fa-trophy text-accent text-xl"></i></div>
                  <p class="text-2xl font-black text-main uppercase">${session.level || 1}</p>
                  <p class="text-[9px] text-muted font-bold uppercase tracking-widest">Level</p>
               </div>
               <div class="bg-card/40 border border-line/5 rounded-[2.5rem] p-6 text-center shadow-xl group hover:border-amber-500/30 transition-all">
                  <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3 border border-amber-500/20"><i class="fa-solid fa-bolt text-amber-500 text-xl"></i></div>
                  <p class="text-2xl font-black text-main uppercase">${session.expbara || 0}</p>
                  <p class="text-[9px] text-muted font-bold uppercase tracking-widest">Expbara</p>
               </div>
            </div>

            <div class="bg-card/40 border border-line/5 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-[550px]">
               <h3 class="text-xs font-black text-main uppercase tracking-widest flex items-center gap-3 mb-6 flex-shrink-0"><i class="fa-solid fa-ranking-star text-amber-500"></i> Leaderboard</h3>
               <div id="leaderboard-list" class="space-y-4 overflow-y-auto custom-scrollbar html-scroll pr-2 flex-1 min-h-0">
                  <div class="flex flex-col items-center justify-center py-12 opacity-60">
                     <img src="/assets/loading.gif" class="w-14 h-14 mb-3" alt="Loading">
                     <span class="text-[10px] font-black text-main uppercase tracking-widest">Loading Clan...</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  `;

    setTimeout(() => {
        loadVideosFromAPI();
        loadPostsFromAPI();
        loadLeaderboardFromAPI();
        loadXPBar(session);
        attachPostForm();
        initCoursesLogic();
    }, 50);

    window.addEventListener('xp-updated', (e) => {
        const user = e.detail;
        if (!user) return;
        loadXPBar(user);
        const inlineEl = document.getElementById('hero-xp-inline');
        if (inlineEl) inlineEl.innerHTML = `<i class="fa-solid fa-bolt"></i> ${user.expbara || 0} Expbara`;
        const totalEl = document.getElementById('hero-xp-total');
        if (totalEl) totalEl.textContent = user.expbara || 0;
    });
}

async function loadXPBar(session) {
    try {
        const ranks = await gamification.listRanks();
        const sorted = ranks.sort((a, b) => a.min_expbara - b.min_expbara);
        let ci = 0;
        for (let i = sorted.length - 1; i >= 0; i--) if (session.expbara >= sorted[i].min_expbara) { ci = i; break; }
        const nxt = sorted[ci + 1];
        const bar = document.getElementById('xp-bar');
        const lbl = document.getElementById('next-rank-label');
        if (nxt && bar) { bar.style.width = Math.min(((session.expbara - sorted[ci].min_expbara) / (nxt.min_expbara - sorted[ci].min_expbara)) * 100, 100) + '%'; if (lbl) lbl.textContent = `Next Rank: ${nxt.name} (${nxt.min_expbara - session.expbara} XP)`; }
        else if (bar) { bar.style.width = '100%'; if (lbl) lbl.textContent = 'Max Rank'; }
    } catch (e) { console.error(e); }
}

async function loadVideosFromAPI() {
    try {
        const videos = await content.listVideos(null, 'approved');
        const el = document.getElementById('video-scroll-container');
        if (!el) return;
        if (!videos.length) { el.innerHTML = '<p class="text-muted text-sm p-8">No videos available yet</p>'; return; }
        el.innerHTML = videos.slice(0, 12).map((v, i) => {
            const ytId = (v.youtube_url.match(/(?:v=|youtu\.be\/)([\w-]+)/) || [])[1] || '';
            const hasQuiz = !!v.quiz_question;
            const colors = ['fuchsia', 'blue', 'amber', 'emerald', 'sky', 'purple'];
            const col = colors[i % colors.length];
            return `<div class="min-w-[300px] w-[300px] bg-card/60 border border-line/5 rounded-2xl p-3 hover:bg-line/5 transition-all group cursor-pointer shrink-0 shadow-lg" onclick="window.location.hash='video-player/${v.id}'">
                <div class="w-full h-44 bg-app/80 rounded-xl mb-3 relative overflow-hidden border border-line/10 group-hover:border-${col}-500/50 transition-colors">
                    <img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt=""/>
                    <div class="absolute inset-0 bg-card/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div class="w-12 h-12 rounded-full bg-line/5 border border-line/10 flex items-center justify-center text-white z-10 shadow-2xl"><i class="fa-solid fa-play text-sm pl-1"></i></div>
                    </div>
                    <span class="absolute bottom-2 right-2 bg-card/80 text-main text-[10px] font-black px-2 py-0.5 rounded backdrop-blur-sm z-20">${v.duration_minutes || 10} min</span>
                    ${hasQuiz ? '<span class="absolute top-2 left-2 bg-accent/90 text-white text-[9px] font-black px-2 py-0.5 rounded-lg z-20">Quiz</span>' : ''}
                </div>
                <h4 class="text-sm font-black text-main group-hover:text-${col}-400 transition-colors mb-1 truncate uppercase tracking-tight">${v.title}</h4>
                <p class="text-[10px] text-muted font-bold uppercase tracking-widest">${hasQuiz ? '+75' : '+50'} Expbara</p>
            </div>`;
        }).join('');

        // Attach scroll logic for arrows
        const btnLeft = document.getElementById('btn-scroll-left');
        const btnRight = document.getElementById('btn-scroll-right');
        if (btnLeft && btnRight && el) {
            btnLeft.addEventListener('click', () => {
                el.scrollBy({ left: -320, behavior: 'smooth' });
            });
            btnRight.addEventListener('click', () => {
                el.scrollBy({ left: 320, behavior: 'smooth' });
            });
            
            // Show/hide logic
            el.addEventListener('scroll', () => {
                btnLeft.style.opacity = el.scrollLeft > 0 ? "1" : "0";
                btnLeft.style.pointerEvents = el.scrollLeft > 0 ? "auto" : "none";
            });
        }

    } catch (e) { console.error(e); }
}

async function loadPostsFromAPI() {
    try {
        const posts = await feed.listPosts();
        const el = document.getElementById('posts-feed');
        if (!el) return;
        if (!posts.length) { el.innerHTML = '<p class="text-muted text-sm p-6 text-center">No posts yet. Be the first!</p>'; return; }
        el.innerHTML = posts.map(p => {
            const ytMatch = p.content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
            const ytEmbed = ytMatch ? `<div class="mt-3 rounded-xl overflow-hidden aspect-video border border-line/5"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}?rel=0" class="w-full h-full" frameborder="0" allowfullscreen></iframe></div>` : '';
            
            let cleanContent = ytMatch ? p.content.replace(ytMatch[0], '').trim() : p.content;
            
            // Handle code blocks (simple markdown match)
            const codeMatches = cleanContent.match(/```([\s\S]*?)```/g);
            if (codeMatches) {
                codeMatches.forEach(block => {
                    const codeInner = block.replace(/```/g, '').trim();
                    const styledBlock = `<div class="mt-3 bg-[#0d1117] border border-line/10 rounded-xl p-4 overflow-x-auto custom-scrollbar"><pre><code class="text-[11px] text-green-400 font-mono tracking-tight">${codeInner.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre></div>`;
                    cleanContent = cleanContent.replace(block, styledBlock);
                });
            }

            // Convert newlines to br for non-code text (safely)
            cleanContent = cleanContent.replace(/\n(?!(?:(?!```)[\s\S])*```)/g, '<br>');

            return `<div class="flex items-start gap-4 p-5 bg-card/40 backdrop-blur-sm border border-line/5 rounded-3xl transition-colors hover:border-accent/30 hover:bg-card/60 shadow-lg" data-post-id="${p.id}">
                <div class="w-11 h-11 rounded-xl bg-app/60 border border-line/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-accent font-bold">${(p.author_name || '?')[0]}</div>
                <div class="flex-1 flex flex-col gap-3 min-w-0 text-left">
                    <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted">
                        <span class="text-accent font-black">${p.author_name || 'Anonymous'}</span>
                        ${p.status === 'pending' ? '<span class="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Pending</span>' : p.status === 'rejected' ? '<span class="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Rejected</span>' : ''}
                    </div>
                    <h4 class="text-sm font-bold text-main">${p.title}</h4>
                    <div class="text-sm text-main/90 leading-relaxed font-normal">${cleanContent}</div>
                    ${ytEmbed}
                    <div class="flex gap-1 pt-1 border-t border-line/5 mt-1">
                        <button class="btn-like px-3 py-1.5 text-[10px] ${p.user_liked ? 'text-pink-400' : 'text-muted'} font-bold hover:text-pink-400 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-line/5 cursor-pointer" data-post-id="${p.id}"><i class="fa-solid fa-heart"></i> <span class="like-count">${p.like_count || 0}</span></button>
                        <button class="btn-toggle-comments px-3 py-1.5 text-[10px] text-muted font-bold hover:text-accent transition-colors flex items-center gap-1.5 rounded-lg hover:bg-line/5 cursor-pointer" data-post-id="${p.id}"><i class="fa-solid fa-comment"></i> ${p.comment_count || 0}</button>
                    </div>
                    <div class="comments-section hidden border-t border-line/5 pt-3" id="comments-${p.id}">
                        <div class="comments-list space-y-3 mb-3" id="clist-${p.id}"></div>
                        <div class="flex gap-2">
                            <input class="comment-input flex-1 bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-xs text-main placeholder-muted focus:outline-none focus:border-accent transition-all" placeholder="Write a comment..." data-post-id="${p.id}"/>
                            <button class="btn-send-comment px-3 py-2 rounded-xl bg-accent text-white text-[10px] font-bold cursor-pointer" data-post-id="${p.id}">Send</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        document.querySelectorAll('.btn-like').forEach(b => b.addEventListener('click', async () => { try { const r = await feed.toggleLike(b.dataset.postId); b.querySelector('.like-count').textContent = r.like_count; b.classList.toggle('text-pink-400', r.liked); b.classList.toggle('text-muted', !r.liked); } catch (e) { console.error(e); } }));
        document.querySelectorAll('.btn-toggle-comments').forEach(b => b.addEventListener('click', async () => { const s = document.getElementById('comments-' + b.dataset.postId); s.classList.toggle('hidden'); if (!s.classList.contains('hidden')) await loadComments(b.dataset.postId); }));
        document.querySelectorAll('.btn-send-comment').forEach(b => b.addEventListener('click', async () => { const inp = document.querySelector(`.comment-input[data-post-id="${b.dataset.postId}"]`); const t = inp.value.trim(); if (!t) return; try { await feed.createComment(b.dataset.postId, t); inp.value = ''; await loadComments(b.dataset.postId); } catch (e) { console.error(e); } }));
        document.querySelectorAll('.comment-input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') document.querySelector(`.btn-send-comment[data-post-id="${i.dataset.postId}"]`).click(); }));
    } catch (e) { console.error(e); }
}

async function loadComments(pid) {
    try {
        const comments = await feed.listComments(pid);
        const list = document.getElementById('clist-' + pid);
        if (!comments.length) { list.innerHTML = '<p class="text-[10px] text-muted">No comments yet</p>'; return; }
        list.innerHTML = comments.map(c => `<div class="flex items-start gap-3"><div class="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[9px] text-accent font-bold flex-shrink-0">${(c.author_name || '?')[0]}</div><div><span class="text-xs font-bold text-main">${c.author_name}</span><p class="text-xs text-muted leading-relaxed">${c.content}</p></div></div>`).join('');
    } catch (e) { console.error(e); }
}

async function loadLeaderboardFromAPI() {
    try {
        const leaders = await gamification.userLeaderboard();
        const el = document.getElementById('leaderboard-list');
        if (!el) return;
        el.innerHTML = leaders.slice(0, 8).map((user, index) => {
            const maxXP = 5000;
            const progress = Math.min((user.expbara / maxXP) * 100, 100);
            const badges = ['<i class="fa-solid fa-crown text-amber-400"></i>', '<i class="fa-solid fa-medal text-muted"></i>', '<i class="fa-solid fa-medal text-amber-700"></i>'];
            return `<div class="flex items-center gap-4 p-4 rounded-2xl bg-card/60 border border-line/5 transition-all hover:scale-[1.02] shadow-lg cursor-pointer" onclick="window.location.hash='#user-profile/${user.id}'">
                <span class="font-black text-xl w-8 text-center">${badges[index] || '<span class="text-muted">' + (index + 1) + '</span>'}</span>
                <div class="w-11 h-11 rounded-full bg-app/40 flex items-center justify-center border-2 ${index === 0 ? 'border-amber-400' : 'border-line/10'} font-bold text-accent uppercase">${user.username.charAt(0)}</div>
                <div class="flex-1 min-w-0 text-left">
                  <div class="flex justify-between items-end mb-1">
                    <p class="text-xs font-black text-main uppercase truncate tracking-tighter">${user.username}</p>
                    <p class="text-[9px] font-black text-amber-500 uppercase">${user.expbara} XP</p>
                  </div>
                  <div class="h-1.5 w-full bg-app/50 rounded-full overflow-hidden p-[1px] border border-line/5">
                    <div class="h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-amber-500 to-yellow-300' : 'bg-accent'}" style="width: ${progress}%"></div>
                  </div>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error(e);
        const el = document.getElementById('leaderboard-list');
        if (el) el.innerHTML = '<p class="text-center text-[10px] text-red-500 font-black uppercase">Connection Lost</p>';
    }
}

function attachPostForm() {
    setTimeout(() => {
        const nb = document.getElementById('btn-new-post'), f = document.getElementById('new-post-form'), cb = document.getElementById('btn-cancel-post'), sb = document.getElementById('btn-submit-post');
        const contentInput = document.getElementById('post-content-input');
        
        // Composer Buttons
        const btnVideo = document.getElementById('btn-add-video');
        const btnCode = document.getElementById('btn-add-code');
        const videoArea = document.getElementById('video-input-area');
        const codeArea = document.getElementById('code-input-area');
        const btnInsertVid = document.getElementById('btn-insert-video');
        const btnInsertCode = document.getElementById('btn-insert-code');
        const ytInput = document.getElementById('youtube-url-input');
        const codeInput = document.getElementById('code-snippet-input');

        if (nb) nb.addEventListener('click', () => { f.classList.remove('hidden'); });
        if (cb) cb.addEventListener('click', () => { 
            f.classList.add('hidden'); 
            videoArea.classList.add('hidden');
            codeArea.classList.add('hidden');
        });

        if (btnVideo) btnVideo.addEventListener('click', () => { 
            videoArea.classList.toggle('hidden'); 
            codeArea.classList.add('hidden');
            if(!videoArea.classList.contains('hidden')) ytInput.focus();
        });
        
        if (btnCode) btnCode.addEventListener('click', () => { 
            codeArea.classList.toggle('hidden'); 
            videoArea.classList.add('hidden');
            if(!codeArea.classList.contains('hidden')) codeInput.focus();
        });

        if (btnInsertVid) btnInsertVid.addEventListener('click', () => {
            if(ytInput.value.trim()) {
                contentInput.value += `\n${ytInput.value.trim()}\n`;
                ytInput.value = '';
                videoArea.classList.add('hidden');
            }
        });

        if (btnInsertCode) btnInsertCode.addEventListener('click', () => {
            if(codeInput.value.trim()) {
                contentInput.value += `\n\`\`\`\n${codeInput.value.trim()}\n\`\`\`\n`;
                codeInput.value = '';
                codeArea.classList.add('hidden');
            }
        });

        if (sb) sb.addEventListener('click', async () => {
            sb.innerHTML = 'WAITING...';
            const title = document.getElementById('post-title-input').value.trim();
            const txt = contentInput.value.trim();
            if (!title || !txt) { sb.innerHTML = 'POST'; return; }
            try { 
                await feed.createPost({ title, content: txt, post_type: 'general' }); 
                f.classList.add('hidden'); 
                document.getElementById('post-title-input').value = ''; 
                contentInput.value = ''; 
                await loadPostsFromAPI(); 
            } catch (e) { 
                console.error(e); 
            } finally {
                sb.innerHTML = 'POST';
            }
        });
    }, 100);
}
