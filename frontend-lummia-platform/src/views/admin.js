// src/views/admin.js
import { admin, content, feed, gamification, clanChat } from '../api/client.js';
import { getState } from '../utils/state.js';

export function renderAdmin(container) {
    const { user } = getState();
    if (!user || (user.role !== 'super_admin' && user.role !== 'tech_lead')) {
        if (container) container.innerHTML = '<div class="p-8 text-center text-red-400 font-bold uppercase">Access Denied</div>';
        return;
    }
    const isSA = user.role === 'super_admin';
    const tabs = isSA ? ['Users', 'Videos', 'Posts', 'Nodes', 'Cohorts', 'Clans'] : ['Videos', 'Posts'];

    if (!container) container = document.getElementById('main-container');
    container.innerHTML = /* html */`
    <div class="animate-in fade-in duration-500 p-4 lg:p-6 lg:px-8 max-w-7xl mx-auto w-full pb-32">
        <h1 class="text-3xl font-black text-main uppercase tracking-tight mb-6">Admin Panel</h1>
        <div class="flex gap-2 mb-6 flex-wrap">
            ${tabs.map((tab, i) => `<button class="admin-tab px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${i === 0 ? 'bg-fuchsia-600 text-white' : 'bg-card/40 text-muted border border-line/10 hover:bg-card/60'}" data-tab="${tab.toLowerCase()}">${tab}</button>`).join('')}
        </div>
        <div id="admin-content"></div>
    </div>`;

    const cd = document.getElementById('admin-content');
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(b => b.className = 'admin-tab px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer bg-card/40 text-muted border border-line/10 hover:bg-card/60');
            btn.className = 'admin-tab px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer bg-fuchsia-600 text-white';
            loadTab(btn.dataset.tab, cd, isSA);
        });
    });
    loadTab(tabs[0].toLowerCase(), cd, isSA);
}

async function loadTab(tab, div, isSA) {
    div.innerHTML = '<div class="flex flex-col items-center justify-center py-12"><img src="/assets/loading.gif" class="w-14 h-14 mb-3" alt="Loading"><span class="text-muted text-[10px] font-bold uppercase tracking-widest">Loading...</span></div>';
    try {
        if (tab === 'users') await usersTab(div);
        else if (tab === 'videos') await videosTab(div);
        else if (tab === 'posts') await postsTab(div);
        else if (tab === 'nodes') await nodesTab(div);
        else if (tab === 'cohorts') await cohortsTab(div);
        else if (tab === 'clans') await clansTab(div);
    } catch (e) { div.innerHTML = `<p class="text-red-400">${e.message}</p>`; }
}

async function usersTab(div) {
    const [users, cohorts, clans] = await Promise.all([admin.listUsers(), admin.listCohorts(), admin.listClans()]);
    div.innerHTML = `
        <div class="bg-card/40 border border-line/10 rounded-2xl p-6 mb-6">
            <h3 class="text-sm font-bold text-main mb-4 uppercase">Create User</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <input id="nu-name" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Name"/>
                <input id="nu-email" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Email"/>
                <input id="nu-pass" type="password" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Password"/>
                <select id="nu-role" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main focus:outline-none"><option value="user">User</option><option value="tech_lead">Tech Lead</option><option value="super_admin">Super Admin</option></select>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <select id="nu-cohort" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main focus:outline-none"><option value="">No cohort</option>${cohorts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
                <select id="nu-clan" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main focus:outline-none"><option value="">No clan</option>${clans.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
                <button id="btn-cu" class="px-4 py-2 rounded-xl bg-fuchsia-600 text-white text-xs font-bold cursor-pointer">Create</button>
            </div>
            <div id="cu-fb" class="hidden mt-2 text-xs"></div>
        </div>
        <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-[10px] text-muted uppercase tracking-widest border-b border-line/10"><th class="py-2 px-3 text-left">Name</th><th class="py-2 px-3 text-left">Email</th><th class="py-2 px-3">Role</th><th class="py-2 px-3">XP</th><th class="py-2 px-3">Status</th></tr></thead>
        <tbody>${users.map(u => `<tr class="border-b border-line/5 hover:bg-card/40"><td class="py-2 px-3 text-main">${u.username}</td><td class="py-2 px-3 text-muted">${u.email}</td><td class="py-2 px-3 text-center"><span class="px-2 py-0.5 rounded text-[9px] font-bold ${u.role==='super_admin'?'bg-red-500/10 text-red-400':u.role==='tech_lead'?'bg-amber-500/10 text-amber-400':'bg-accent/10 text-accent'}">${u.role}</span></td><td class="py-2 px-3 text-amber-400 text-center font-bold">${u.expbara}</td><td class="py-2 px-3 text-center ${u.is_active?'text-emerald-400':'text-red-400'}">${u.is_active?'Active':'Inactive'}</td></tr>`).join('')}</tbody></table></div>`;
    document.getElementById('btn-cu').addEventListener('click', async () => {
        const fb = document.getElementById('cu-fb');
        try {
            await admin.createUser({ username: document.getElementById('nu-name').value, email: document.getElementById('nu-email').value, password: document.getElementById('nu-pass').value, role: document.getElementById('nu-role').value, cohort_id: document.getElementById('nu-cohort').value || null, clan_id: document.getElementById('nu-clan').value || null });
            fb.className = 'mt-2 text-xs text-emerald-400'; fb.textContent = 'User created'; fb.classList.remove('hidden');
            await usersTab(div);
        } catch (e) { fb.className = 'mt-2 text-xs text-red-400'; fb.textContent = e.message; fb.classList.remove('hidden'); }
    });
}

async function videosTab(div) {
    const [vids, nodes] = await Promise.all([content.listVideos(), content.getSkillTree()]);
    div.innerHTML = `
        <div class="bg-card/40 border border-line/10 rounded-2xl p-6 mb-6">
            <h3 class="text-sm font-bold text-main mb-4 uppercase">Create Video</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input id="nv-title" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Title"/>
                <input id="nv-url" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="YouTube URL"/>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <textarea id="nv-desc" rows="2" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent resize-none md:col-span-2" placeholder="Description"></textarea>
                <div class="flex gap-3">
                    <input id="nv-dur" type="number" class="flex-1 bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Minutes"/>
                    <select id="nv-node" class="flex-1 bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main focus:outline-none">
                        <option value="">Node</option>
                        ${nodes.map(n => `<option value="${n.id}">${n.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <details class="mb-3">
                <summary class="text-[10px] text-muted font-bold uppercase tracking-widest cursor-pointer mb-2">Quiz (optional)</summary>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input id="nv-quiz-q" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent md:col-span-2" placeholder="Quiz question"/>
                    <input id="nv-quiz-o0" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Option A"/>
                    <input id="nv-quiz-o1" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Option B"/>
                    <input id="nv-quiz-o2" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Option C"/>
                    <input id="nv-quiz-ci" type="number" min="0" max="2" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Correct index (0-2)"/>
                </div>
            </details>
            <button id="btn-cv" class="px-4 py-2 rounded-xl bg-fuchsia-600 text-white text-xs font-bold cursor-pointer">Create Video</button>
            <span id="cv-fb" class="hidden ml-3 text-xs"></span>
        </div>
        <h3 class="text-sm font-bold text-main mb-4 uppercase">All Videos (${vids.length})</h3>
        <div class="space-y-3">${vids.map(v => `<div class="bg-card/40 border border-line/10 rounded-xl p-4 flex items-center justify-between" data-vid="${v.id}"><div class="flex-1 min-w-0 mr-4"><h4 class="text-sm font-bold text-main truncate">${v.title}</h4><p class="text-[10px] text-muted">${v.status} - Node #${v.skill_node_id}</p></div><div class="flex gap-2">${v.status==='pending'?`<button class="bav px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer">Approve</button>`:''}<button class="bdv px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold cursor-pointer">Delete</button></div></div>`).join('')}</div>`;

    document.getElementById('btn-cv').addEventListener('click', async () => {
        const fb = document.getElementById('cv-fb');
        const title = document.getElementById('nv-title').value.trim();
        const youtube_url = document.getElementById('nv-url').value.trim();
        if (!title || !youtube_url) { fb.className = 'ml-3 text-xs text-red-400'; fb.textContent = 'Title and URL required'; fb.classList.remove('hidden'); return; }
        const data = { title, youtube_url, description: document.getElementById('nv-desc').value.trim(), duration_minutes: parseInt(document.getElementById('nv-dur').value) || 10, skill_node_id: parseInt(document.getElementById('nv-node').value) || null };
        const quizQ = document.getElementById('nv-quiz-q').value.trim();
        if (quizQ) {
            data.quiz_question = quizQ;
            data.quiz_options = [document.getElementById('nv-quiz-o0').value.trim(), document.getElementById('nv-quiz-o1').value.trim(), document.getElementById('nv-quiz-o2').value.trim()].filter(Boolean);
            data.quiz_correct_index = parseInt(document.getElementById('nv-quiz-ci').value) || 0;
        }
        try { await content.createVideo(data); fb.className = 'ml-3 text-xs text-emerald-400'; fb.textContent = 'Video created'; fb.classList.remove('hidden'); await videosTab(div); } catch (e) { fb.className = 'ml-3 text-xs text-red-400'; fb.textContent = e.message; fb.classList.remove('hidden'); }
    });
    div.querySelectorAll('.bav').forEach(b => b.addEventListener('click', async () => { await content.updateVideoStatus(b.closest('[data-vid]').dataset.vid, 'approved'); await videosTab(div); }));
    div.querySelectorAll('.bdv').forEach(b => b.addEventListener('click', async () => { if (!confirm('Delete video?')) return; await content.deleteVideo(b.closest('[data-vid]').dataset.vid); await videosTab(div); }));
}

async function postsTab(div) {
    const posts = await feed.listPosts();
    div.innerHTML = `<h3 class="text-sm font-bold text-main mb-4 uppercase">All Posts (${posts.length})</h3>
    <div class="space-y-3">${posts.map(p => `
        <div class="bg-card/40 border border-line/10 rounded-xl p-4" data-pid="${p.id}">
            <div class="flex items-center justify-between mb-2">
                <div>
                    <h4 class="text-sm font-bold text-main">${p.title}</h4>
                    <p class="text-[10px] text-muted">By ${p.author_name||'Anon'} - <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${p.status==='approved'?'bg-emerald-500/20 text-emerald-400':p.status==='rejected'?'bg-red-500/20 text-red-400':'bg-amber-500/20 text-amber-400'}">${p.status}</span></p>
                </div>
                <div class="flex gap-2">
                    <button class="bvp px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold cursor-pointer">View</button>
                    ${p.status==='pending'?`<button class="bap px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer">Approve</button><button class="brp px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold cursor-pointer">Reject</button>`:''}<button class="bdp px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold cursor-pointer">Delete</button>
                </div>
            </div>
            <p class="text-xs text-muted">${p.content.substring(0,120)}...</p>
        </div>`).join('')}
    </div>
    <div id="post-preview-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="post-modal-backdrop"></div>
        <div class="relative bg-card border border-line/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div class="flex items-center justify-between p-5 border-b border-line/10">
                <div>
                    <h3 id="pm-title" class="text-base font-bold text-main"></h3>
                    <p id="pm-meta" class="text-[10px] text-muted mt-1"></p>
                </div>
                <button id="pm-close" class="w-8 h-8 rounded-lg bg-main/5 hover:bg-main/10 flex items-center justify-center text-muted hover:text-main transition-all cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="pm-content" class="p-5 overflow-y-auto custom-scrollbar text-sm text-main/90 leading-relaxed"></div>
            <div id="pm-actions" class="flex gap-3 p-5 border-t border-line/10"></div>
        </div>
    </div>`;

    function renderPostContent(raw) {
        let html = raw.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(/```([\s\S]*?)```/g, (_, code) =>
            `<pre class="bg-app/50 border border-line/10 rounded-xl p-4 my-3 overflow-x-auto text-xs font-mono text-main/80"><code>${code.trim()}</code></pre>`);
        html = html.replace(/`([^`]+)`/g, '<code class="bg-app/50 px-1.5 py-0.5 rounded text-xs font-mono text-accent">$1</code>');
        html = html.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:\S*)/g, (_, id) =>
            `<div class="my-3 rounded-xl overflow-hidden border border-line/10"><iframe src="https://www.youtube.com/embed/${id}" class="w-full aspect-video" frameborder="0" allowfullscreen></iframe></div>`);
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function openPostModal(post) {
        const modal = document.getElementById('post-preview-modal');
        document.getElementById('pm-title').textContent = post.title;
        document.getElementById('pm-meta').textContent = `By ${post.author_name||'Anon'} - ${post.status}`;
        document.getElementById('pm-content').innerHTML = renderPostContent(post.content);
        const actionsEl = document.getElementById('pm-actions');
        if (post.status === 'pending') {
            actionsEl.innerHTML = `
                <button id="pm-approve" class="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all">Approve</button>
                <button id="pm-reject" class="flex-1 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold cursor-pointer transition-all">Reject</button>`;
            document.getElementById('pm-approve').addEventListener('click', async () => { await feed.moderatePost(post.id, 'approved'); modal.classList.add('hidden'); await postsTab(div); });
            document.getElementById('pm-reject').addEventListener('click', async () => { await feed.moderatePost(post.id, 'rejected'); modal.classList.add('hidden'); await postsTab(div); });
        } else {
            actionsEl.innerHTML = `<span class="text-[10px] text-muted">This post has been ${post.status}.</span>`;
        }
        modal.classList.remove('hidden');
    }

    document.getElementById('post-modal-backdrop').addEventListener('click', () => document.getElementById('post-preview-modal').classList.add('hidden'));
    document.getElementById('pm-close').addEventListener('click', () => document.getElementById('post-preview-modal').classList.add('hidden'));
    document.addEventListener('keydown', function postEsc(e) { if (e.key === 'Escape') { document.getElementById('post-preview-modal')?.classList.add('hidden'); } });

    div.querySelectorAll('.bvp').forEach(b => {
        b.addEventListener('click', () => {
            const pid = b.closest('[data-pid]').dataset.pid;
            const post = posts.find(p => String(p.id) === pid);
            if (post) openPostModal(post);
        });
    });
    div.querySelectorAll('.bap').forEach(b => b.addEventListener('click', async () => { await feed.moderatePost(b.closest('[data-pid]').dataset.pid, 'approved'); await postsTab(div); }));
    div.querySelectorAll('.brp').forEach(b => b.addEventListener('click', async () => { await feed.moderatePost(b.closest('[data-pid]').dataset.pid, 'rejected'); await postsTab(div); }));
    div.querySelectorAll('.bdp').forEach(b => b.addEventListener('click', async () => { if (!confirm('Delete post?')) return; await feed.deletePost(b.closest('[data-pid]').dataset.pid); await postsTab(div); }));
}

async function nodesTab(div) {
    const nodes = await content.getSkillTree();
    div.innerHTML = `
        <div class="bg-card/40 border border-line/10 rounded-2xl p-6 mb-6">
            <h3 class="text-sm font-bold text-main mb-4 uppercase">Create Skill Node</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input id="nn-name" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Node name"/>
                <select id="nn-parent" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main focus:outline-none">
                    <option value="">No parent (root)</option>
                    ${nodes.map(n => `<option value="${n.id}">${n.name}</option>`).join('')}
                </select>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input id="nn-desc" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent md:col-span-2" placeholder="Description"/>
                <div class="flex gap-3">
                    <input id="nn-order" type="number" class="flex-1 bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Order"/>
                    <input id="nn-img" class="flex-1 bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Image URL"/>
                </div>
            </div>
            <button id="btn-cn" class="px-4 py-2 rounded-xl bg-fuchsia-600 text-white text-xs font-bold cursor-pointer">Create Node</button>
            <span id="cn-fb" class="hidden ml-3 text-xs"></span>
        </div>
        <h3 class="text-sm font-bold text-main mb-4 uppercase">Skill Nodes (${nodes.length})</h3>
        <div class="space-y-2">${nodes.map(n => `<div class="bg-card/40 border border-line/10 rounded-xl p-3 flex items-center justify-between" data-nid="${n.id}"><div class="flex items-center gap-3">${n.image_url?`<img src="${n.image_url}" class="w-8 h-8 object-contain" alt=""/>`:''}<div><span class="text-sm font-bold text-main">${n.name}</span><p class="text-[9px] text-muted">${n.description||''}</p></div></div><button class="bdn px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold cursor-pointer">Delete</button></div>`).join('')}</div>`;

    document.getElementById('btn-cn').addEventListener('click', async () => {
        const fb = document.getElementById('cn-fb');
        const name = document.getElementById('nn-name').value.trim();
        if (!name) { fb.className = 'ml-3 text-xs text-red-400'; fb.textContent = 'Name required'; fb.classList.remove('hidden'); return; }
        const data = { name, description: document.getElementById('nn-desc').value.trim() || null, parent_node_id: parseInt(document.getElementById('nn-parent').value) || null, display_order: parseInt(document.getElementById('nn-order').value) || 0, image_url: document.getElementById('nn-img').value.trim() || null };
        try { await content.createSkillNode(data); fb.className = 'ml-3 text-xs text-emerald-400'; fb.textContent = 'Node created'; fb.classList.remove('hidden'); await nodesTab(div); } catch (e) { fb.className = 'ml-3 text-xs text-red-400'; fb.textContent = e.message; fb.classList.remove('hidden'); }
    });
    div.querySelectorAll('.bdn').forEach(b => b.addEventListener('click', async () => { if (!confirm('Delete node and videos?')) return; try { await content.deleteSkillNode(b.closest('[data-nid]').dataset.nid); await nodesTab(div); } catch (e) { alert(e.message); } }));
}

async function cohortsTab(div) {
    const cohorts = await admin.listCohorts();
    div.innerHTML = `<div class="flex gap-3 mb-6"><input id="nc-n" class="flex-1 bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Cohort name"/><button id="btn-cc" class="px-4 py-2 rounded-xl bg-fuchsia-600 text-white text-xs font-bold cursor-pointer">Create</button></div><div class="space-y-2">${cohorts.map(c => `<div class="bg-card/40 border border-line/10 rounded-xl p-4"><span class="text-sm font-bold text-main">${c.name}</span></div>`).join('')}</div>`;
    document.getElementById('btn-cc').addEventListener('click', async () => { const n = document.getElementById('nc-n').value.trim(); if (!n) return; await admin.createCohort({ name: n }); await cohortsTab(div); });
}

async function clansTab(div) {
    const [clans, cohorts] = await Promise.all([admin.listClans(), admin.listCohorts()]);
    div.innerHTML = `
        <div class="flex gap-3 mb-6">
            <input id="ncl-n" class="flex-1 bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent" placeholder="Clan name"/>
            <select id="ncl-c" class="bg-app/50 border border-line/10 rounded-xl py-2 px-3 text-sm text-main focus:outline-none">${cohorts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
            <button id="btn-ccl" class="px-4 py-2 rounded-xl bg-fuchsia-600 text-white text-xs font-bold cursor-pointer">Create</button>
        </div>
        <div class="space-y-4">${clans.map(c => `
            <div class="bg-card/40 border border-line/10 rounded-xl overflow-hidden" data-clan-id="${c.id}">
                <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-card/60 transition-all btn-expand-clan" data-clan-id="${c.id}" data-clan-name="${c.name}">
                    <div>
                        <h4 class="font-bold text-main">${c.name}</h4>
                        <p class="text-[10px] text-muted">Avg: ${c.avg_expbara||0} XP - ${c.member_count} members</p>
                    </div>
                    <i class="fa-solid fa-chevron-down text-muted text-xs transition-transform clan-chevron-${c.id}"></i>
                </div>
                <div id="clan-details-${c.id}" class="hidden border-t border-line/10"></div>
            </div>
        `).join('')}</div>`;

    document.getElementById('btn-ccl').addEventListener('click', async () => {
        const n = document.getElementById('ncl-n').value.trim();
        const cid = document.getElementById('ncl-c').value;
        if (!n) return;
        await admin.createClan({ name: n, cohort_id: parseInt(cid) });
        await clansTab(div);
    });

    div.querySelectorAll('.btn-expand-clan').forEach(btn => {
        btn.addEventListener('click', async () => {
            const clanId = parseInt(btn.dataset.clanId);
            const clanName = btn.dataset.clanName;
            const detailsEl = document.getElementById(`clan-details-${clanId}`);
            const chevron = div.querySelector(`.clan-chevron-${clanId}`);
            if (!detailsEl) return;

            if (!detailsEl.classList.contains('hidden')) {
                detailsEl.classList.add('hidden');
                if (chevron) chevron.style.transform = '';
                return;
            }

            detailsEl.classList.remove('hidden');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            detailsEl.innerHTML = '<div class="py-8 text-center"><img src="/assets/loading.gif" class="w-12 h-12 mx-auto" alt="Loading"></div>';

            try {
                const [members, chatHistory] = await Promise.all([
                    gamification.clanMembers(clanId),
                    clanChat.history(clanId).catch(() => ({ messages: [] }))
                ]);
                const messages = chatHistory.messages || [];

                detailsEl.innerHTML = `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-line/10">
                        <div class="p-4">
                            <h5 class="text-[10px] font-bold text-muted uppercase tracking-widest mb-3"><i class="fa-solid fa-ranking-star text-amber-400 mr-1"></i> Member Ranking (${members.length})</h5>
                            <div class="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                ${members.length ? members.map((u, i) => `
                                    <div class="flex items-center gap-3 p-2 rounded-lg bg-card/30 hover:bg-card/50 transition-all">
                                        <span class="text-xs font-black text-muted w-5 text-center">${i + 1}</span>
                                        <div class="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[9px] text-accent font-bold uppercase">${u.username[0]}</div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-xs font-bold text-main truncate">${u.username}</p>
                                            <p class="text-[9px] text-muted">${u.rank_name || 'Member'}</p>
                                        </div>
                                        <span class="text-xs font-bold text-amber-400">${u.expbara} XP</span>
                                    </div>
                                `).join('') : '<p class="text-[10px] text-muted text-center py-4">No members</p>'}
                            </div>
                        </div>
                        <div class="p-4">
                            <h5 class="text-[10px] font-bold text-muted uppercase tracking-widest mb-3"><i class="fa-solid fa-comments text-indigo-400 mr-1"></i> Recent Chat (${messages.length})</h5>
                            <div class="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                ${messages.length ? messages.slice(-20).map(m => `
                                    <div class="flex items-start gap-2">
                                        <div class="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[8px] text-indigo-400 font-bold uppercase shrink-0">${(m.username||'?')[0]}</div>
                                        <div class="min-w-0">
                                            <p class="text-[10px]"><span class="font-bold text-indigo-400">${m.username}</span> <span class="text-muted">${m.content}</span></p>
                                            <p class="text-[8px] text-muted/50">${new Date(m.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                `).join('') : '<p class="text-[10px] text-muted text-center py-4">No messages yet</p>'}
                            </div>
                        </div>
                    </div>`;
            } catch (e) {
                detailsEl.innerHTML = `<div class="p-4 text-center text-red-400 text-xs">${e.message || 'Failed to load clan details'}</div>`;
            }
        });
    });
}
