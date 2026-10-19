export function initNav() {
  const progress = document.getElementById("scrollProgress");
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = pct + "%";
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }, { passive: true });
}