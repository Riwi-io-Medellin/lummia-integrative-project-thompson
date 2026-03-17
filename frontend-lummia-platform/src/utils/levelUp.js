// src/utils/levelUp.js - Level-up celebration overlay

export function showLevelUp(level, rankName) {
    // Remove existing overlay if any
    const existing = document.getElementById('level-up-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'level-up-overlay';
    overlay.innerHTML = `
        <style>
            @keyframes levelUpScale {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.1); opacity: 1; }
                70% { transform: scale(0.95); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes levelUpGlow {
                0%, 100% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); }
                50% { box-shadow: 0 0 80px rgba(168, 85, 247, 0.6), 0 0 120px rgba(217, 70, 239, 0.3); }
            }
            @keyframes particleFly {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
            }
            @keyframes fadeOut {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
            #level-up-overlay {
                position: fixed; inset: 0; z-index: 99999;
                display: flex; align-items: center; justify-content: center;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
            }
            .lu-card {
                animation: levelUpScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, levelUpGlow 2s ease-in-out infinite;
                background: linear-gradient(135deg, rgba(88, 28, 135, 0.8), rgba(15, 10, 30, 0.95));
                border: 2px solid rgba(168, 85, 247, 0.4);
                border-radius: 2.5rem; padding: 3rem 4rem;
                text-align: center; position: relative; overflow: hidden;
            }
            .lu-card::before {
                content: ''; position: absolute; inset: 0;
                background: radial-gradient(circle at 50% 30%, rgba(217, 70, 239, 0.15), transparent 70%);
            }
            .lu-particles { position: absolute; inset: 0; pointer-events: none; }
            .lu-particle {
                position: absolute; width: 6px; height: 6px; border-radius: 50%;
                left: 50%; top: 50%;
                animation: particleFly 1.5s ease-out forwards;
            }
            .lu-dismiss { animation: fadeOut 0.4s ease-out forwards; }
        </style>
        <div class="lu-card">
            <div class="lu-particles" id="lu-particles"></div>
            <div style="position:relative;z-index:10">
                <p style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.3em;color:rgba(217,70,239,0.8);margin-bottom:8px;">Level Up!</p>
                <p style="font-size:64px;font-weight:900;color:white;line-height:1;margin-bottom:4px;text-shadow:0 0 30px rgba(168,85,247,0.5);">${level}</p>
                ${rankName ? `<p style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;color:rgba(168,85,247,0.9);margin-top:12px;">${rankName}</p>` : ''}
                <p style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:16px;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;">Click to continue</p>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Generate particles
    const particlesEl = document.getElementById('lu-particles');
    const colors = ['#a855f7', '#d946ef', '#f59e0b', '#34d399', '#60a5fa', '#f472b6'];
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'lu-particle';
        const angle = (Math.PI * 2 * i) / 30;
        const dist = 80 + Math.random() * 120;
        p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        p.style.background = colors[i % colors.length];
        p.style.animationDelay = `${Math.random() * 0.3}s`;
        particlesEl.appendChild(p);
    }

    // Dismiss on click or after 4 seconds
    const dismiss = () => {
        overlay.classList.add('lu-dismiss');
        setTimeout(() => overlay.remove(), 400);
    };

    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
}
