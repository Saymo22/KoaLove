export function initCounters() {
  const numeros = document.querySelectorAll("#layoutPadrao .tempo strong");
  if (!numeros.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const el = en.target;
        const final = parseInt(el.dataset.final || el.textContent.replace(/\D/g, ""), 10);
        const format = el.id === "dias" || el.id === "horas";
        const dur = 1800, t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(final * eased);
          el.textContent = format ? val.toLocaleString("pt-BR") : val;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  numeros.forEach(n => io.observe(n));
}