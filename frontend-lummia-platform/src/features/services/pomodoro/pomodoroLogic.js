import { focusHub } from '../../../api/client.js';
import { getState, handleXPGain } from '../../../utils/state.js';
// Shared State Engine
let timerInterval = null;
let isRunning = false;
let isWorkPhase = true;
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let currentXP = 50;
let timeLeft = workDuration;

const circumference = 666;

function calculateXP(minutes) {
    return Math.floor(minutes * 2);
}

function syncAllUI() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    const formattedTime = `${minutes}:${seconds}`;

    // Main Page Sync
    const displayEl = document.getElementById('time-display');
    if (displayEl) displayEl.textContent = formattedTime;

    const ring = document.getElementById('pomodoro-ring');
    const statusText = document.getElementById('pomodoro-status');
    const statusDot = document.getElementById('status-dot');

    if (ring && statusText && statusDot) {
        if (isWorkPhase) {
            statusText.textContent = "Focus Phase";
            statusText.className = "text-[10px] font-black text-fuchsia-400 uppercase tracking-widest";
            statusDot.className = "w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse";
            ring.classList.add('before:border-t-fuchsia-500');
            ring.classList.remove('before:border-t-emerald-500');
        } else {
            statusText.textContent = "Break Phase";
            statusText.className = "text-[10px] font-black text-emerald-400 uppercase tracking-widest";
            statusDot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
            ring.classList.remove('before:border-t-fuchsia-500');
            ring.classList.add('before:border-t-emerald-500');
        }
    }

    const startE = document.getElementById('start-timer-btn');
    if (startE) {
        startE.innerHTML = isRunning ? "PAUSE FOCUS" : "START FOCUS";
        startE.className = `flex-1 h-14 rounded-2xl text-white text-sm font-black tracking-widest uppercase transition-all ${isRunning ? 'bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'bg-fuchsia-600 shadow-[0_0_20px_rgba(217,70,239,0.3)]'}`;
    }

    // Global Modal Sync
    const globalDisplay = document.getElementById('pomo-timer-display');
    if (globalDisplay) globalDisplay.textContent = formattedTime;

    const globalStatusText = document.getElementById('pomo-status-text');
    if (globalStatusText) {
        globalStatusText.textContent = isWorkPhase ? "Focus Phase" : "Break Phase";
        globalStatusText.className = isWorkPhase 
            ? "text-[9px] font-black text-fuchsia-300 uppercase tracking-widest"
            : "text-[9px] font-black text-emerald-300 uppercase tracking-widest";
    }

    const globalPlayBtn = document.getElementById('pomo-play-pause');
    if (globalPlayBtn) {
        globalPlayBtn.innerHTML = isRunning ? '<i class="fa-solid fa-pause pointer-events-none"></i>' : '<i class="fa-solid fa-play pointer-events-none"></i>';
    }

    const globalRing = document.getElementById('global-timer-ring');
    if (globalRing) {
        const totalDuration = isWorkPhase ? workDuration : breakDuration;
        const offset = circumference - (circumference * (timeLeft / totalDuration));
        globalRing.style.strokeDashoffset = offset;
    }

    // NEW: Sync the small text inside the floating action button
    const fabTimeDisplay = document.getElementById('global-fab-time');
    if (fabTimeDisplay) {
        fabTimeDisplay.textContent = formattedTime;
        // Optional: Change color to emerald if on break
        fabTimeDisplay.className = isWorkPhase 
            ? "text-fuchsia-300 font-black text-sm tracking-widest tabular-nums drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]"
            : "text-emerald-300 font-black text-sm tracking-widest tabular-nums drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]";
        
        // Change the icon color to match
        const fabIcon = document.querySelector('#open-pomodoro-btn i');
        if (fabIcon) {
            fabIcon.className = isWorkPhase
                ? "fa-solid fa-stopwatch text-fuchsia-400 text-lg drop-shadow-[0_0_10px_rgba(217,70,239,0.8)] group-hover:rotate-12 transition-transform"
                : "fa-solid fa-stopwatch text-emerald-400 text-lg drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] group-hover:rotate-12 transition-transform";
        }
    }
}

function toggleSharedTimer() {
    if (isRunning) { 
        clearInterval(timerInterval); 
        isRunning = false; 
    } else {
        isRunning = true;
        timerInterval = setInterval(() => {
            if (document.hidden) return; // AFK Protection

            if (timeLeft > 0) { 
                timeLeft--; 
                syncAllUI(); 
            } else {
                clearInterval(timerInterval); 
                isRunning = false;
                if (isWorkPhase) {
                    focusHub.complete(workDuration / 60).then(result => handleXPGain(result)).catch(console.error);
                }
                alert(isWorkPhase ? `Focus complete! +${currentXP} XP Earned!` : "Break over! Ready to focus?");
                isWorkPhase = !isWorkPhase;
                timeLeft = isWorkPhase ? workDuration : breakDuration;
                syncAllUI(); 
            }
        }, 1000);
    }
    syncAllUI();
}

function resetSharedTimer() {
    clearInterval(timerInterval); 
    isRunning = false; 
    isWorkPhase = true;
    timeLeft = workDuration; 
    syncAllUI(); 
}

function attachSpinnerLogic() {
    document.querySelectorAll('.pomo-minus-btn, .pomo-plus-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);
        
        newBtn.addEventListener('click', (e) => {
            if (isRunning) return; 
            
            const targetId = newBtn.getAttribute('data-target');
            const inputEl = document.getElementById(targetId);
            if (!inputEl) return;

            let val = parseInt(inputEl.value) || 1;
            if (newBtn.classList.contains('pomo-minus-btn')) {
                val = Math.max(1, val - 1);
            } else {
                val = Math.min(300, val + 1);
            }
            inputEl.value = val;
        });
    });
}

function applyCustomTime(inputId, rewardId) {
    if (isRunning) {
        alert("Please pause the timer before changing the time.");
        return;
    }

    const inputEl = document.getElementById(inputId);
    const rewardEl = document.getElementById(rewardId);
    if (!inputEl) return;

    let mins = parseInt(inputEl.value);
    if (isNaN(mins) || mins < 1) mins = 1;
    if (mins > 300) mins = 300; 
    
    inputEl.value = mins; 

    workDuration = mins * 60;
    currentXP = calculateXP(mins);
    timeLeft = workDuration;
    isWorkPhase = true;
    
    if (rewardEl) rewardEl.textContent = `+${currentXP} XP`;
    syncAllUI();
}

// 1. GLOBAL UI INITIALIZER
export function initGlobalPomodoroLogic() {
    const modal = document.getElementById('pomodoro-modal');
    const openBtn = document.getElementById('open-pomodoro-btn');
    const closeBtn = document.getElementById('close-pomodoro-modal');
    const globalPlayBtn = document.getElementById('pomo-play-pause');
    const globalResetBtn = document.getElementById('pomo-reset');
    const applyTimeBtn = document.getElementById('global-apply-time');

    if (!modal || !openBtn) return;

    openBtn.onclick = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    closeBtn.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    if (globalPlayBtn) globalPlayBtn.onclick = toggleSharedTimer;
    if (globalResetBtn) globalResetBtn.onclick = resetSharedTimer;

    attachSpinnerLogic();

    if (applyTimeBtn) {
        applyTimeBtn.addEventListener('click', () => {
            applyCustomTime('global-custom-time', 'global-pomo-reward');
        });
    }

    syncAllUI();
}

// 2. MAIN PAGE INITIALIZER
export function initPomodoroLogic() {
    const currentState = getState() || {}; 
    const currentUser = currentState.user || { name: 'guest' };
    const userKey = `pomodoro_tasks_${currentUser.name}`;

    const timeDisplay = document.getElementById('time-display');
    const startBtn = document.getElementById('start-timer-btn');
    const resetBtn = document.getElementById('reset-timer-btn');
    const applyTimeBtn = document.getElementById('main-apply-time');
    
    const taskTableBody = document.getElementById('task-table-body');
    const addTaskBtn = document.getElementById('add-task-btn');
    const clearAllBtn = document.getElementById('clear-all-tasks');
    const deleteAllBtn = document.getElementById('delete-all-tasks');

    if (!timeDisplay || !taskTableBody) return;

    attachSpinnerLogic();

    if (applyTimeBtn) {
        applyTimeBtn.addEventListener('click', () => {
            applyCustomTime('main-custom-time', 'reward-display');
        });
    }

    const getBtnClass = (state) => {
        if (state === 'done') return 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
        if (state === 'missed') return 'bg-red-500/10 border border-red-500/30 text-red-400';
        return 'text-muted/60 hover:bg-main/5';
    };

    const getIcon = (state) => {
        if (state === 'done') return 'fa-check';
        if (state === 'missed') return 'fa-xmark';
        return 'fa-minus';
    };

    const createRowHTML = (id = null, text = '', states = Array(7).fill('empty')) => {
        return `
        <tr class="border-b border-line/10 hover:bg-main/[0.02] transition-colors group animate-fade-in" data-id="${id || ''}">
           <td class="p-0 border-r border-line/10 relative">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-focus-within:bg-fuchsia-500 transition-colors"></div>
              <input type="text" value="${text}" placeholder="Type an objective..." class="w-full h-12 bg-transparent text-main font-medium px-4 focus:outline-none focus:bg-main/5 placeholder-muted/60 transition-colors task-input">
           </td>
           ${states.map(state => `
           <td class="p-0 border-r border-line/10">
              <button class="status-toggle w-full h-12 flex items-center justify-center text-lg transition-all ${getBtnClass(state)}" data-state="${state}">
                 <i class="fa-solid ${getIcon(state)} pointer-events-none"></i>
              </button>
           </td>`).join('')}
           <td class="p-0 text-center">
              <button class="delete-row-btn w-full h-12 flex items-center justify-center text-muted/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
                 <i class="fa-solid fa-trash-can pointer-events-none text-xs"></i>
              </button>
           </td>
        </tr>`;
    };

    const clearRowContent = (row) => {
        row.querySelector('input').value = '';
        row.querySelectorAll('.status-toggle').forEach(btn => {
            btn.dataset.state = 'empty';
            btn.className = `status-toggle w-full h-12 flex items-center justify-center text-lg transition-all ${getBtnClass('empty')}`;
            btn.innerHTML = `<i class="fa-solid ${getIcon('empty')} pointer-events-none"></i>`;
        });
    };

    const debounceMap = new Map();
    const handleUpdateTask = async (row) => {
        const id = row.dataset.id;
        const text = row.querySelector('input').value || '';
        const states = Array.from(row.querySelectorAll('.status-toggle')).map(btn => btn.dataset.state);
        
        if (!id) {
            if (!text.trim()) return; // don't create empty task on load
            if (debounceMap.has(row)) clearTimeout(debounceMap.get(row));
            debounceMap.set(row, setTimeout(async () => {
                try {
                    const res = await focusHub.createTask(text);
                    row.dataset.id = res.id;
                    await focusHub.updateTask(res.id, { task_text: text, day_states: states });
                } catch(e){ console.error(e); }
            }, 500));
        } else {
            if (debounceMap.has(id)) clearTimeout(debounceMap.get(id));
            debounceMap.set(id, setTimeout(async () => {
                try { await focusHub.updateTask(id, { task_text: text, day_states: states }); } catch(e){ console.error(e); }
            }, 500));
        }
    };

    const loadTasks = async (tbody) => {
        try {
            const tasks = await focusHub.listTasks();
            tbody.innerHTML = '';
            if (tasks && tasks.length > 0) {
                tasks.forEach(t => {
                    tbody.insertAdjacentHTML('beforeend', createRowHTML(t.id, t.task_text, t.day_states || Array(7).fill('empty')));
                });
            } else {
                tbody.insertAdjacentHTML('beforeend', createRowHTML());
            }
        } catch(e) { 
            console.error(e); 
            tbody.insertAdjacentHTML('beforeend', createRowHTML());
        }
    };

    const newTaskTableBody = taskTableBody.cloneNode(true);
    taskTableBody.replaceWith(newTaskTableBody);
    
    const newAddTaskBtn = addTaskBtn.cloneNode(true);
    addTaskBtn.replaceWith(newAddTaskBtn);

    const newClearAllBtn = clearAllBtn.cloneNode(true);
    clearAllBtn.replaceWith(newClearAllBtn);

    const newDeleteAllBtn = deleteAllBtn.cloneNode(true);
    deleteAllBtn.replaceWith(newDeleteAllBtn);

    newTaskTableBody.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') handleUpdateTask(e.target.closest('tr'));
    });

    newAddTaskBtn.addEventListener('click', () => {
        newTaskTableBody.insertAdjacentHTML('beforeend', createRowHTML());
    });

    newClearAllBtn.addEventListener('click', async () => {
        if (confirm("Clear all data in the current rows?")) {
            const rows = newTaskTableBody.querySelectorAll('tr');
            for(let row of rows) {
                clearRowContent(row);
                await handleUpdateTask(row);
            }
        }
    });

    newDeleteAllBtn.addEventListener('click', async () => {
        if (confirm("Delete all rows?")) {
            await focusHub.deleteAll().catch(console.error);
            newTaskTableBody.innerHTML = createRowHTML();
        }
    });

    newTaskTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.classList.contains('status-toggle')) {
            const currentState = btn.dataset.state;
            const nextState = currentState === 'empty' ? 'done' : (currentState === 'done' ? 'missed' : 'empty');
            btn.dataset.state = nextState;
            btn.className = `status-toggle w-full h-12 flex items-center justify-center text-lg transition-all ${getBtnClass(nextState)}`;
            btn.innerHTML = `<i class="fa-solid ${getIcon(nextState)} pointer-events-none"></i>`;
            handleUpdateTask(btn.closest('tr'));
        }

        if (btn.classList.contains('delete-row-btn')) {
            const row = btn.closest('tr');
            const id = row.dataset.id;
            if(id) {
                try { await focusHub.deleteTask(id); } catch(err) { console.error(err); }
            }
            if (newTaskTableBody.children.length > 1) {
                row.remove();
            } else {
                clearRowContent(row);
                row.removeAttribute('data-id');
            }
        }
    });

    const newStartBtn = startBtn.cloneNode(true);
    startBtn.replaceWith(newStartBtn);
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.replaceWith(newResetBtn);

    newStartBtn.addEventListener('click', toggleSharedTimer);
    newResetBtn.addEventListener('click', resetSharedTimer);

    loadTasks(newTaskTableBody);
    syncAllUI();
}