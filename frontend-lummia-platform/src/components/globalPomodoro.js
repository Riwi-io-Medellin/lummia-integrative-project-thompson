export function injectGlobalPomodoroUI() {
   if (document.getElementById('global-pomodoro-wrapper')) return;

   const style = document.createElement('style');
   style.innerHTML = `
    @keyframes pulse-fuchsia {
      0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(217,70,239,0.2); }
      50% { opacity: 1; box-shadow: 0 0 40px rgba(217,70,239,0.5); }
    }
    .hide-spinner::-webkit-inner-spin-button,
    .hide-spinner::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .hide-spinner {
      -moz-appearance: textfield;
    }
  `;
   document.head.appendChild(style);

   const wrapper = document.createElement('div');
   wrapper.id = 'global-pomodoro-wrapper';
   wrapper.innerHTML = /* html */`
    <button id="open-pomodoro-btn" class="fixed bottom-8 right-8 z-[55] h-12 px-5 bg-card/90 backdrop-blur-xl rounded-2xl border border-line/10 shadow-theme flex items-center justify-center gap-3 group hover:border-fuchsia-500/30 hover:bg-card transition-all duration-300 cursor-pointer">
       <i class="fa-solid fa-stopwatch text-fuchsia-400 text-lg drop-shadow-[0_0_10px_rgba(217,70,239,0.8)] group-hover:rotate-12 transition-transform"></i>
       <span id="global-fab-time" class="text-fuchsia-300 font-black text-sm tracking-widest tabular-nums drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">25:00</span>
    </button>

    <div id="pomodoro-modal" class="hidden fixed inset-0 z-[200] items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
       <div class="bg-card border border-line/10 w-full max-w-[380px] rounded-[2.5rem] overflow-hidden shadow-theme relative animate-in zoom-in-95 duration-500">
          
          <button id="close-pomodoro-modal" class="absolute top-6 right-6 text-muted hover:text-main transition-colors z-10">
             <i class="fa-solid fa-xmark text-xl pointer-events-none"></i>
          </button>

          <div class="p-8 flex flex-col items-center">
             
             <div class="flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 mb-8 mt-2">
                <div class="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></div>
                <span id="pomo-status-text" class="text-[9px] font-black text-fuchsia-300 tracking-widest uppercase">Focus Phase</span>
             </div>

             <div class="relative w-56 h-56 flex items-center justify-center mb-6 bg-app/60 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]">
                <svg class="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(217,70,239,0.4)]">
                   <circle cx="112" cy="112" r="106" stroke="currentColor" stroke-width="3" fill="transparent" class="text-line/10"></circle>
                   <circle id="global-timer-ring" cx="112" cy="112" r="106" stroke="currentColor" stroke-width="6" fill="transparent" stroke-linecap="round" stroke-dasharray="666" stroke-dashoffset="0" class="text-fuchsia-500 transition-all duration-1000"></circle>
                </svg>
                
                <div class="relative z-10 flex flex-col items-center">
                   <span id="pomo-timer-display" class="text-6xl font-black text-main tracking-tighter tabular-nums mt-2">25:00</span>
                   <span class="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Minutes</span>
                </div>
             </div>

             <div class="flex items-center justify-center gap-3 mb-6 w-full px-2">
                <div class="relative flex-1 flex items-center bg-app/50 border border-line/10 rounded-xl p-1 focus-within:border-fuchsia-500/50 transition-colors">
                   <button class="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-main hover:bg-line/10 transition-colors pomo-minus-btn" data-target="global-custom-time">
                      <i class="fa-solid fa-minus text-xs pointer-events-none"></i>
                   </button>
                   <input type="number" id="global-custom-time" min="1" max="300" value="25" class="bg-transparent text-main font-black text-lg w-full outline-none text-center tabular-nums hide-spinner">
                   <button class="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-main hover:bg-line/10 transition-colors pomo-plus-btn" data-target="global-custom-time">
                      <i class="fa-solid fa-plus text-xs pointer-events-none"></i>
                   </button>
                </div>
                <button id="global-apply-time" class="h-10 px-5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold tracking-widest hover:bg-fuchsia-500 hover:text-white transition-colors">
                   APPLY
                </button>
             </div>

             <div class="text-[10px] font-bold text-muted uppercase tracking-widest mb-8 flex items-center gap-2">
                Reward: <span id="global-pomo-reward" class="text-amber-400 font-black">+50 XP</span>
             </div>

             <div class="flex items-center gap-4 w-full">
                <button id="pomo-reset" class="w-14 h-14 shrink-0 rounded-2xl bg-app/50 border border-line/10 hover:bg-line/10 flex items-center justify-center text-muted hover:text-main transition-all">
                   <i class="fa-solid fa-rotate-right text-lg pointer-events-none"></i>
                </button>
                <button id="pomo-play-pause" class="flex-1 h-14 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 flex items-center justify-center text-white text-lg font-black tracking-widest shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all">
                   <i class="fa-solid fa-play pointer-events-none"></i>
                </button>
             </div>

          </div>
       </div>
    </div>
  `;
   document.body.appendChild(wrapper);
}