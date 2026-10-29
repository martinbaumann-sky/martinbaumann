// Links de contacto: pega tu link en CALENDLY_URL y todos los botones "Agendar" lo usarán.
// Mientras esté vacío, esos botones abren WhatsApp.
const CALENDLY_URL = "";
const WHATSAPP_URL =
  "https://wa.me/56999444522?text=" +
  encodeURIComponent("Hola Martin, quiero conversar sobre un diagnóstico de IA para mi empresa.");

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupLinks() {
  document.querySelectorAll("[data-cta]").forEach((link) => {
    link.href = link.dataset.cta === "calendly" && CALENDLY_URL ? CALENDLY_URL : WHATSAPP_URL;
    link.target = "_blank";
    link.rel = "noopener";
  });
}

// Barra superior: fondo al bajar, se esconde al bajar y vuelve al subir
function setupTopbar() {
  const topbar = document.querySelector(".topbar");
  let lastY = 0;
  const update = (y) => {
    topbar.classList.toggle("is-scrolled", y > 8);
    topbar.classList.toggle("is-hidden", y > 400 && y > lastY);
    lastY = y;
  };
  update(window.scrollY);
  window.addEventListener("scroll", () => update(window.scrollY), { passive: true });
}

// Botón fijo en celular: visible después de la portada y escondido en el cierre
function setupMobileCta() {
  const cta = document.querySelector(".mobile-cta");
  if (!cta || !("IntersectionObserver" in window)) return;
  const inView = { hero: true, closing: false };
  const update = () => cta.classList.toggle("is-visible", !inView.hero && !inView.closing);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inView[entry.target.id === "contacto" ? "closing" : "hero"] = entry.isIntersecting;
    });
    update();
  });
  observer.observe(document.querySelector(".hero-actions"));
  observer.observe(document.querySelector("#contacto"));
}

// Envuelve cada palabra en <span class="w"> conservando <em> y otros tags
function splitWords(el) {
  const masked = el.dataset.split === "mask";
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const w = document.createElement("span");
          w.className = "w";
          if (masked) {
            const inner = document.createElement("span");
            inner.className = "wi";
            inner.textContent = part;
            w.appendChild(inner);
          } else {
            w.textContent = part;
          }
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
}

function setupMotion() {
  const { gsap, ScrollTrigger, Lenis } = window;
  if (reduceMotion || !gsap || !ScrollTrigger) {
    root.classList.add("motion-ready");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Scroll suave
  if (Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = a.getAttribute("href");
        if (target.length < 2) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -72, duration: 1.4 });
      });
    });
  }

  document.querySelectorAll("[data-split]").forEach(splitWords);
  root.classList.add("motion-ready");

  // Intro de la portada
  const intro = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.3 } });
  intro
    .from(".hero-title .wi", { yPercent: 110, stagger: 0.05 })
    .from("[data-intro]", { y: 24, autoAlpha: 0, stagger: 0.1, duration: 1.1 }, 0.4);

  // Portada al bajar: el título se aleja y se desvanece
  gsap.to(".hero-copy", {
    y: -80,
    autoAlpha: 0.15,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // El problema: las palabras se encienden a medida que bajas
  gsap.fromTo(
    ".manifesto-text .w",
    { opacity: 0.12 },
    {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: { trigger: ".manifesto-text", start: "top 80%", end: "bottom 45%", scrub: true },
    }
  );

  // Títulos y bloques que entran
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el.children.length && !el.matches(".hero-actions, .cta-inline") ? el.children : el, {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  gsap.utils.toArray("[data-stagger]").forEach((group) => {
    gsap.from(group.children, {
      y: 60,
      autoAlpha: 0,
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: group, start: "top 85%" },
    });
  });

  // Oferta: cada tarjeta se achica un poco cuando la siguiente la tapa
  const cards = gsap.utils.toArray(".offer-card");
  cards.forEach((card, i) => {
    gsap.from(card, {
      y: 80,
      autoAlpha: 0,
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: { trigger: card, start: "top 90%" },
    });
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.94,
      ease: "none",
      scrollTrigger: { trigger: next, start: "top 85%", end: "top 25%", scrub: true },
    });
  });

  // Proyectos: las líneas se dibujan y las filas suben
  gsap.utils.toArray(".projects li").forEach((row) => {
    gsap
      .timeline({ scrollTrigger: { trigger: row, start: "top 88%" } })
      .fromTo(row, { "--line": 0 }, { "--line": 1, duration: 1.2, ease: "expo.inOut" })
      .from(row.querySelector(".project"), { y: 30, autoAlpha: 0, duration: 1, ease: "expo.out" }, 0.2);
  });

  // Cierre: "Hablemos." crece mientras llega al centro
  gsap.fromTo(
    "[data-closing]",
    { scale: 0.7, autoAlpha: 0.1, y: 60 },
    {
      scale: 1,
      autoAlpha: 1,
      y: 0,
      ease: "none",
      scrollTrigger: { trigger: ".closing", start: "top 90%", end: "top 30%", scrub: true },
    }
  );

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

document.addEventListener("DOMContentLoaded", () => {
  setupLinks();
  setupTopbar();
  setupMobileCta();
  setupMotion();
});
