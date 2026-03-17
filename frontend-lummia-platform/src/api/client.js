// src/api/client.js - Unified API client with JWT
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let accessToken = sessionStorage.getItem('lummia_token');

export function setToken(token) { accessToken = token; sessionStorage.setItem('lummia_token', token); }
export function getToken() { return accessToken; }
export function clearToken() { accessToken = null; sessionStorage.removeItem('lummia_token'); sessionStorage.removeItem('lummia_user'); }

async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (res.status === 401) { clearToken(); window.location.reload(); throw new Error('Session expired'); }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
}

export const auth = {
    login: (email, password) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => apiFetch('/api/auth/me'),
    changePassword: (curr, nue, conf) => apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: curr, new_password: nue, confirm_password: conf }) }),
};
export const admin = {
    listUsers: () => apiFetch('/api/admin/users'),
    createUser: (d) => apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(d) }),
    updateUser: (id, d) => apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    deleteUser: (id) => apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }),
    listCohorts: () => apiFetch('/api/admin/cohorts'),
    createCohort: (d) => apiFetch('/api/admin/cohorts', { method: 'POST', body: JSON.stringify(d) }),
    listClans: () => apiFetch('/api/admin/clans'),
    createClan: (d) => apiFetch('/api/admin/clans', { method: 'POST', body: JSON.stringify(d) }),
    listRanks: () => apiFetch('/api/admin/ranks'),
};
export const content = {
    getSkillTree: () => apiFetch('/api/skill-tree'),
    createSkillNode: (d) => apiFetch('/api/skill-tree', { method: 'POST', body: JSON.stringify(d) }),
    deleteSkillNode: (id) => apiFetch(`/api/skill-tree/${id}`, { method: 'DELETE' }),
    listVideos: (nodeId, status) => { const p = new URLSearchParams(); if (nodeId) p.append('skill_node_id', nodeId); if (status) p.append('status', status); return apiFetch(`/api/videos?${p}`); },
    getVideo: (id) => apiFetch(`/api/videos/${id}`),
    createVideo: (d) => apiFetch('/api/videos', { method: 'POST', body: JSON.stringify(d) }),
    deleteVideo: (id) => apiFetch(`/api/videos/${id}`, { method: 'DELETE' }),
    updateVideoStatus: (id, s) => apiFetch(`/api/videos/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: s }) }),
    verifyQuiz: (vid, idx) => apiFetch(`/api/videos/${vid}/quiz`, { method: 'POST', body: JSON.stringify({ selected_index: idx }) }),
    startVideo: (vid) => apiFetch('/api/progress/start', { method: 'POST', body: JSON.stringify({ video_id: vid }) }),
    completeVideo: (vid) => apiFetch(`/api/progress/complete/${vid}`, { method: 'POST' }),
    myProgress: () => apiFetch('/api/progress/me'),
};
export const feed = {
    listPosts: () => apiFetch('/api/feed/posts'),
    createPost: (d) => apiFetch('/api/feed/posts', { method: 'POST', body: JSON.stringify(d) }),
    moderatePost: (id, s) => apiFetch(`/api/feed/posts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: s }) }),
    deletePost: (id) => apiFetch(`/api/feed/posts/${id}`, { method: 'DELETE' }),
    toggleLike: (id) => apiFetch(`/api/feed/posts/${id}/like`, { method: 'POST' }),
    listComments: (id) => apiFetch(`/api/feed/posts/${id}/comments`),
    createComment: (id, txt) => apiFetch(`/api/feed/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ content: txt }) }),
};
export const gamification = {
    userLeaderboard: () => apiFetch('/api/leaderboard/users'),
    clanLeaderboard: () => apiFetch('/api/leaderboard/clans'),
    clanMembers: (clanId) => apiFetch(`/api/leaderboard/clan/${clanId}/members`),
    completePomodoro: (vid, dur) => apiFetch('/api/pomodoro/complete', { method: 'POST', body: JSON.stringify({ video_id: vid, duration: dur }) }),
    listRanks: () => apiFetch('/api/ranks'),
};
export const focusHub = {
    listTasks: () => apiFetch('/api/pomodoro/tasks'),
    createTask: (text) => apiFetch('/api/pomodoro/tasks', { method: 'POST', body: JSON.stringify({ task_text: text }) }),
    updateTask: (id, data) => apiFetch(`/api/pomodoro/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTask: (id) => apiFetch(`/api/pomodoro/tasks/${id}`, { method: 'DELETE' }),
    deleteAll: () => apiFetch('/api/pomodoro/tasks/all', { method: 'DELETE' }),
    complete: (duration) => apiFetch('/api/pomodoro/complete', { method: 'POST', body: JSON.stringify({ duration }) }),
};
export const users = {
    updateProfile: (d) => apiFetch('/api/auth/profile', { method: 'PUT', body: JSON.stringify(d) }),
    getProfile: (id) => apiFetch(`/api/users/${id}/profile`),
    listAchievements: () => apiFetch('/api/achievements/me'),
};
export const chat = {
    send: (msg) => apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: msg }) }),
    history: (uid) => apiFetch(`/api/chat/history/${uid}`),
};
export const clanChat = {
    history: (clanId) => apiFetch(`/api/clan/chat/history/${clanId}`),
    send: (content) => apiFetch('/api/clan/chat/send', { method: 'POST', body: JSON.stringify({ content }) }),
};

export const achievements = {
    list: () => apiFetch('/api/achievements'),
    mine: () => apiFetch('/api/achievements/me'),
};
export const videos = {
    getDetail: (id) => apiFetch(`/api/videos/${id}`),
};
export const progress = {
    update: (vid, pomodoros) => apiFetch('/api/progress/update', { method: 'PUT', body: JSON.stringify({ video_id: vid, pomodoros_used: pomodoros }) }),
};
