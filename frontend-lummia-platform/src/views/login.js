// src/views/login.js
import { auth, setToken } from '../api/client.js';
import { setState } from '../utils/state.js';
import { navigateTo } from '../utils/router.js';
import { ThemeManager } from '../utils/themeManager.js';

export const renderLogin = () => {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '';

    const currentTheme = ThemeManager.current();

    app.innerHTML = /* html */`
        <div id="login-wrapper" class="relative min-h-screen w-full bg-app text-main flex overflow-hidden transition-colors duration-500">

            <div class="absolute inset-0 pointer-events-none z-0">
                <div class="absolute -top-40 -left-40 w-[600px] h-[600px] bg-fuchsia-600/10 bg-accent/10 rounded-full blur-[120px] animate-pulse"></div>
                <div class="absolute bottom-0 right-0 w-[800px] h-[800px] bg-fuchsia-600/5 bg-accent/5 rounded-full blur-[150px]"></div>
            </div>

            <div id="leaves-container" class="absolute inset-0 pointer-events-none z-10 overflow-hidden"></div>

            <div class="absolute top-1/2 left-0 z-10 pointer-events-none animate-capybara-cruise">
                <img src="../../assets/capybara.png" alt="Capybara" class="animate-capybara-bob drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            </div>

            <div class="hidden lg:flex flex-col justify-center w-[55%] p-20 relative z-20">
                <div class="relative z-20 space-y-8 max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">

                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 backdrop-blur-md">
                        <span class="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                        <span class="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.3em]">Thomson Clan Protocol</span>
                    </div>

                    <h1 class="text-7xl font-black tracking-tighter leading-[0.9]">
                        EVOLVE YOUR <br>
                        <span class="text-fuchsia-500 italic">CODE.</span>
                    </h1>

                    <p class="text-muted text-lg leading-relaxed font-medium max-w-md">
                        The definitive ecosystem for <span class="text-main font-bold">Backend Architects</span>.
                        Level up your logic, master complex systems, and conquer the legendary Skill Tree.
                    </p>

                    <div class="pt-8 grid grid-cols-2 gap-4 max-w-lg">
                        <div class="flex items-start gap-4 p-5 rounded-2xl bg-main/[0.02] border border-line/10 backdrop-blur-sm group hover:bg-main/[0.05] transition-all">
                            <i class="fa-solid fa-code-branch text-fuchsia-500 mt-1 text-xl group-hover:scale-110 transition-transform"></i>
                            <div>
                                <h4 class="text-sm font-black uppercase text-main tracking-tight">Skill Paths</h4>
                                <p class="text-[10px] text-muted leading-tight uppercase font-bold tracking-widest mt-1">Interactive roadmap.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-4 p-5 rounded-2xl bg-main/[0.02] border border-line/10 backdrop-blur-sm group hover:bg-main/[0.05] transition-all">
                            <i class="fa-solid fa-microchip text-fuchsia-500 mt-1 text-xl group-hover:scale-110 transition-transform"></i>
                            <div>
                                <h4 class="text-sm font-black uppercase text-main tracking-tight">Core Logic</h4>
                                <p class="text-[10px] text-muted leading-tight uppercase font-bold tracking-widest mt-1">Backend Mastery.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full lg:w-[45%] flex items-center justify-center p-6 relative z-20">
                <div class="relative w-full max-w-[420px] bg-card/50 backdrop-blur-[20px] border border-line/20 rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
                    <form id="form-login" class="w-full flex flex-col">
                        <h3 class="text-4xl font-black mb-2 text-main uppercase tracking-tighter">Initialize</h3>
                        <p class="text-muted text-[10px] mb-8 uppercase tracking-[0.3em] font-black">Identity Verification</p>

                        <input type="email" id="login-email" placeholder="Email" required class="w-full p-4 mb-4 bg-main/5 border border-line/10 rounded-2xl text-main outline-none focus:border-fuchsia-500 transition-all">
                        <input type="password" id="login-password" placeholder="Password" required class="w-full p-4 mb-6 bg-main/5 border border-line/10 rounded-2xl text-main outline-none focus:border-fuchsia-500 transition-all">

                        <button type="submit" id="btn-login" class="w-full py-4 bg-fuchsia-600 text-white font-black rounded-2xl hover:bg-fuchsia-500 transition-all uppercase tracking-widest text-xs cursor-pointer">
                            Connect to Clan
                        </button>

                        <p id="error-login" class="hidden mt-4 text-red-400 text-[10px] font-bold text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20"></p>

                        <p class="mt-8 text-muted text-[10px] text-center uppercase font-bold tracking-widest">
                            Issues? Contact your Tech Lead.
                        </p>
                    </form>
                </div>
            </div>

            <div class="absolute bottom-6 right-6 z-30 flex gap-1.5 bg-card/40 backdrop-blur-xl p-1.5 rounded-xl border border-line/10">
                <button data-theme="neon" class="login-theme-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-main/10 cursor-pointer ${currentTheme === 'neon' ? 'bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-400' : 'text-muted'}">
                    <i class="fa-solid fa-wand-magic-sparkles text-[10px] pointer-events-none"></i>
                </button>
                <button data-theme="black" class="login-theme-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-main/10 cursor-pointer ${currentTheme === 'black' ? 'bg-zinc-800 border border-zinc-700 text-white' : 'text-muted'}">
                    <i class="fa-solid fa-moon text-[10px] pointer-events-none"></i>
                </button>
                <button data-theme="white" class="login-theme-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-main/10 cursor-pointer ${currentTheme === 'white' ? 'bg-white border border-zinc-200 text-zinc-900 shadow-sm' : 'text-muted'}">
                    <i class="fa-solid fa-sun text-[10px] pointer-events-none"></i>
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        initLeafAnimations();
        initLoginLogic();
        initLoginThemeButtons();
        applyLoginTheme(currentTheme);
    }, 0);
};

function initLeafAnimations() {
    const leavesContainer = document.getElementById("leaves-container");
    if (!leavesContainer) return;
    const leafColors = ["leaf-accent", "leaf-fuchsia", "leaf-purple", "leaf-blue"];
    for (let i = 0; i < 18; i++) {
        const leaf = document.createElement("div");
        leaf.classList.add("leaf", leafColors[Math.floor(Math.random() * leafColors.length)]);
        leaf.style.left = Math.random() * 100 + "%";
        leaf.style.setProperty("--leaf-size", (25 + Math.random() * 25) + "px");
        leaf.style.animationDelay = (Math.random() * 12) + "s";
        leavesContainer.appendChild(leaf);
    }
}

function initLoginThemeButtons() {
    document.querySelectorAll('.login-theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            ThemeManager.apply(theme);
            applyLoginTheme(theme);
            updateLoginThemeButtons(theme);
        });
    });
}

function updateLoginThemeButtons(theme) {
    document.querySelectorAll('.login-theme-btn').forEach(b => {
        b.className = `login-theme-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-main/10 cursor-pointer text-muted`;
    });

    const activeBtn = document.querySelector(`.login-theme-btn[data-theme="${theme}"]`);
    if (!activeBtn) return;

    if (theme === 'neon') {
        activeBtn.className = 'login-theme-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-400';
    } else if (theme === 'black') {
        activeBtn.className = 'login-theme-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-zinc-800 border border-zinc-700 text-white';
    } else if (theme === 'white') {
        activeBtn.className = 'login-theme-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-white border border-zinc-200 text-zinc-900 shadow-sm';
    }
}

function applyLoginTheme(theme) {
    const wrapper = document.getElementById('login-wrapper');
    if (!wrapper) return;

    wrapper.className = 'relative min-h-screen w-full bg-app text-main flex overflow-hidden transition-colors duration-500';
}

function initLoginLogic() {
    const form = document.getElementById('form-login');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-login');
        const errorMsg = document.getElementById('error-login');
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        btn.innerHTML = '<img src="/assets/loading.gif" class="w-5 h-5 inline mx-auto" alt="Loading">';
        btn.disabled = true;
        errorMsg.classList.add('hidden');

        try {
            const data = await auth.login(email, password);
            setToken(data.access_token);
            setState({ user: data.user, isAuthenticated: true });

            btn.className = 'w-full py-4 bg-emerald-500 text-white font-black rounded-2xl uppercase text-xs';
            btn.innerHTML = 'SUCCESS <i class="fa-solid fa-check"></i>';
            setTimeout(() => navigateTo(data.must_change_password ? 'profile' : 'home'), 800);
        } catch (error) {
            btn.innerHTML = 'Connect to Clan';
            btn.disabled = false;
            errorMsg.innerText = error.message || 'Authentication Error';
            errorMsg.classList.remove('hidden');
        }
    });
}
