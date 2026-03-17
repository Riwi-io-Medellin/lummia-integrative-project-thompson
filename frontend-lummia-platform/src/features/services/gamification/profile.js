export function renderGamifySection() {
    const container = document.getElementById('gamify-container');
    if (!container) return;

    container.innerHTML = /* html */`
        <div class="p-6 space-y-6">
            <div class="bg-black/20 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-lummia-orange to-red-500 flex items-center justify-center text-white font-black text-xl shadow-lg">MA</div>
                    <div>
                        <h4 class="text-white font-bold">MatiasAC110508</h4>
                        <p class="text-[9px] text-lummia-slate font-bold uppercase tracking-widest">Dev Ops Elite</p>
                    </div>
                </div>
                <div class="flex justify-between text-[9px] font-bold uppercase mb-2">
                    <span class="text-lummia-orange">Exp Progress</span>
                    <span class="text-lummia-slate">78%</span>
                </div>
                <div class="h-2 bg-lummia-bg rounded-full overflow-hidden border border-white/5">
                    <div class="h-full bg-lummia-orange w-[78%] shadow-[0_0_15px_rgba(244,99,40,0.5)]"></div>
                </div>
            </div>

            <div class="bg-lummia-dark-green/10 p-8 rounded-[2rem] border border-lummia-lime/5 text-center relative">
                <p class="text-[10px] font-black text-lummia-lime uppercase tracking-[0.2em] mb-6">Capy Advisor •</p>
                <div class="w-24 h-24 bg-lummia-bg rounded-full mx-auto mb-6 flex items-center justify-center border border-lummia-slate/20">
                    <i class="fa-solid fa-microchip text-4xl text-lummia-slate/40"></i>
                </div>
                <p class="text-[11px] font-medium text-lummia-slate italic leading-relaxed">
                   "This palette looks powerful, Matias. Ready to build something big?"
                </p>
            </div>
        </div>
    `;
}