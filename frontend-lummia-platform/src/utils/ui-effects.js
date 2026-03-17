export function initLayoutToggle() {
    const toggleBtn = document.getElementById('layout-toggle');
    const shell = document.getElementById('layout-shell');
    const nav = document.getElementById('nav-container');
    const aside = document.getElementById('gamify-container');

    let isHidden = false;

    toggleBtn.addEventListener('click', () => {
        isHidden = !isHidden;

        if (isHidden) {
            // Colaps in full screen mode
            shell.style.gridTemplateColumns = "0px 1fr 0px";
            nav.style.opacity = "0";
            aside.style.opacity = "0";
            toggleBtn.innerHTML = '<i class="fa-solid fa-expand text-xs"></i>';
            toggleBtn.style.boxShadow = "0 0 15px rgba(70,242,22,0.3)";
        } else {
            // Reset original layout
            shell.style.gridTemplateColumns = "260px 1fr 320px";
            nav.style.opacity = "1";
            aside.style.opacity = "1";
            toggleBtn.innerHTML = '<i class="fa-solid fa-bars-staggered text-xs"></i>';
            toggleBtn.style.boxShadow = "none";
        }
    });
}