document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Keep navigation available and native anchors usable with keyboard and history.
  const updateHeader = () => nav.classList.toggle("nav-scrolled", window.scrollY > 30);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const links = [...document.querySelectorAll('.nav-links a')];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
    document.querySelectorAll("main section, footer").forEach((section) => observer.observe(section));
  }
});

// Motion is progressive enhancement: the page remains readable without JavaScript.
document.addEventListener("DOMContentLoaded", () => {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let dispose = () => {};
  const configureMotion = () => {
    dispose();
    if (preference.matches || !("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const targets = [...document.querySelectorAll(
      ".section-heading > *, .metric-card, .project-meta, .project-content, .project-image, .services-inner > *, .about-content > *, .footer-cta > *, footer .divider, .social-links"
    )];
    const frames = new Set();
    const countersDone = new Set();
    const animate = (callback) => {
      const id = requestAnimationFrame((time) => { frames.delete(id); callback(time); });
      frames.add(id);
    };
    const count = (card) => {
      const counter = card.querySelector(".counter");
      if (!counter || countersDone.has(counter)) return;
      countersDone.add(counter);
      const total = Number(counter.dataset.target);
      let start;
      const tick = (time) => {
        start ??= time;
        const progress = Math.min((time - start) / 1100, 1);
        counter.textContent = Math.round(total * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) animate(tick);
      };
      animate(tick);
    };
    const reveal = (element) => {
      element.classList.add("is-visible");
      if (element.matches(".metric-card")) count(element);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) { reveal(target); observer.unobserve(target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -35px 0px" });
    targets.forEach((element) => {
      element.classList.add("scroll-reveal");
      const siblings = [...element.parentElement.children];
      element.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(element), 3) * 75}ms`);
      observer.observe(element);
    });
    root.classList.add("motion-enabled");

    const hero = document.getElementById("hero");
    const photos = [...document.querySelectorAll(".project-image")];
    let pending = false;
    const render = () => {
      pending = false;
      const viewport = window.innerHeight;
      const mobile = window.innerWidth < 800;
      // Read geometry together before updating styles to avoid layout thrashing.
      const heroRect = hero.getBoundingClientRect();
      const positions = photos.map((photo) => photo.getBoundingClientRect());
      const total = root.scrollHeight - viewport;
      root.style.setProperty("--scroll-progress", total > 0 ? window.scrollY / total : 0);
      const progress = Math.min(1, Math.max(0, -heroRect.top / heroRect.height));
      hero.style.setProperty("--hero-shift", `${progress * (mobile ? 22 : 75)}px`);
      hero.style.setProperty("--portrait-shift", `${progress * -45}px`);
      photos.forEach((photo, index) => {
        const rect = positions[index];
        if (rect.bottom < 0 || rect.top > viewport) return;
        const position = (viewport / 2 - rect.top - rect.height / 2) / (viewport + rect.height);
        photo.style.setProperty("--photo-shift", `${position * (mobile ? 24 : 48)}px`);
      });
    };
    const schedule = () => { if (!pending) { pending = true; animate(render); } };
    const onFocus = (event) => {
      const parent = event.target.closest(".scroll-reveal");
      if (parent) reveal(parent);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("focusin", onFocus);
    render();
    dispose = () => {
      observer.disconnect();
      frames.forEach(cancelAnimationFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("focusin", onFocus);
      root.classList.remove("motion-enabled");
      targets.forEach((element) => {
        element.classList.remove("scroll-reveal", "is-visible");
        element.style.removeProperty("--reveal-delay");
      });
      document.querySelectorAll(".counter").forEach((counter) => counter.textContent = counter.dataset.target);
    };
  };
  preference.addEventListener("change", configureMotion);
  configureMotion();
});
