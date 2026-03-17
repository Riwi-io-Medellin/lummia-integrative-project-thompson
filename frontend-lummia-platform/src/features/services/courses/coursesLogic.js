export function initCoursesLogic() {
    const containers = document.querySelectorAll('.scroll-x-container');

    containers.forEach(container => {
        let targetX = container.scrollLeft;
        let currentX = container.scrollLeft;
        let isDragging = false;
        let startX, scrollLeft;
        let rafId = null;

        // Friction: Lower = Silkier. 0.07 is the premium sweet spot.
        const friction = 0.07; 
        const lerp = (start, end, factor) => start + (end - start) * factor;

        // 1. Mouse Wheel Mapping
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            // Multiplier (1.5) for comfortable travel speed
            targetX += e.deltaY * 1.5; 
            
            const maxScroll = container.scrollWidth - container.clientWidth;
            targetX = Math.max(0, Math.min(targetX, maxScroll));
            
            if (!rafId) startAnimation();
        }, { passive: false });

        // 2. Click and Drag (Momentum)
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            container.classList.add('cursor-grabbing');
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            cancelAnimationFrame(rafId);
            rafId = null;
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            container.classList.remove('cursor-grabbing');
            targetX = container.scrollLeft; 
            startAnimation();
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
            currentX = container.scrollLeft;
            targetX = currentX;
        });

        // 3. Animation Loop (The Fluid Engine)
        function startAnimation() {
            function render() {
                if (!isDragging) {
                    currentX = lerp(currentX, targetX, friction);
                    container.scrollLeft = currentX;

                    if (Math.abs(targetX - currentX) > 0.1) {
                        rafId = requestAnimationFrame(render);
                    } else {
                        rafId = null;
                    }
                }
            }
            rafId = requestAnimationFrame(render);
        }
    });
}