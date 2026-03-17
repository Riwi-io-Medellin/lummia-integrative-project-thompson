export function renderPomodoro() {
  return /* html */`
    <div class="animate-system-boot h-full flex flex-col relative z-0 p-4 lg:p-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
         <div>
            <h1 class="text-4xl font-black text-main tracking-tighter uppercase mb-2">Focus Hub</h1>
            <p class="text-muted text-sm font-medium">Manage your energy, complete tasks, and earn experience points.</p>
         </div>
         <div class="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <i class="fa-solid fa-bolt text-amber-500 animate-pulse"></i>
            <span class="text-xs font-black text-amber-400 uppercase tracking-widest">Rate: 2 XP / Min</span>
         </div>
      </div>

      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
         
         <div class="lg:col-span-5 flex flex-col justify-center min-h-0">
            <div class="bg-card/40 backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
               <div class="absolute -top-20 -left-20 w-60 h-60 bg-fuchsia-600/10 rounded-full blur-[60px]"></div>
               
               <div class="flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 mb-10 relative z-10">
                  <div id="status-dot" class="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></div>
                  <span id="pomodoro-status" class="text-[9px] font-black text-fuchsia-400 tracking-widest uppercase">Focus Phase</span>
               </div>

               <div id="pomodoro-ring" class="relative w-64 h-64 rounded-full border-[6px] border-line/10 flex items-center justify-center mb-10 before:absolute before:-inset-[6px] before:rounded-full before:border-[6px] before:border-transparent before:border-t-fuchsia-500 before:transition-all before:duration-1000 z-10">
                  <div class="text-center">
                     <div id="time-display" class="text-7xl font-black text-main tracking-tighter tabular-nums drop-shadow-lg">25:00</div>
                     <div class="text-[10px] text-muted font-bold uppercase tracking-widest mt-2">Minutes</div>
                  </div>
               </div>

               <div class="flex items-center justify-center gap-3 mb-8 w-full relative z-10">
                  <div class="relative flex-1 flex items-center bg-main/5 border border-line/10 rounded-xl p-1 focus-within:border-fuchsia-500/50 transition-colors">
                     <button class="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-main hover:bg-main/10 transition-colors pomo-minus-btn" data-target="main-custom-time">
                        <i class="fa-solid fa-minus text-sm pointer-events-none"></i>
                     </button>
                     <input type="number" id="main-custom-time" min="1" max="300" value="25" class="bg-transparent text-main font-black text-2xl w-full outline-none text-center tabular-nums hide-spinner">
                     <button class="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-main hover:bg-main/10 transition-colors pomo-plus-btn" data-target="main-custom-time">
                        <i class="fa-solid fa-plus text-sm pointer-events-none"></i>
                     </button>
                  </div>
                  <button id="main-apply-time" class="h-12 px-6 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold tracking-widest hover:bg-fuchsia-500 hover:text-white transition-colors">
                     APPLY
                  </button>
               </div>

               <div class="text-[11px] font-bold text-muted uppercase tracking-widest mb-8 relative z-10">
                  Potential Reward: <span id="reward-display" class="text-amber-400 font-black text-sm ml-1">+50 XP</span>
               </div>

               <div class="flex gap-4 w-full relative z-10">
                  <button id="reset-timer-btn" class="w-16 h-14 rounded-2xl bg-main/5 border border-line/10 hover:bg-main/10 flex items-center justify-center text-muted hover:text-main transition-all">
                     <i class="fa-solid fa-rotate-right text-lg pointer-events-none"></i>
                  </button>
                  <button id="start-timer-btn" class="flex-1 h-14 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 flex items-center justify-center text-white text-sm font-black tracking-widest shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all uppercase">
                     Start Focus
                  </button>
               </div>
            </div>
         </div>

         <div class="lg:col-span-7 flex flex-col min-h-0">
            <div class="bg-card/40 backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-8 flex-1 flex flex-col shadow-2xl overflow-hidden min-h-0">
               
               <div class="flex items-center justify-between mb-6 shrink-0">
                  <h3 class="text-xs font-black text-main uppercase tracking-[0.2em] flex items-center gap-3">
                     <i class="fa-solid fa-list-check text-fuchsia-500"></i> Objective Tracker
                  </h3>
                  <div class="flex gap-2">
                     <button id="clear-all-tasks" class="px-4 py-2 bg-main/5 hover:bg-main/10 rounded-xl border border-line/10 text-[9px] font-bold text-muted hover:text-main uppercase tracking-widest transition-colors">Clear Status</button>
                     <button id="delete-all-tasks" class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">Delete All</button>
                  </div>
               </div>
               
               <div class="flex-1 overflow-auto custom-scrollbar pr-2 relative">
                  <table class="w-full text-left border-collapse min-w-[600px]">
                     <thead class="sticky top-0 z-20 bg-card/95 backdrop-blur-md shadow-sm">
                        <tr class="border-b border-line/10">
                           <th class="py-4 px-4 text-[9px] font-black text-muted uppercase tracking-widest w-full border-r border-line/5">Task Description</th>
                           ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `<th class="py-4 px-3 text-center text-[9px] font-black text-muted uppercase tracking-widest border-r border-line/5 w-14">${day}</th>`).join('')}
                           <th class="py-4 px-3 text-center text-[9px] font-black text-muted uppercase tracking-widest w-12"><i class="fa-solid fa-trash"></i></th>
                        </tr>
                     </thead>
                     <tbody id="task-table-body">
                        </tbody>
                  </table>
               </div>
               
               <button id="add-task-btn" class="w-full mt-6 shrink-0 py-4 rounded-xl border border-dashed border-line/20 hover:border-fuchsia-500/50 bg-main/[0.02] hover:bg-fuchsia-500/5 text-[10px] font-black text-muted hover:text-fuchsia-400 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                  <i class="fa-solid fa-plus pointer-events-none"></i> Add New Objective
               </button>
            </div>
         </div>
      </div>
    </div>
  `;
}