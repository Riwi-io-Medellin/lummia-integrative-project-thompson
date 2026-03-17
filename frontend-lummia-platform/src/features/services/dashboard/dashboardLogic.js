export function initDashboardLogic() {
  // 1. Live System Clock
  const clockElement = document.getElementById('system-clock');
  let bootTime = 0;

  if (clockElement) {
    // Update every second
    setInterval(() => {
      bootTime++;
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour12: false });
      clockElement.innerText = `System Status: Optimal | ${timeString} | Uptime: ${bootTime}s`;
    }, 1000);
  }

  // 2. Number Counter Animation
  const counters = document.querySelectorAll('.stat-counter');
  
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'));
    const decimals = counter.getAttribute('data-decimals') ? 1 : 0;
    const duration = 1500; // 1.5 seconds animation
    const stepTime = Math.abs(Math.floor(duration / 50)); 
    
    let current = 0;
    const increment = target / 50; 

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.innerText = target.toFixed(decimals);
        clearInterval(timer);
      } else {
        counter.innerText = current.toFixed(decimals);
      }
    }, stepTime);
  });

  // 3. Skill Bars Animation
  // Delay slightly to match the CSS system-boot animation
  setTimeout(() => {
    const skillBars = document.querySelectorAll('.skill-bar');
    skillBars.forEach(bar => {
      const targetWidth = bar.getAttribute('data-width');
      bar.style.width = targetWidth;
    });
  }, 300);

  // 4. Interactive Deployment Logs
  const logCards = document.querySelectorAll('.log-card');
  
  logCards.forEach(card => {
    card.addEventListener('click', () => {
      const statusBadge = card.querySelector('.log-status');
      
      // Simulate checking log details
      const originalText = statusBadge.innerText;
      statusBadge.innerText = 'FETCHING...';
      statusBadge.classList.replace('bg-[#46F216]/10', 'bg-white/10');
      statusBadge.classList.replace('text-[#46F216]', 'text-white');
      
      setTimeout(() => {
        statusBadge.innerText = originalText;
        statusBadge.classList.replace('bg-white/10', 'bg-[#46F216]/10');
        statusBadge.classList.replace('text-white', 'text-[#46F216]');
      }, 800);
    });
  });
}