import { content } from '../api/client.js';
import { getState } from '../utils/state.js';

export function renderCourses() {
  const container = document.getElementById('main-container');
  if (!container) return;

  const { user } = getState();
  const session = user || { level: 1, expbara: 0 };
  const progressPercent = Math.min((session.expbara / 1000) * 100, 100).toFixed(0);

  const getYTThumbnail = (url) => {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '../../assets/placeholder-video.jpg';
  };

  const courseSections = [
    { title: 'Python Backend', module: 'python', icon: 'fa-brands fa-python', color: 'blue', shadow: 'rgba(59,130,246,0.5)', scrollTheme: 'python-scroll' },
    { title: 'HTML / CSS Structure', module: 'html', icon: 'fa-brands fa-css3-alt', color: 'fuchsia', shadow: 'rgba(217,70,239,0.5)', scrollTheme: 'html-scroll' },
    { title: 'JavaScript Logic', module: 'javascript', icon: 'fa-brands fa-js', color: 'amber', shadow: 'rgba(245,158,11,0.5)', scrollTheme: 'js-scroll' },
    { title: 'SQL Database', module: 'sql', icon: 'fa-solid fa-database', color: 'emerald', shadow: 'rgba(16,185,129,0.5)', scrollTheme: 'db-scroll' }
  ];

  container.innerHTML = /* html */`
    <div class="animate-in fade-in duration-500 h-full flex flex-col relative z-0 p-4 lg:p-6 lg:px-8 overflow-y-auto custom-scrollbar overflow-x-hidden">
      
      <div class="flex-none mb-6 relative group">
         <div class="relative flex items-center bg-card/40 backdrop-blur-3xl border border-line/5 rounded-[2rem] focus-within:border-accent/50 transition-all shadow-xl px-2">
            <i class="fa-solid fa-magnifying-glass text-muted ml-4 text-lg"></i>
            <input type="text" placeholder="Search for courses, modules, or algorithms..." class="w-full bg-transparent py-5 px-4 text-main text-sm font-medium focus:outline-none placeholder:text-muted">
         </div>
      </div>

      <div class="flex-none bg-card/40 backdrop-blur-3xl border border-line/5 rounded-[2.5rem] p-8 mb-10 relative overflow-hidden shadow-2xl group shrink-0">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-accent/10 rounded-full blur-[80px]"></div>
        <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
           <div class="w-24 h-24 lg:w-28 lg:h-28 rounded-[2rem] bg-app/60 border border-accent/40 flex items-center justify-center text-4xl shadow-2xl transform group-hover:scale-105 transition-all duration-500">
              <i class="fa-solid fa-layer-group text-accent"></i>
           </div>
           <div class="flex-1 text-center md:text-left w-full">
              <h1 class="text-3xl lg:text-4xl font-black text-main tracking-wide mb-4 uppercase">Video Academy</h1>
              <div class="max-w-xl mx-auto md:mx-0">
                 <div class="flex justify-between text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                    <span class="text-accent">Overall Progress</span>
                    <span>${progressPercent}% Mastery</span>
                 </div>
                 <div class="h-3 w-full bg-app/80 rounded-full border border-line/10 overflow-hidden p-[1px]">
                    <div class="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full shadow-[0_0_15px_rgba(217,70,239,0.4)]" style="width: ${progressPercent}%"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div id="courses-grid" class="flex flex-col gap-12 pb-24 min-h-[400px]">
          <div class="flex flex-col items-center justify-center py-20 opacity-60"><img src="/assets/loading.gif" class="w-16 h-16 mb-3" alt="Loading"><span class="text-[10px] font-black text-main uppercase tracking-widest">Loading Library...</span></div>
      </div>
    </div>
  `;

  setTimeout(async () => {
    try {
        const [videos, progress] = await Promise.all([
            content.listVideos(null, 'approved'),
            content.myProgress().catch(() => []) 
        ]);
        
        const completedIds = new Set((progress || []).filter(p => p.status === 'completed').map(p => p.video_id));
        const grid = document.getElementById('courses-grid');
        if (!grid) return;

        let html = '';
        
        courseSections.forEach(sec => {
            // Very simple grouping logic - realistically skill_node_id would map to these, but we'll do a basic filter based on title matching module keyword
            const secVideos = videos.filter(v => v.title.toLowerCase().includes(sec.module) || v.description?.toLowerCase().includes(sec.module));
            
            // If section has no specific matches, we can fallback to dumping extra videos or just skip. 
            // Better to show them if they matched. If no matches, we skip the row.
            if (secVideos.length === 0 && videos.length > 0) return; 

            // If we didn't match keywords, let's just show randomly if it's the first section as fallback so the UI isn't empty
            const renderVideos = secVideos.length > 0 ? secVideos : videos;

            html += `
            <section class="flex flex-col gap-4">
              <div class="px-2 font-black text-main uppercase flex items-center gap-3 text-xl tracking-tighter">
                 <i class="${sec.icon} text-${sec.color}-500 text-3xl"></i> ${sec.title}
              </div>
              <div class="scroll-x-container html-scroll scroll-mask ${sec.scrollTheme} flex overflow-x-auto gap-5 pb-6 px-10 cursor-grab active:cursor-grabbing">
                 ${renderVideos.map((v, i) => {
                    const isDone = completedIds.has(v.id);
                    const thumb = v.video_url ? getYTThumbnail(v.video_url) : '';
                    return `
                    <div data-video-id="${v.id}" class="min-w-[300px] w-[300px] bg-card/60 border border-line/5 rounded-2xl p-3 hover:bg-line/5 transition-all group cursor-pointer shrink-0 shadow-lg relative">
                    ${isDone ? '<div class="absolute -top-2 -right-2 z-30 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white border-2 border-app shadow-lg"><i class="fa-solid fa-check text-xs"></i></div>' : ''}
                    <div class="w-full h-44 bg-app/80 rounded-xl mb-3 relative overflow-hidden border border-line/10 group-hover:border-${sec.color}-500/50 transition-colors flex items-center justify-center">
                        <img src="${thumb}" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" alt=""/>
                        <div class="w-12 h-12 rounded-full bg-card/40 backdrop-blur-sm border border-line/10 flex items-center justify-center text-main group-hover:bg-${sec.color}-500/80 group-hover:border-${sec.color}-500 transition-all z-10 shadow-2xl">
                            <i class="fa-solid fa-play text-sm pl-1"></i>
                        </div>
                        <div class="absolute bottom-0 left-0 w-full h-1 bg-app/50 z-20">
                            <div class="h-full bg-${isDone ? 'emerald' : sec.color}-500 w-[${isDone ? '100' : '0'}%]" style="box-shadow: 0 0 10px ${sec.shadow}"></div>
                        </div>
                    </div>
                    <h4 class="text-sm font-black text-main group-hover:text-${sec.color}-400 transition-colors mb-1 truncate uppercase tracking-tight">${v.title}</h4>
                    <p class="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                        <span class="opacity-60 truncate">${v.description || 'Video Lesson'}</span>
                    </p>
                    </div>`;
                 }).join('')}
              </div>
            </section>
            `;
        });

        if (html === '') html = '<p class="text-center text-sm text-muted p-10">No videos cataloged yet.</p>';
        grid.innerHTML = html;

        // Navigate to video player on card click
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('[data-video-id]');
            if (card) {
                const vid = card.dataset.videoId;
                if (vid) window.location.hash = 'video-player/' + vid;
            }
        });

        setTimeout(initDragToScroll, 100);

    } catch(e) {
        console.error(e);
        const grid = document.getElementById('courses-grid');
        if (grid) grid.innerHTML = '<p class="text-red-400 text-sm p-10 text-center">Failed to load courses</p>';
    }
  }, 50);
}

function initDragToScroll() {
    const sliders = document.querySelectorAll('.scroll-x-container');
    
    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault(); 
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; 
            slider.scrollLeft = scrollLeft - walk;
        });
    });
}