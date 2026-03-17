import { content, gamification, chat } from '../api/client.js';
import { getState, handleXPGain } from '../utils/state.js';

export function renderVideoPlayer(container, videoId) {
    if (!container || !videoId) return;

    container.innerHTML = `
    <div class="animate-system-boot h-full flex flex-col relative z-0 p-4 lg:p-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div class="mb-6 flex justify-between items-center">
            <button id="btn-back-video" class="px-4 py-2 bg-main/5 hover:bg-main/10 border border-line/10 rounded-xl text-[10px] font-bold text-muted hover:text-main uppercase tracking-widest transition-all flex items-center gap-2">
                <i class="fa-solid fa-arrow-left"></i> Back to Node
            </button>
            <div id="video-xp-badge" class="hidden px-4 py-2 bg-accent/20 border border-accent/40 rounded-xl text-accent text-[10px] font-black uppercase tracking-widest items-center gap-2 shadow-[0_0_15px_rgba(var(--rgb-accent),0.3)]">
                <i class="fa-solid fa-check-circle"></i> Completed
            </div>
        </div>

        <div id="video-content-area" class="flex-1 flex flex-col lg:flex-row gap-6">
            <div class="flex-1 flex flex-col items-center justify-center opacity-60 py-20">
                <img src="/assets/loading.gif" class="w-20 h-20" alt="Loading">
            </div>
        </div>
    </div>`;

    setTimeout(() => {
        document.getElementById('btn-back-video')?.addEventListener('click', () => {
            window.history.back();
        });
        loadVideoDetails(videoId);
    }, 50);
}

// Load YouTube IFrame API
function loadYTApi() {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) { resolve(); return; }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => resolve();
    });
}

async function loadVideoDetails(videoId) {
    const contentArea = document.getElementById('video-content-area');
    if (!contentArea) return;

    try {
        const v = await content.getVideo(videoId);
        const ytId = (v.youtube_url.match(/(?:v=|youtu\.be\/)([\w-]+)/) || [])[1] || '';
        const quizOptions = v.quiz_options || [];
        const hasQuiz = !!v.quiz_question && quizOptions.length > 0;
        const durationSec = (v.duration_minutes || 10) * 60;
        const alreadyCompleted = v.user_progress && v.user_progress.status === 'completed';

        contentArea.innerHTML = `
            <div class="flex-1 flex flex-col gap-6">
                <!-- Video Player Container -->
                <div class="bg-black rounded-3xl overflow-hidden shadow-2xl border border-line/10 relative" style="padding-top: 56.25%;">
                    <div id="yt-player" class="absolute inset-0 w-full h-full"></div>
                </div>

                <!-- Watch Progress -->
                <div id="watch-progress-bar" class="bg-card/40 border border-line/10 rounded-2xl p-4 ${alreadyCompleted ? 'hidden' : ''}">
                    <div class="flex justify-between text-[10px] font-bold text-muted uppercase tracking-widest mb-2">
                        <span><i class="fa-solid fa-eye text-blue-400 mr-1"></i> Watch Progress</span>
                        <span id="watch-time-label">0:00 / ${v.duration_minutes || 10}:00</span>
                    </div>
                    <div class="h-2 w-full bg-app/80 rounded-full border border-line/10 overflow-hidden">
                        <div id="watch-progress" class="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>

                <!-- Video Metadata -->
                <div class="bg-card/40 backdrop-blur-xl border border-line/10 rounded-3xl p-6 lg:p-8">
                    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h1 class="text-2xl lg:text-3xl font-black text-main uppercase tracking-tight">${v.title}</h1>
                        <span class="px-3 py-1 bg-main/5 border border-line/10 rounded-lg text-[10px] font-bold text-muted uppercase tracking-widest">${v.duration_minutes || 10} min</span>
                    </div>
                    <p class="text-sm text-muted mb-6 leading-relaxed">${v.description || 'No description available for this video.'}</p>

                    <button id="btn-complete-video" ${alreadyCompleted ? '' : 'disabled'} class="w-full lg:w-auto px-8 py-4 ${alreadyCompleted ? 'bg-emerald-500' : 'bg-zinc-700 cursor-not-allowed'} text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(var(--rgb-accent),0.3)] flex items-center justify-center gap-3">
                        <i class="fa-solid fa-${alreadyCompleted ? 'check-double' : 'lock'}"></i> ${alreadyCompleted ? 'Already Completed' : 'Watch video to unlock (+50 XP)'}
                    </button>
                </div>
            </div>

            <!-- Sidebar: Quiz and Tutor -->
            <div class="w-full lg:w-96 flex flex-col gap-6 shrink-0">
                ${hasQuiz ? `
                <div class="bg-card/40 backdrop-blur-xl border border-line/10 rounded-3xl p-6 relative overflow-hidden flex flex-col">
                    <div class="absolute -right-10 -top-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[40px]"></div>
                    <h3 class="text-xs font-black text-main uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
                        <i class="fa-solid fa-brain text-fuchsia-400"></i> Pop Quiz
                    </h3>
                    <p class="text-sm text-main font-medium mb-6 relative z-10">${v.quiz_question}</p>

                    <div class="mt-auto relative z-10 space-y-3">
                        <div id="quiz-options" class="space-y-2">
                            ${quizOptions.map((opt, i) => `
                            <label class="flex items-center gap-3 p-3 rounded-xl bg-main/[0.03] border border-line/10 hover:bg-main/[0.06] hover:border-fuchsia-500/30 transition-all cursor-pointer group">
                                <input type="radio" name="quiz-option" value="${i}" class="w-4 h-4 accent-fuchsia-500">
                                <span class="text-xs text-muted group-hover:text-main transition-colors">${opt}</span>
                            </label>
                            `).join('')}
                        </div>
                        <button id="btn-submit-quiz" class="w-full py-3 bg-fuchsia-500/20 hover:bg-fuchsia-500 text-fuchsia-300 hover:text-white border border-fuchsia-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Submit for +25 XP
                        </button>
                        <p id="quiz-msg" class="text-[10px] font-bold text-center hidden mt-2"></p>
                    </div>
                </div>` : ''}

                <!-- CapybaraTutor AI Chat -->
                <div class="bg-card/40 backdrop-blur-xl border border-line/10 rounded-3xl p-6 flex flex-col flex-1 min-h-[300px]">
                    <h3 class="text-xs font-black text-main uppercase tracking-widest flex items-center gap-2 mb-4">
                        <i class="fa-solid fa-robot text-blue-400"></i> CapybaraTutor AI
                    </h3>
                    <div id="ai-chat-messages" class="flex-1 rounded-2xl bg-card/40 border border-line/5 p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar mb-4 min-h-[200px]">
                        <div class="flex items-start gap-2">
                            <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><i class="fa-solid fa-robot text-blue-400 text-[9px]"></i></div>
                            <p class="text-xs text-muted leading-relaxed">Hi! I'm your AI tutor. Ask me anything about <span class="text-blue-400 font-bold">${v.title}</span>.</p>
                        </div>
                    </div>
                    <div class="relative flex gap-2">
                        <input id="ai-chat-input" type="text" placeholder="Ask about this video..." class="flex-1 bg-main/5 border border-line/10 rounded-xl px-4 py-3 text-xs text-main placeholder-muted focus:border-blue-500/50 outline-none">
                        <button id="ai-chat-send" class="w-10 h-10 shrink-0 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl transition-all cursor-pointer">
                            <i class="fa-solid fa-paper-plane text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // YouTube IFrame API - watch time tracking
        let watchedSeconds = 0;
        let watchInterval = null;

        if (!alreadyCompleted) {
            try {
                await loadYTApi();
                new YT.Player('yt-player', {
                    videoId: ytId,
                    playerVars: { rel: 0, modestbranding: 1, controls: 1 },
                    events: {
                        onStateChange: (event) => {
                            if (event.data === YT.PlayerState.PLAYING) {
                                if (!watchInterval) {
                                    watchInterval = setInterval(() => {
                                        watchedSeconds++;
                                        updateWatchProgress(watchedSeconds, durationSec, v);
                                    }, 1000);
                                }
                            } else {
                                if (watchInterval) { clearInterval(watchInterval); watchInterval = null; }
                            }
                        }
                    }
                });
            } catch (e) {
                console.error('YT API load failed, falling back to iframe', e);
                const playerDiv = document.getElementById('yt-player');
                if (playerDiv) {
                    playerDiv.outerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&controls=1" class="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                }
            }
        } else {
            const playerDiv = document.getElementById('yt-player');
            if (playerDiv) {
                playerDiv.outerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&controls=1" class="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }
            const badge = document.getElementById('video-xp-badge');
            if (badge) { badge.classList.replace('hidden', 'flex'); }
        }

        // Complete video button
        const btnComplete = document.getElementById('btn-complete-video');
        if (btnComplete && !alreadyCompleted) {
            btnComplete.addEventListener('click', async () => {
                if (btnComplete.disabled) return;
                const prevHtml = btnComplete.innerHTML;
                btnComplete.innerHTML = '<img src="/assets/loading.gif" class="w-5 h-5 inline mr-1" alt="Loading"> Processing...';
                try {
                    await content.startVideo(v.id);
                    const result = await content.completeVideo(v.id);
                    btnComplete.className = 'w-full lg:w-auto px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3';
                    btnComplete.innerHTML = '<i class="fa-solid fa-check-double"></i> Verified +50 XP';
                    btnComplete.disabled = true;

                    const badge = document.getElementById('video-xp-badge');
                    if (badge) { badge.classList.replace('hidden', 'flex'); badge.innerHTML = '+50 XP Earned!'; }

                    await handleXPGain(result);
                } catch (e) {
                    console.error(e);
                    btnComplete.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + (e.message || 'Error');
                    setTimeout(() => { btnComplete.innerHTML = prevHtml; }, 2000);
                }
            });
        }

        // Quiz
        const btnQuiz = document.getElementById('btn-submit-quiz');
        if (btnQuiz) {
            btnQuiz.addEventListener('click', async () => {
                const selected = document.querySelector('input[name="quiz-option"]:checked');
                const msgEl = document.getElementById('quiz-msg');
                if (!selected) {
                    msgEl.textContent = 'Please select an option';
                    msgEl.className = 'text-[10px] font-bold text-center mt-2 text-amber-400 block';
                    return;
                }

                const selectedIndex = parseInt(selected.value, 10);
                const prevHtml = btnQuiz.innerHTML;
                btnQuiz.innerHTML = '<img src="/assets/loading.gif" class="w-5 h-5 inline" alt="Loading">';
                btnQuiz.disabled = true;

                try {
                    const result = await content.verifyQuiz(v.id, selectedIndex);
                    if (result.correct) {
                        msgEl.textContent = `Correct! +${result.xp_gained || 25} XP`;
                        msgEl.className = 'text-[10px] font-bold text-center mt-2 text-emerald-400 block';
                        btnQuiz.classList.replace('bg-fuchsia-500/20', 'bg-emerald-500/20');
                        btnQuiz.classList.replace('text-fuchsia-300', 'text-emerald-400');
                        btnQuiz.innerHTML = '<i class="fa-solid fa-check"></i> Passed';
                        document.querySelectorAll('input[name="quiz-option"]').forEach(r => r.disabled = true);

                        await handleXPGain(result);
                    } else {
                        msgEl.textContent = 'Incorrect! Try again.';
                        msgEl.className = 'text-[10px] font-bold text-center mt-2 text-red-400 block';
                        setTimeout(() => {
                            btnQuiz.disabled = false;
                            btnQuiz.innerHTML = prevHtml;
                            msgEl.classList.add('hidden');
                        }, 2000);
                    }
                } catch (e) {
                    msgEl.textContent = e.message || 'Error submitting quiz';
                    msgEl.className = 'text-[10px] font-bold text-center mt-2 text-red-400 block';
                    setTimeout(() => {
                        btnQuiz.disabled = false;
                        btnQuiz.innerHTML = prevHtml;
                    }, 2000);
                }
            });
        }

        // AI Tutor Chat
        initAIChat(v.title);

    } catch (e) {
        console.error(e);
        contentArea.innerHTML = `
            <div class="flex-1 bg-card/40 border border-line/10 rounded-[2.5rem] p-8 text-center shadow-xl flex flex-col items-center justify-center">
                <i class="fa-solid fa-video-slash text-red-400 text-4xl mb-4"></i>
                <h2 class="text-xl font-black text-main uppercase tracking-widest">Video Not Found</h2>
                <p class="text-muted mt-2 text-sm">We couldn't load the requested video details.</p>
            </div>
        `;
    }
}

function updateWatchProgress(watched, total, video) {
    const pct = Math.min(100, (watched / total) * 100);
    const bar = document.getElementById('watch-progress');
    const label = document.getElementById('watch-time-label');
    const btn = document.getElementById('btn-complete-video');

    if (bar) bar.style.width = pct + '%';
    if (label) {
        const wMin = Math.floor(watched / 60);
        const wSec = watched % 60;
        const tMin = Math.floor(total / 60);
        label.textContent = `${wMin}:${String(wSec).padStart(2, '0')} / ${tMin}:00`;
    }

    // Unlock at 80%
    if (pct >= 80 && btn && btn.disabled) {
        btn.disabled = false;
        btn.className = 'w-full lg:w-auto px-8 py-4 bg-accent hover:bg-accent/80 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(var(--rgb-accent),0.3)] flex items-center justify-center gap-3';
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Mark as Completed (+50 XP)';

        const progressBar = document.getElementById('watch-progress-bar');
        if (progressBar) {
            progressBar.querySelector('#watch-progress').className = 'h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500';
        }
    }
}

function initAIChat(videoTitle) {
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    const messagesEl = document.getElementById('ai-chat-messages');
    if (!input || !sendBtn || !messagesEl) return;

    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        // Append user message
        messagesEl.innerHTML += `
            <div class="flex items-start gap-2 justify-end">
                <p class="text-xs text-main leading-relaxed bg-main/5 border border-line/10 rounded-xl px-3 py-2 max-w-[85%]">${text}</p>
            </div>`;
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        messagesEl.innerHTML += `
            <div id="${typingId}" class="flex items-start gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><i class="fa-solid fa-robot text-blue-400 text-[9px]"></i></div>
                <p class="text-xs text-muted flex items-center gap-1"><img src="/assets/loading.gif" class="w-4 h-4 inline" alt=""> Thinking...</p>
            </div>`;
        messagesEl.scrollTop = messagesEl.scrollHeight;

        try {
            const contextMsg = `[Video: "${videoTitle}"] ${text}`;
            const result = await chat.send(contextMsg);
            const reply = result.reply || 'No response received.';

            const typingEl = document.getElementById(typingId);
            if (typingEl) {
                typingEl.innerHTML = `
                    <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><i class="fa-solid fa-robot text-blue-400 text-[9px]"></i></div>
                    <p class="text-xs text-muted leading-relaxed max-w-[85%]">${reply}</p>`;
            }
        } catch (e) {
            const typingEl = document.getElementById(typingId);
            if (typingEl) {
                typingEl.innerHTML = `
                    <div class="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0"><i class="fa-solid fa-robot text-red-400 text-[9px]"></i></div>
                    <p class="text-xs text-red-400 leading-relaxed">${e.message || 'Failed to get response'}</p>`;
            }
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
}
