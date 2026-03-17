// src/views/skills.js - Real skill tree from API
import { content } from '../api/client.js';
import { getState } from '../utils/state.js';

export function renderSkills(container) {
    if (!container) return;

    const { user } = getState();
    const session = user || { level: 1, expbara: 0, role: 'user' };
    const isAdmin = session.role === 'super_admin' || session.role === 'tech_lead';

    container.innerHTML = /* html */`
    <div class="animate-system-boot h-full flex flex-col relative z-0 p-4 lg:p-6 lg:px-8 max-w-7xl mx-auto w-full">

        <div class="bg-card/40 backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-2xl flex-shrink-0">
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[80px]"></div>
            <div class="flex items-center gap-6 relative z-10">
                <div class="relative">
                    <div class="w-20 h-20 rounded-2xl bg-card/60 border-2 border-cyan-500/30 flex items-center justify-center overflow-hidden shadow-inner">
                        <img src="../../assets/completedCapi.png" alt="Path Icon" class="w-full h-full object-cover">
                    </div>
                    <div class="absolute -bottom-2 -right-2 bg-card border border-cyan-500 text-main text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">LVL ${session.level || 1}</div>
                </div>
                <div class="flex-1">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-2">
                        <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                        <span class="text-cyan-400 text-[9px] font-bold uppercase tracking-widest">Development Path</span>
                    </div>
                    <h1 class="text-3xl font-black text-main tracking-wide uppercase mb-3">Core Skill Tree</h1>
                    <div class="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                        <span class="flex items-center gap-1.5 text-emerald-400"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Completed</span>
                        <span class="flex items-center gap-1.5 text-cyan-400"><span class="w-2 h-2 rounded-full bg-cyan-400"></span> Available</span>
                        <span class="flex items-center gap-1.5 text-muted/60"><span class="w-2 h-2 rounded-full bg-zinc-600"></span> Locked</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-1 bg-card/40 backdrop-blur-3xl border border-line/10 rounded-[2.5rem] p-8 shadow-2xl overflow-auto min-h-0">
            <div class="flex items-center justify-between mb-8 shrink-0">
                <h3 class="text-xs font-black text-main uppercase tracking-[0.2em] flex items-center gap-3">
                    <i class="fa-solid fa-sitemap text-cyan-500"></i> Module Progression
                </h3>
            </div>
            <div id="skill-tree-container" class="relative" style="min-height:500px">
                <div class="flex flex-col items-center justify-center py-20 opacity-60">
                    <img src="/assets/loading.gif" class="w-20 h-20 mb-3" alt="Loading">
                    <span class="text-[10px] font-black text-main uppercase tracking-widest">Loading Skill Tree...</span>
                </div>
            </div>
        </div>
    </div>`;

    loadSkillTree(isAdmin);
}

async function loadSkillTree(isAdmin) {
    try {
        const [nodes, progress, allVideos] = await Promise.all([
            content.getSkillTree(),
            content.myProgress().catch(() => []),
            content.listVideos(null, 'approved').catch(() => []),
        ]);

        const completedVideoIds = new Set(
            (progress || []).filter(p => p.status === 'completed').map(p => p.video_id)
        );

        const videosPerNode = {}, completedPerNode = {};
        (allVideos || []).forEach(v => {
            videosPerNode[v.skill_node_id] = (videosPerNode[v.skill_node_id] || 0) + 1;
            if (completedVideoIds.has(v.id)) completedPerNode[v.skill_node_id] = (completedPerNode[v.skill_node_id] || 0) + 1;
        });

        const nodeMap = {};
        nodes.forEach(n => nodeMap[n.id] = n);

        // Calculate node status
        const nodeStatus = {};
        function calcStatus(node) {
            if (nodeStatus[node.id]) return nodeStatus[node.id];
            const total = videosPerNode[node.id] || 0;
            const done = completedPerNode[node.id] || 0;

            if (isAdmin) {
                nodeStatus[node.id] = done >= total && total > 0 ? 'completed' : 'available';
                return nodeStatus[node.id];
            }
            if (!node.parent_node_id) {
                nodeStatus[node.id] = done >= total && total > 0 ? 'completed' : 'available';
                return nodeStatus[node.id];
            }

            function ancestorComplete(n) {
                if (!n.parent_node_id) return true;
                const parent = nodeMap[n.parent_node_id];
                if (!parent) return true;
                const pTotal = videosPerNode[parent.id] || 0;
                const pDone = completedPerNode[parent.id] || 0;
                if (pTotal > 0) return pDone >= pTotal;
                return ancestorComplete(parent);
            }

            nodeStatus[node.id] = ancestorComplete(node)
                ? (done >= total && total > 0 ? 'completed' : 'available')
                : 'locked';
            return nodeStatus[node.id];
        }
        nodes.forEach(n => calcStatus(n));

        // Layout algorithm
        const rootNodes = nodes.filter(n => !n.parent_node_id);
        const childMap = {};
        nodes.forEach(n => {
            if (n.parent_node_id) {
                (childMap[n.parent_node_id] = childMap[n.parent_node_id] || []).push(n);
            }
        });

        const positions = {};
        const GAP_X = 180, GAP_Y = 170;
        let maxX = 0;

        function getLeaves(id) {
            const ch = childMap[id] || [];
            if (!ch.length) return 1;
            return ch.reduce((s, c) => s + getLeaves(c.id), 0);
        }

        function layoutNode(node, leftX, y) {
            const ch = childMap[node.id] || [];
            if (!ch.length) {
                positions[node.id] = { x: leftX, y };
                maxX = Math.max(maxX, leftX);
                return;
            }
            let cx = leftX;
            ch.forEach(child => {
                layoutNode(child, cx, y + GAP_Y);
                cx += getLeaves(child.id) * GAP_X;
            });
            const first = positions[ch[0].id];
            const last = positions[ch[ch.length - 1].id];
            positions[node.id] = { x: (first.x + last.x) / 2, y };
        }

        let startX = 80;
        rootNodes.forEach(root => {
            layoutNode(root, startX, 60);
            startX += getLeaves(root.id) * GAP_X + 80;
        });

        // Render
        const totalW = maxX + GAP_X + 100;
        const totalH = Math.max(...Object.values(positions).map(p => p.y)) + 200;
        const containerEl = document.getElementById('skill-tree-container');
        if (!containerEl) return;

        // SVG curved paths
        let paths = '';
        nodes.forEach(n => {
            (childMap[n.id] || []).forEach(child => {
                const p1 = positions[n.id], p2 = positions[child.id];
                if (!p1 || !p2) return;
                const x1 = p1.x + 45, y1 = p1.y + 90;
                const x2 = p2.x + 45, y2 = p2.y;
                const my = (y1 + y2) / 2;
                const done = nodeStatus[n.id] === 'completed' && nodeStatus[child.id] !== 'locked';
                paths += `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" fill="none"
                    stroke="${done ? '#34d399' : '#71717a'}"
                    stroke-width="${done ? 3 : 2}"
                    ${done ? '' : 'stroke-dasharray="6 4"'}
                    ${done ? 'style="filter:drop-shadow(0 0 6px rgba(52,211,153,0.3))"' : ''}/>`;
            });
        });

        const borderColors = {
            completed: 'border-emerald-500/50',
            available: 'border-cyan-500/40',
            locked: 'border-line/10',
        };
        const bgColors = {
            completed: 'bg-emerald-500/10',
            available: 'bg-cyan-500/10',
            locked: 'bg-main/[0.02]',
        };
        const shadows = {
            completed: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]',
            available: 'shadow-[0_0_25px_rgba(34,211,238,0.15)]',
            locked: '',
        };

        containerEl.style.minWidth = totalW + 'px';
        containerEl.style.minHeight = totalH + 'px';

        containerEl.innerHTML = `
            <svg class="absolute inset-0 pointer-events-none" style="min-width:${totalW}px;min-height:${totalH}px">${paths}</svg>
            ${nodes.map(n => {
                const p = positions[n.id];
                if (!p) return '';
                const st = nodeStatus[n.id];
                const total = videosPerNode[n.id] || 0;
                const done = completedPerNode[n.id] || 0;
                const clickable = st !== 'locked';

                return `<div class="absolute flex flex-col items-center gap-2 transition-all duration-300 ${clickable ? 'hover:scale-110 cursor-pointer skill-node-btn' : 'opacity-40'}"
                    style="left:${p.x}px;top:${p.y}px" ${clickable ? `data-node-id="${n.id}"` : ''}>
                    <div class="w-[90px] h-[90px] rounded-2xl border-2 ${borderColors[st]} ${bgColors[st]} ${shadows[st]} flex items-center justify-center overflow-hidden transition-all duration-300 backdrop-blur-sm">
                        ${st === 'locked'
                            ? '<i class="fa-solid fa-lock text-muted/60 text-lg"></i>'
                            : n.image_url
                                ? `<img src="${n.image_url}" class="w-12 h-12 object-contain" alt=""/>`
                                : `<span class="font-black text-xl text-white">${n.name.substring(0, 2).toUpperCase()}</span>`
                        }
                    </div>
                    <span class="text-[11px] font-bold text-center max-w-[110px] ${st === 'locked' ? 'text-muted/60' : 'text-main/80'} leading-tight">${n.name}</span>
                    ${total > 0 ? `<span class="text-[9px] font-black ${st === 'locked' ? 'text-muted/60' : st === 'completed' ? 'text-emerald-400' : 'text-muted'}">${done}/${total}</span>` : ''}
                    ${st === 'completed' ? '<div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"><i class="fa-solid fa-check text-[9px] text-white"></i></div>' : ''}
                </div>`;
            }).join('')}
        `;

    } catch (e) {
        console.error('Skill tree error:', e);
        const el = document.getElementById('skill-tree-container');
        if (el) el.innerHTML = '<p class="text-red-400 text-center p-8">Error loading skill tree</p>';
    }

    // Attach click handlers
    document.querySelectorAll('.skill-node-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const nid = btn.dataset.nodeId;
            if(nid) showVideosModal(nid);
        });
    });
}

async function showVideosModal(nodeId) {
    let modal = document.getElementById('skill-videos-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'skill-videos-modal';
        modal.className = 'fixed inset-0 z-[200] items-center justify-center p-4 bg-black/80 backdrop-blur-md hidden';
        modal.innerHTML = `
            <div class="bg-card w-full max-w-4xl rounded-[2rem] border border-line/10 shadow-theme flex flex-col max-h-[90vh]">
                <div class="flex items-center justify-between p-6 border-b border-line/10 shrink-0">
                    <h2 class="text-xl font-black text-main uppercase tracking-widest"><i class="fa-solid fa-play text-accent mr-2"></i> Node Content</h2>
                    <button class="close-modal w-8 h-8 flex items-center justify-center bg-line/5 hover:bg-line/10 rounded-full text-muted transition-colors">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div id="skill-videos-list" class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 html-scroll custom-scrollbar">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-modal').addEventListener('click', () => modal.classList.add('hidden'));
    }
    const list = document.getElementById('skill-videos-list');
    list.innerHTML = '<div class="col-span-full py-10 flex flex-col items-center justify-center opacity-60"><img src="/assets/loading.gif" class="w-16 h-16 mb-3" alt="Loading"><p class="text-[10px] font-black uppercase text-main">Loading Videos...</p></div>';
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    try {
        const videosList = await content.listVideos(nodeId, 'approved');
        if (!videosList || !videosList.length) {
            list.innerHTML = '<div class="col-span-full py-10 text-center"><p class="text-xs font-bold text-muted uppercase tracking-widest">No accessible videos for this node yet.</p></div>';
            return;
        }

        list.innerHTML = videosList.map((v, i) => {
            const ytId = (v.youtube_url.match(/(?:v=|youtu\.be\/)([\w-]+)/) || [])[1] || '';
            const hasQuiz = !!v.quiz_question;
            const colors = ['fuchsia', 'blue', 'amber', 'emerald', 'sky', 'purple'];
            const col = colors[i % colors.length];

            return `<div class="bg-app/50 border border-line/10 rounded-2xl overflow-hidden hover:border-${col}-500/50 transition-all group flex flex-col shadow-lg cursor-pointer route-to-video" data-video-id="${v.id}">
                <div class="h-32 bg-black relative overflow-hidden shrink-0">
                    <img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" alt=""/>
                    <div class="absolute inset-0 bg-card/40 group-hover:bg-card/20 transition-colors flex items-center justify-center">
                        <div class="w-10 h-10 rounded-full bg-card/60 border border-line/10 flex items-center justify-center text-white backdrop-blur-md shadow-2xl group-hover:scale-110 transition-transform"><i class="fa-solid fa-play ml-0.5 text-xs"></i></div>
                    </div>
                    <span class="absolute bottom-2 right-2 bg-card/80 text-main text-[9px] font-black px-2 py-0.5 rounded backdrop-blur-sm shadow border border-line/10">${v.duration_minutes || 10} min</span>
                    ${hasQuiz ? `<span class="absolute top-2 left-2 bg-accent/90 text-white text-[9px] font-black px-2 py-0.5 rounded-lg border border-accent">Quiz</span>` : ''}
                </div>
                <div class="p-4 flex flex-col flex-1">
                    <h4 class="text-xs font-black text-main group-hover:text-${col}-400 transition-colors mb-2 uppercase line-clamp-2 leading-tight">${v.title}</h4>
                    <p class="text-[9px] text-muted font-bold uppercase tracking-widest mt-auto">${hasQuiz ? '+75' : '+50'} Expbara</p>
                </div>
            </div>`;
        }).join('');

        // Routing click event
        list.querySelectorAll('.route-to-video').forEach(el => {
            el.addEventListener('click', () => {
                modal.classList.add('hidden');
                document.getElementById('app').innerHTML = `<div class="animate-system-boot min-h-full flex items-center justify-center p-8"><img src="/assets/loading.gif" class="w-20 h-20" alt="Loading"></div>`;
                window.location.hash = '#video-player/' + el.dataset.videoId;
            });
        });

    } catch(err) {
        console.error(err);
        list.innerHTML = '<div class="col-span-full py-10 text-center"><p class="text-xs font-bold text-red-400 uppercase tracking-widest">Error Loading Videos</p></div>';
    }
}
