// src/utils/state.js - JWT session management
import { auth } from '../api/client.js';

const getSavedSession = () => {
    const s = sessionStorage.getItem('lummia_user');
    return s ? JSON.parse(s) : null;
};
const state = { user: getSavedSession(), isAuthenticated: !!getSavedSession() };

export function getState() {
    const s = getSavedSession();
    return { user: s || { username: 'Guest', level: 0 }, isAuthenticated: !!s };
}
export function setState(newState) {
    Object.assign(state, newState);
    if (newState.user) sessionStorage.setItem('lummia_user', JSON.stringify(newState.user));
}
export function clearState() {
    sessionStorage.removeItem('lummia_user');
    state.user = null;
    state.isAuthenticated = false;
}

export async function refreshUser() {
    try {
        const fresh = await auth.me();
        if (fresh && fresh.id) {
            setState({ user: fresh, isAuthenticated: true });
            return fresh;
        }
    } catch (e) {
        console.error('Failed to refresh user data', e);
    }
    return getSavedSession();
}

export async function handleXPGain(result) {
    const user = await refreshUser();
    if (!user) return;

    const sidebarInfo = document.getElementById('sidebar-user-info');
    if (sidebarInfo) sidebarInfo.textContent = `${user.rank_name || 'Aprendiz'} - ${user.expbara || 0} XP`;

    const sidebarLevel = document.getElementById('sidebar-user-level');
    if (sidebarLevel) sidebarLevel.textContent = `L${user.level || 1}`;

    window.dispatchEvent(new CustomEvent('xp-updated', { detail: user }));

    if (result && result.leveled_up) {
        const { showLevelUp } = await import('./levelUp.js');
        showLevelUp(result.new_level, result.new_rank_name);
    }
}
