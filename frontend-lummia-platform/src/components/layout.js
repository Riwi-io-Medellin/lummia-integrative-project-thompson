export function getAppLayout() {
  return /* html */`
    <div id="app-wrapper" class="h-screen w-full flex overflow-hidden relative z-0 transition-colors duration-500">

        <div id="ambient-glows" class="absolute inset-0 pointer-events-none overflow-hidden -z-10 transition-opacity duration-500">
          <div class="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#6D28D9]/20 rounded-full blur-[120px]"></div>
          <div class="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#D946EF]/15 rounded-full blur-[120px]"></div>
        </div>

        <button id="mobile-menu-toggle" class="lg:hidden fixed top-4 left-4 z-[70] p-3 bg-card/80 backdrop-blur-xl border border-line/10 rounded-xl cursor-pointer hover:bg-card transition-colors">
            <i class="fa-solid fa-bars-staggered text-sm text-muted pointer-events-none"></i>
        </button>

        <button id="ai-menu-toggle" class="fixed top-4 right-4 z-[70] w-11 h-11 rounded-xl bg-card/80 backdrop-blur-xl border border-line/10 flex items-center justify-center text-muted hover:text-accent hover:bg-card transition-all cursor-pointer shadow-lg">
            <i class="fa-solid fa-robot text-sm pointer-events-none"></i>
        </button>

        <aside id="nav-container" class="w-64 lg:w-72 h-full flex-shrink-0 flex flex-col transition-all duration-300 fixed lg:relative z-[60] -translate-x-full lg:translate-x-0"></aside>

        <main id="main-container" class="flex-1 h-full relative overflow-y-auto custom-scrollbar p-0 min-w-0"></main>

        <aside id="ai-panel-container" class="fixed lg:absolute right-0 top-0 w-80 lg:w-96 h-full flex-shrink-0 flex flex-col z-[50] transform translate-x-full transition-all duration-300"></aside>

    </div>
  `;
}