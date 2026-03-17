// src/main.js
import { getAppLayout } from './components/layout.js';
import { renderSidebar } from './features/navigation/sidebar.js';
import { renderTutorIA, initTutorLogic } from './features/services/ai/tutor.js';
import { initRouter } from './utils/router.js'; 
import { injectGlobalPomodoroUI } from './components/globalPomodoro.js';
import { initGlobalPomodoroLogic } from './features/services/pomodoro/pomodoroLogic.js';
import { ThemeManager } from './utils/themeManager.js';

export function setupFullInterface() {
    const app = document.getElementById('app');
    
    if (!document.getElementById('app-wrapper')) {
        app.innerHTML = getAppLayout();
    }

    renderSidebar();
    renderTutorIA(); 
    
    initTutorLogic();
    injectGlobalPomodoroUI();
    initGlobalPomodoroLogic();

    ThemeManager.apply(ThemeManager.current());
}

document.addEventListener('DOMContentLoaded', () => {
    initGlobalPanelsLogic();
    initRouter();
});

// Interface Logic

function initGlobalPanelsLogic() {
    document.addEventListener('click', (e) => {
        
        // Mobile Menu Toggle
        const menuBtn = e.target.closest('#mobile-menu-toggle');
        const nav = document.getElementById('nav-container');
        
        if (menuBtn && nav) {
            e.stopPropagation();
            const isClosed = nav.classList.contains('-translate-x-full');
            if (isClosed) {
                nav.classList.remove('-translate-x-full');
                menuBtn.innerHTML = '<i class="fa-solid fa-xmark text-sm pointer-events-none"></i>';
                menuBtn.style.boxShadow = "0 0 15px rgba(70,242,22,0.3)";
            } else {
                nav.classList.add('-translate-x-full');
                menuBtn.innerHTML = '<i class="fa-solid fa-bars-staggered text-sm pointer-events-none"></i>';
                menuBtn.style.boxShadow = "none";
            }
        }

        // AI Panel Toggle
        const aiBtn = e.target.closest('#ai-menu-toggle') || e.target.closest('.toggle-tutor-btn');
        const aiPanel = document.getElementById('ai-panel-container');
        const pomoWrapper = document.getElementById('global-pomodoro-wrapper');
        
        if (aiBtn && aiPanel) {
            e.stopPropagation();
            const isClosed = aiPanel.classList.contains('translate-x-full') || aiPanel.classList.contains('hidden');
            if (isClosed) {
                aiPanel.classList.remove('translate-x-full', 'hidden');
                aiPanel.classList.add('translate-x-0');
                if (pomoWrapper) pomoWrapper.classList.add('hidden');
                if (aiBtn.id === 'ai-menu-toggle') {
                    aiBtn.innerHTML = '<i class="fa-solid fa-xmark text-sm pointer-events-none"></i>';
                    aiBtn.style.boxShadow = "0 0 15px rgba(217,70,239,0.3)"; 
                    aiBtn.style.color = "#d946ef"; 
                }
            } else {
                aiPanel.classList.add('translate-x-full');
                aiPanel.classList.remove('translate-x-0');
                if (pomoWrapper) pomoWrapper.classList.remove('hidden');
                if (aiBtn.id === 'ai-menu-toggle') {
                    aiBtn.innerHTML = '<i class="fa-solid fa-robot text-sm pointer-events-none"></i>';
                    aiBtn.style.boxShadow = "none";
                    aiBtn.style.color = ""; 
                }
            }
        }

        // Close panels when clicking outside on smaller screens
        const mainContent = e.target.closest('#main-container');
        if (mainContent) {
            if (nav && !nav.classList.contains('-translate-x-full') && window.innerWidth < 1024) {
                nav.classList.add('-translate-x-full');
                const mBtn = document.getElementById('mobile-menu-toggle');
                if (mBtn) {
                    mBtn.innerHTML = '<i class="fa-solid fa-bars-staggered text-sm pointer-events-none"></i>';
                    mBtn.style.boxShadow = "none";
                }
            }
            if (aiPanel && !aiPanel.classList.contains('translate-x-full') && window.innerWidth < 1280) { 
                aiPanel.classList.add('translate-x-full');
                if (pomoWrapper) pomoWrapper.classList.remove('hidden');
                const aBtn = document.getElementById('ai-menu-toggle');
                if (aBtn) {
                    aBtn.innerHTML = '<i class="fa-solid fa-robot text-sm pointer-events-none"></i>';
                    aBtn.style.boxShadow = "none";
                    aBtn.style.color = "";
                }
            }
        }
    });
}