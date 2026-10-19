export function initReveal() {
  const els = document.querySelectorAll(".reveal, .passos, .categoria-titulo, .mask-reveal, .numeros, .incluso-item");
  if (!("IntersectionObserver" in window)) {
    els.forEach(e => e.classList.add("on"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("on");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  els.forEach(el => io.observe(el));
}