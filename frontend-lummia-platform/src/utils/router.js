// src/utils/router.js - Router with JWT auth guard + admin route
import { initCoursesLogic } from '../features/services/courses/coursesLogic.js';
import { initPomodoroLogic } from '../features/services/pomodoro/pomodoroLogic.js';
import { renderClan } from '../views/clan.js';
import { renderSkills } from '../views/skills.js';
import { renderCourses } from '../views/courses.js';
import { renderHome } from '../views/home.js';
import { renderPomodoro } from '../views/pomodoro.js';
import { renderProfile } from '../views/profile.js';
import { renderLogin } from '../views/login.js';
import { renderAdmin } from '../views/admin.js';
import { renderUserProfile } from '../views/userProfile.js';
import { renderVideoPlayer } from '../views/videoPlayer.js';
import { setupFullInterface } from '../main.js';
import { getToken } from '../api/client.js';

const routes = {
    login: renderLogin, home: renderHome, pomodoro: renderPomodoro,
    clan: renderClan, skills: renderSkills, courses: renderCourses,
    profile: renderProfile, admin: renderAdmin,
    'user-profile': renderUserProfile,
    'video-player': renderVideoPlayer,
    404: () => `<div class="p-8 text-center text-main"><h2>404 - Not Found</h2></div>`,
};

export function navigateTo(route, id = null) {
    const token = getToken();
    if (!token && route !== 'login') {
        window.location.hash = 'login';
        return;
    }
    if (token && route === 'login') {
        window.location.hash = 'home';
        return;
    }

    if (route === 'login') {
        renderLogin();
        return;
    }

    // Ensure the full interface layout exists before rendering any view
    setupFullInterface();

    const main = document.getElementById('main-container');
    const ai = document.getElementById('ai-panel-container');
    if (!main) { console.error('main-container not found after setupFullInterface'); return; }
    
    const viewExists = !!routes[route];
    if (ai) { if (!viewExists) { ai.classList.add('hidden'); } else { ai.classList.remove('hidden'); } }

    const globalTimer = document.getElementById('global-pomodoro-wrapper');
    if (globalTimer) globalTimer.classList.toggle('hidden', route === 'pomodoro');

    // Hide global AI toggle on video-player (video has its own CapybaraTutor AI)
    const aiToggle = document.getElementById('ai-menu-toggle');
    if (aiToggle) {
        if (route === 'video-player') {
            aiToggle.style.display = 'none';
            if (ai && !ai.classList.contains('translate-x-full')) {
                ai.classList.add('translate-x-full');
                ai.classList.remove('translate-x-0');
            }
        } else {
            aiToggle.style.display = '';
        }
    }

    const view = routes[route] || routes['404'];
    const actualRoute = viewExists ? route : '404';
    
    main.innerHTML = '';
    const c = view(main, id);
    if (typeof c === 'string') main.innerHTML = c;
    if (actualRoute === 'pomodoro') initPomodoroLogic();
    if (actualRoute === 'courses') initCoursesLogic();
    if (actualRoute === 'clan') {
        import('../views/clan.js').then(m => {
            if (m.initClanLogic) m.initClanLogic();
        });
    }
    updateActiveNav(actualRoute);
}

function updateActiveNav(route) {
    document.querySelectorAll('.nav-link').forEach(btn => {
        const ind = btn.querySelector('.nav-indicator');
        if (btn.getAttribute('data-route') === route) {
            btn.classList.add('bg-main/[0.04]');
            if (ind) ind.classList.replace('h-0', 'h-8');
        } else {
            btn.classList.remove('bg-main/[0.04]');
            if (ind) ind.classList.replace('h-8', 'h-0');
        }
    });
}

export function initRouter() {
    document.addEventListener('click', e => {
        const btn = e.target.closest('.nav-link');
        if (btn) { 
            e.preventDefault(); 
            const route = btn.getAttribute('data-route');
            window.location.hash = route;
        }
    });
    
    window.addEventListener('hashchange', handleHash);
    
    // Initial load
    if (!window.location.hash) {
        window.location.hash = getToken() ? 'home' : 'login';
    } else {
        handleHash();
    }
}

function handleHash() {
    const hash = window.location.hash.slice(1) || (getToken() ? 'home' : 'login');
    const [path, id] = hash.split('/');
    navigateTo(path, id);
}
