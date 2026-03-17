// src/features/services/ai/tutor.js
import { chat } from '../../../api/client.js';
import { getState } from '../../../utils/state.js';

export function renderTutorIA() {
  const container = document.getElementById('ai-panel-container');
  if (!container) return;

  const { user } = getState();
  const session = user || { username: 'Explorer', id: 'guest' };
  const firstName = session.username.split(' ')[0].toUpperCase();

  container.innerHTML = /* html */`
    <div class="p-6 border-b border-line/10">
      <div class="flex items-center gap-2 mb-1">
        <span class="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(217,70,239,0.5)]"></span>
        <p class="text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest">Lummia Neural Net</p>
      </div>
      <h2 class="text-lg font-black text-main tracking-tight">Capybara Tutor</h2>
    </div>

    <div id="ai-chat-messages" class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      <div class="flex gap-3">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex-shrink-0 flex items-center justify-center shadow-lg border border-line/10">
          <img src="/assets/completedCapi.png" class="w-5 h-5 rounded" alt=""/>
        </div>
        <div class="bg-main/[0.03] backdrop-blur-md border border-line/10 rounded-2xl rounded-tl-sm p-4 text-sm text-main/80 font-medium leading-relaxed">
          Hello ${firstName}! Neural link is online. What code mission can I help with today?
        </div>
      </div>
    </div>

    <div class="p-6 border-t border-line/10 bg-card/40">
      <div class="relative flex items-center group">
        <input type="text" id="tutor-input" placeholder="Type your command, ${firstName}..."
               class="w-full bg-main/[0.02] border border-line/10 rounded-xl py-3 pl-4 pr-12 text-sm text-main placeholder-muted focus:outline-none focus:border-fuchsia-500/50 focus:bg-main/[0.05] transition-all">
        <button id="tutor-send" class="absolute right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-main/5 text-muted hover:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-colors cursor-pointer">
          <i class="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </div>
    </div>
  `;
}

export function initTutorLogic() {
  const input = document.getElementById('tutor-input');
  const sendBtn = document.getElementById('tutor-send');
  const chatBox = document.getElementById('ai-chat-messages');
  if (!input || !sendBtn || !chatBox) return;

  const { user } = getState();
  const session = user || { username: 'EX', id: null };
  const userInitials = session.username.substring(0, 2).toUpperCase();

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    chatBox.insertAdjacentHTML('beforeend', `
      <div class="flex gap-3 justify-end mt-4">
        <div class="bg-fuchsia-500/10 border border-fuchsia-500/30 backdrop-blur-md rounded-2xl rounded-tr-sm p-4 text-sm text-main font-medium max-w-[80%]">${text}</div>
        <div class="w-8 h-8 rounded-xl bg-card/60 border border-line/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-main uppercase">${userInitials}</div>
      </div>
    `);
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    const loadId = 'load-' + Date.now();
    chatBox.insertAdjacentHTML('beforeend', `
      <div id="${loadId}" class="flex gap-3 mt-4">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex-shrink-0 flex items-center justify-center shadow-lg border border-line/10">
          <img src="/assets/completedCapi.png" class="w-5 h-5 rounded" alt=""/>
        </div>
        <div class="bg-main/[0.03] border border-line/10 rounded-2xl rounded-tl-sm p-4 text-sm text-muted flex items-center gap-2"><img src="/assets/loading.gif" class="w-5 h-5" alt="Loading"> Processing...</div>
      </div>
    `);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const data = await chat.send(text);
      const el = document.getElementById(loadId);
      if (el) {
        el.querySelector('div:last-child').className = 'bg-main/[0.03] backdrop-blur-md border border-line/10 rounded-2xl rounded-tl-sm p-4 text-sm text-main/80 font-medium leading-relaxed';
        el.querySelector('div:last-child').textContent = data.reply;
      }
    } catch (e) {
      const el = document.getElementById(loadId);
      if (el) {
        el.querySelector('div:last-child').className = 'bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-sm text-red-400';
        el.querySelector('div:last-child').textContent = 'Neural link failed: ' + e.message;
      }
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
}
