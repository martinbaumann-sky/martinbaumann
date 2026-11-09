// Links de contacto: pega tu link de Calendly en CALENDLY_URL (por ejemplo "https://calendly.com/tu-usuario/30min").
// Con link: el calendario aparece dentro de la página, en #agenda, y los botones "Agendar" bajan hasta él.
// Sin link: los botones "Agendar" abren WhatsApp.
const CALENDLY_URL = "https://calendly.com/martin_baumann/30min";
const WHATSAPP_URL =
  "https://wa.me/56999444522?text=" +
  encodeURIComponent("Hola Martin, vi tu web y quiero conversar sobre IA para mi empresa.");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Medición con Vercel Web Analytics. Los eventos se ven en Vercel → Analytics → Events.
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
function track(name, data) {
  // Evento personalizado (solo se lee en el plan Pro de Vercel)
  try { window.va("event", { name, data }); } catch (e) {}
  // Copia gratis: una "visita" a una ruta interna /_evento/... que el plan Hobby sí cuenta.
  // El panel la separa de las visitas reales filtrando las rutas que empiezan con /_evento.
  try {
    const parts = [name, ...Object.values(data || {})].map((v) => String(v).toLowerCase().replace(/[^a-z0-9-]+/g, "-"));
    const path = "/_evento/" + parts.join("/");
    window.va("pageview", { route: "/_evento/" + parts[0], path });
  } catch (e) {}
}
const whereIs = (el) => (el.closest(".mobile-cta") ? "boton-fijo" : el.closest(".topbar") ? "barra" : (el.closest("section") || {}).id || "otro");

// Pasa los utm_ de la visita (por ejemplo, utm_source=instagram) a Calendly
function utmParams() {
  const out = {};
  new URLSearchParams(location.search).forEach((v, k) => { if (k.startsWith("utm_")) out[k] = v; });
  return out;
}

function setupLinks() {
  document.querySelectorAll("[data-cta]").forEach((link) => {
    link.addEventListener("click", () => track("clic_cta", { tipo: link.dataset.cta === "calendly" && CALENDLY_URL ? "agendar" : "whatsapp", lugar: whereIs(link) }));
    if (link.dataset.cta === "calendly" && CALENDLY_URL) {
      link.href = "#agenda";
      return;
    }
    link.href = WHATSAPP_URL;
    link.target = "_blank";
    link.rel = "noopener";
  });
}

// Calendario de Calendly dentro de la página (solo si hay link)
function setupCalendly() {
  const slot = document.querySelector("#agenda");
  if (!slot || !CALENDLY_URL) return;
  const url = new URL(CALENDLY_URL);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("background_color", "f7f5f2");
  url.searchParams.set("text_color", "111111");
  url.searchParams.set("primary_color", "111111");
  Object.entries(utmParams()).forEach(([k, v]) => url.searchParams.set(k, v));
  const widget = document.createElement("div");
  widget.className = "calendly-inline-widget";
  widget.dataset.url = url.toString();
  slot.appendChild(widget);
  slot.hidden = false;
  const script = document.createElement("script");
  script.src = "https://assets.calendly.com/assets/external/widget.js";
  script.async = true;
  document.body.appendChild(script);

  // Eventos de Calendly: ver el calendario, elegir hora y agendar
  window.addEventListener("message", (e) => {
    if (!/calendly\.com$/.test(new URL(e.origin).hostname) || !e.data || !e.data.event) return;
    if (e.data.event === "calendly.date_and_time_selected") track("calendly_hora_elegida");
    if (e.data.event === "calendly.event_scheduled") track("agendamiento");
  });
  if ("IntersectionObserver" in window) {
    const seen = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { track("calendly_visto"); seen.disconnect(); }
    }, { threshold: 0.3 });
    seen.observe(slot);
  }
}

// Barra superior: fondo al bajar, se esconde al bajar y vuelve al subir
function setupTopbar() {
  const topbar = document.querySelector(".topbar");
  let lastY = 0;
  const update = (y) => {
    topbar.classList.toggle("is-scrolled", y > 8);
    lastY = y;
  };
  update(window.scrollY);
  window.addEventListener("scroll", () => update(window.scrollY), { passive: true });
}

// Botón fijo en celular: visible después de la portada y escondido en el cierre
function setupMobileCta() {
  const cta = document.querySelector(".mobile-cta");
  if (!cta || !("IntersectionObserver" in window)) return;
  // Se esconde mientras haya otro botón de agendar en pantalla (portada, cajas intermedias y cierre)
  const targets = [document.querySelector(".hero-actions"), ...document.querySelectorAll(".cta-inline"), document.querySelector("#contacto")].filter(Boolean);
  const visible = new Set(targets);
  const update = () => cta.classList.toggle("is-visible", visible.size === 0);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
    update();
  });
  targets.forEach((t) => observer.observe(t));
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
  if (reduceMotion || !gsap || !ScrollTrigger) return;
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

  // La intro de la portada está en styles.css. Portada al bajar: el título se aleja y se desvanece
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
      y: 40,
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

// Origen de la visita (por ejemplo ?utm_source=instagram), una vez por sesión del navegador
function trackOrigin() {
  const src = utmParams().utm_source;
  if (!src) return;
  try {
    if (sessionStorage.getItem("mb_origen") === src) return;
    sessionStorage.setItem("mb_origen", src);
  } catch (e) {}
  track("origen", { fuente: src });
}

document.addEventListener("DOMContentLoaded", () => {
  trackOrigin();
  setupLinks();
  setupCalendly();
  setupTopbar();
  setupMobileCta();
  setupMotion();
});
