(function initTechLiveBackground() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "tech-live-bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let nodes = [];
  let raf = 0;
  let t0 = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const area = w * h;
    const target = Math.floor(area / 22000);
    const count = Math.min(95, Math.max(36, target));

    nodes = [];
    for (let i = 0; i < count; i++) {
      const rnd = Math.random;
      nodes.push({
        x: rnd() * w,
        y: rnd() * h,
        vx: prefersReduced ? 0 : (rnd() - 0.5) * 0.38,
        vy: prefersReduced ? 0 : (rnd() - 0.5) * 0.38,
        r: 1.1 + rnd() * 2.1,
        p: rnd() * Math.PI * 2,
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);

    const g1 = ctx.createRadialGradient(w * 0.12, h * 0.18, 0, w * 0.12, h * 0.18, w * 0.5);
    g1.addColorStop(0, "rgba(99, 102, 241, 0.1)");
    g1.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(w * 0.88, h * 0.72, 0, w * 0.88, h * 0.72, h * 0.45);
    g2.addColorStop(0, "rgba(56, 189, 248, 0.08)");
    g2.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    const connectDist = Math.min(148, w * 0.14);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < connectDist) {
          const alpha = (1 - dist / connectDist) * 0.22;
          ctx.strokeStyle = `rgba(165, 180, 252, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    const pulse = prefersReduced ? 0.82 : 0.62 + 0.38 * Math.sin(time * 0.0018);
    for (const n of nodes) {
      n.p += prefersReduced ? 0 : 0.018;
      const glow = 0.42 + 0.38 * Math.sin(n.p);
      ctx.fillStyle = `rgba(56, 189, 248, ${0.1 * glow * pulse})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(221, 232, 255, ${0.45 + 0.4 * glow})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!prefersReduced) {
      const scanY = ((time * 0.018) % (h + 140)) - 70;
      const grad = ctx.createLinearGradient(0, scanY, 0, scanY + 100);
      grad.addColorStop(0, "rgba(34, 211, 238, 0)");
      grad.addColorStop(0.45, "rgba(56, 189, 248, 0.038)");
      grad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY, w, 100);
    }
  }

  function tick(now) {
    if (!t0) t0 = now;
    const time = now - t0;

    if (!prefersReduced) {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -12) n.x = w + 12;
        if (n.x > w + 12) n.x = -12;
        if (n.y < -12) n.y = h + 12;
        if (n.y > h + 12) n.y = -12;
      }
    }

    draw(time);
    if (document.visibilityState === "visible" && !prefersReduced) {
      raf = requestAnimationFrame(tick);
    }
  }

  resize();
  draw(0);

  if (!prefersReduced) {
    raf = requestAnimationFrame(tick);
  }

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        resize();
        draw(0);
        if (!prefersReduced && document.visibilityState === "visible") {
          t0 = 0;
          raf = requestAnimationFrame(tick);
        }
      }, 140);
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (prefersReduced) return;
    if (document.visibilityState === "visible") {
      cancelAnimationFrame(raf);
      t0 = 0;
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
    }
  });
})();

const page = document.body.dataset.page;
const links = document.querySelectorAll(".nav a");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const header = document.querySelector(".site-header");

links.forEach((link) => {
  const href = link.getAttribute("href") || "";
  if ((page === "home" && href === "index.html") || href.startsWith(`${page}.html`)) {
    link.classList.add("active");
  }
  link.addEventListener("click", () => {
    if (nav) nav.classList.remove("open");
  });
});

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
}

const onScroll = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 12);
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
