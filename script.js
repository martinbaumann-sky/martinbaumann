document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const supabaseConfig = window.MARTINBAUMANN_SUPABASE || {};
  const getSupabaseClient = (() => {
    let client;
    let resolved = false;

    return () => {
      if (resolved) return client;
      resolved = true;

      const publicKey = supabaseConfig.publishableKey || supabaseConfig.anonKey;
      const hasConfig = supabaseConfig.enabled !== false && supabaseConfig.url && publicKey;
      const canCreateClient = window.supabase && typeof window.supabase.createClient === "function";
      if (!hasConfig || !canCreateClient) {
        client = null;
        return client;
      }

      client = window.supabase.createClient(supabaseConfig.url, publicKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });

      return client;
    };
  })();

  const getVisitorContext = () => ({
    source_path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
  });

  const insertSupabaseRow = async (table, payload) => {
    const client = getSupabaseClient();
    if (!client || !table) {
      return {
        ok: false,
        error: {
          code: "CONFIG_MISSING",
          message: "Supabase no está configurado.",
        },
      };
    }

    const { error } = await client.from(table).insert(payload);
    if (error) return { ok: false, error };
    return { ok: true };
  };

  // Mouse Blob Follower
  const blob = document.getElementById("cursor-blob");
  if (blob && !prefersReducedMotion && !isCoarsePointer) {
    let blobFrame = 0;
    document.addEventListener("mousemove", (e) => {
      if (blobFrame) return;
      blobFrame = window.requestAnimationFrame(() => {
        blob.style.transform = `translate3d(${e.clientX - 200}px, ${e.clientY - 200}px, 0)`;
        blobFrame = 0;
      });
    }, { passive: true });
  }

  // Parallax Effect
  const nav = document.querySelector("nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const parallaxTexts = Array.from(document.querySelectorAll(".parallax-text"));
  const profilePic = document.querySelector(".profile-pic-container");
  let scrollFrame = 0;

  const handleScroll = () => {
    const scroll = window.pageYOffset;
    if (nav) nav.classList.toggle("nav-scrolled", scroll > 12);

    if (!prefersReducedMotion && !isCoarsePointer) {
      parallaxTexts.forEach((text) => {
        const speed = text.getAttribute("data-speed");
        if (speed) {
          text.style.transform = `translate3d(${scroll * parseFloat(speed) * 0.1}px, 0, 0)`;
        }
      });
    }

    if (profilePic) {
      profilePic.style.opacity = Math.max(0, 1 - scroll / 300);
    }
  };
  
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      handleScroll();
      scrollFrame = 0;
    });
  }, { passive: true });
  handleScroll();

  if (navToggle && navMenu) {
    const closeMenu = () => {
      nav.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  const trackEvent = (name, details = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...details });
    window.dispatchEvent(new CustomEvent("martinbaumann:analytics", { detail: { name, ...details } }));
  };

  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      trackEvent(element.dataset.track, {
        destination: element.getAttribute("href") || null,
        page: window.location.pathname,
      });
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      if (href && href !== '#') {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // Current year setup
  const year = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = year;

  // Metrics Counter Animation
  const counters = document.querySelectorAll('.counter');
  let hasAnimated = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000; // 2 seconds animation
      const increment = target / (duration / 16); // assuming 60fps (~16ms per frame)

      let current = 0;
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.innerText = Math.ceil(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target;
        }
      };
      updateCounter();
    });
  };

  const metricsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasAnimated) {
      hasAnimated = true;
      animateCounters();
    }
  }, { threshold: 0.5 });

  const metricsSection = document.getElementById('metricas');
  if (metricsSection) {
    metricsObserver.observe(metricsSection);
  }

  // MVP Map Tool
  const mapTool = document.querySelector("[data-mvp-map]");
  if (mapTool) {
    const storageKey = "martinbaumann_mvp_map_v1";
    const tabs = Array.from(mapTool.querySelectorAll("[data-map-tab]"));
    const panels = Array.from(mapTool.querySelectorAll("[data-map-panel]"));
    const fields = Array.from(mapTool.querySelectorAll("[data-map-field]"));
    const checks = Array.from(mapTool.querySelectorAll("[data-map-check]"));
    const progressText = mapTool.querySelector("[data-map-progress]");
    const progressFill = mapTool.querySelector("[data-map-progress-fill]");
    const prevButton = mapTool.querySelector("[data-map-prev]");
    const nextButton = mapTool.querySelector("[data-map-next]");
    const copyButton = mapTool.querySelector("[data-map-copy]");
    const resetButton = mapTool.querySelector("[data-map-reset]");
    const feedback = mapTool.querySelector("[data-map-feedback]");
    let activeStep = 0;
    let feedbackTimer;

    const readState = () => {
      try {
        return JSON.parse(localStorage.getItem(storageKey)) || {};
      } catch {
        return {};
      }
    };

    const writeState = () => {
      const state = {
        activeStep,
        fields: {},
        checks: {},
      };

      fields.forEach((field) => {
        state.fields[field.dataset.mapField] = field.value;
      });

      checks.forEach((check) => {
        state.checks[check.dataset.mapCheck] = check.checked;
      });

      localStorage.setItem(storageKey, JSON.stringify(state));
    };

    const showFeedback = (message) => {
      if (!feedback) return;
      feedback.textContent = message;
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => {
        feedback.textContent = "";
      }, 3000);
    };

    const updateProgress = () => {
      const completedFields = fields.filter((field) => field.value.trim().length > 0).length;
      const completedChecks = checks.filter((check) => check.checked).length;
      const totalItems = fields.length + checks.length;
      const progress = totalItems ? Math.round(((completedFields + completedChecks) / totalItems) * 100) : 0;

      if (progressText) progressText.textContent = progress;
      if (progressFill) progressFill.style.width = `${progress}%`;
    };

    const setStep = (step) => {
      activeStep = Math.max(0, Math.min(step, panels.length - 1));

      tabs.forEach((tab) => {
        const isActive = Number(tab.dataset.mapTab) === activeStep;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach((panel) => {
        panel.classList.toggle("active", Number(panel.dataset.mapPanel) === activeStep);
      });

      if (prevButton) prevButton.disabled = activeStep === 0;
      if (nextButton) nextButton.textContent = activeStep === panels.length - 1 ? "Finalizar" : "Siguiente";
      writeState();
    };

    const buildSummary = () => {
      const lines = ["Mapa de Idea a MVP con IA", ""];

      fields.forEach((field) => {
        const value = field.value.trim();
        if (!value) return;
        lines.push(`${field.dataset.summaryLabel || field.dataset.mapField}:`);
        lines.push(value);
        lines.push("");
      });

      const completedChecks = checks
        .filter((check) => check.checked)
        .map((check) => check.parentElement.textContent.trim());

      if (completedChecks.length) {
        lines.push("Checks completados:");
        completedChecks.forEach((item) => lines.push(`- ${item}`));
      }

      return lines.join("\n").trim();
    };

    const copySummary = async () => {
      const summary = buildSummary();
      if (!summary || summary === "Mapa de Idea a MVP con IA") {
        showFeedback("Completa al menos un campo antes de copiar el resumen.");
        return;
      }

      try {
        await navigator.clipboard.writeText(summary);
        showFeedback("Resumen copiado. Puedes pegarlo en Notion, Docs o ChatGPT.");
      } catch {
        const temp = document.createElement("textarea");
        temp.value = summary;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
        showFeedback("Resumen copiado.");
      }
    };

    const resetMap = () => {
      const confirmed = window.confirm("¿Quieres limpiar todas tus respuestas del mapa?");
      if (!confirmed) return;

      fields.forEach((field) => {
        field.value = "";
      });
      checks.forEach((check) => {
        check.checked = false;
      });
      activeStep = 0;
      localStorage.removeItem(storageKey);
      updateProgress();
      setStep(0);
      showFeedback("Mapa limpio.");
    };

    const savedState = readState();
    fields.forEach((field) => {
      field.value = savedState.fields?.[field.dataset.mapField] || "";
      field.addEventListener("input", () => {
        updateProgress();
        writeState();
      });
    });

    checks.forEach((check) => {
      check.checked = Boolean(savedState.checks?.[check.dataset.mapCheck]);
      check.addEventListener("change", () => {
        updateProgress();
        writeState();
      });
    });

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setStep(Number(tab.dataset.mapTab)));
    });

    prevButton?.addEventListener("click", () => setStep(activeStep - 1));
    nextButton?.addEventListener("click", () => {
      if (activeStep === panels.length - 1) {
        copySummary();
        return;
      }
      setStep(activeStep + 1);
    });
    copyButton?.addEventListener("click", copySummary);
    resetButton?.addEventListener("click", resetMap);

    updateProgress();
    setStep(Number(savedState.activeStep) || 0);
  }

  // Downloadable Guide
  const guide = document.querySelector("[data-guide]");
  if (guide) {
    const guideStorageKey = "martinbaumann_mvp_guide_v1";
    const guideFields = Array.from(guide.querySelectorAll("[data-guide-field]"));
    const downloadButtons = Array.from(document.querySelectorAll("[data-guide-download]"));
    const baseDownloadButtons = Array.from(document.querySelectorAll("[data-guide-download-base]"));
    const guideFeedback = guide.querySelector("[data-guide-feedback]");
    let guideFeedbackTimer;

    const readGuideState = () => {
      try {
        return JSON.parse(localStorage.getItem(guideStorageKey)) || {};
      } catch {
        return {};
      }
    };

    const writeGuideState = () => {
      const state = {};
      guideFields.forEach((field) => {
        state[field.dataset.guideField] = field.value;
      });
      localStorage.setItem(guideStorageKey, JSON.stringify(state));
    };

    const showGuideFeedback = (message) => {
      if (!guideFeedback) return;
      guideFeedback.textContent = message;
      clearTimeout(guideFeedbackTimer);
      guideFeedbackTimer = setTimeout(() => {
        guideFeedback.textContent = "";
      }, 3000);
    };

    const textFrom = (element) => element?.textContent.replace(/\s+/g, " ").trim() || "";

    const collectGuideAnswers = () =>
      guideFields.reduce((answers, field) => {
        const value = field.value.trim();
        if (value) answers[field.dataset.guideField] = value;
        return answers;
      }, {});

    const saveGuideDownload = async (includeAnswers = true) => {
      const answers = includeAnswers ? collectGuideAnswers() : {};

      await insertSupabaseRow(supabaseConfig.guideDownloadsTable || "guide_downloads", {
        download_type: includeAnswers ? "with_answers" : "base",
        answers,
        answer_count: Object.keys(answers).length,
        ...getVisitorContext(),
      });
    };

    const buildGuideMarkdown = (includeAnswers = true) => {
      const lines = [
        "# De problema real a MVP con IA",
        "",
        "Guía gratuita de Martin Baumann.",
        "",
        "Esta guía resume la ruta para pasar de una idea vaga a un MVP validable usando IA: problema, validación, MVP, construcción, lanzamiento y negocio.",
        "",
      ];

      const chapters = Array.from(guide.querySelectorAll("[data-guide-chapter]"));
      chapters.forEach((chapter) => {
        const title = textFrom(chapter.querySelector("h2"));
        const lead = textFrom(chapter.querySelector(".guide-lead"));
        lines.push(`## ${title}`, "");
        if (lead) lines.push(lead, "");

        chapter.querySelectorAll(".guide-block, .guide-callout").forEach((block) => {
          const heading = textFrom(block.querySelector("h3, strong"));
          const paragraph = textFrom(block.querySelector("p"));
          const items = Array.from(block.querySelectorAll("li")).map(textFrom);

          if (heading) lines.push(`### ${heading}`, "");
          if (paragraph) lines.push(paragraph, "");
          items.forEach((item) => lines.push(`- ${item}`));
          if (items.length) lines.push("");
        });

        const answers = includeAnswers
          ? Array.from(chapter.querySelectorAll("[data-guide-field]"))
              .map((field) => ({
                label: field.dataset.guideLabel || "Respuesta",
                value: field.value.trim(),
              }))
              .filter((item) => item.value)
          : [];

        if (includeAnswers && answers.length) {
          lines.push("### Mis respuestas", "");
          answers.forEach((answer) => {
            lines.push(`**${answer.label}:**`);
            lines.push(answer.value, "");
          });
        }
      });

      lines.push("## Siguiente paso", "");
      lines.push("La versión extendida de esta guía será el taller De Idea a MVP con IA: estrategia, validación, PRD, prompts, construcción, lanzamiento y negocio usando casos reales.", "");
      return lines.join("\n").trim();
    };

    const downloadGuide = async (includeAnswers = true) => {
      const markdown = buildGuideMarkdown(includeAnswers);
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = includeAnswers
        ? "guia-de-idea-a-mvp-con-ia-mis-respuestas.md"
        : "guia-de-idea-a-mvp-con-ia.md";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showGuideFeedback(includeAnswers ? "Guía descargada con tus respuestas." : "Guía base descargada.");

      try {
        await saveGuideDownload(includeAnswers);
      } catch (error) {
        console.warn("No se pudo registrar la descarga de la guía en Supabase.", error);
      }
    };

    const savedGuideState = readGuideState();
    guideFields.forEach((field) => {
      field.value = savedGuideState[field.dataset.guideField] || "";
      field.addEventListener("input", writeGuideState);
    });

    downloadButtons.forEach((button) => {
      button.addEventListener("click", () => {
        void downloadGuide(true);
      });
    });

    baseDownloadButtons.forEach((button) => {
      button.addEventListener("click", () => {
        void downloadGuide(false);
      });
    });
  }

  // Waitlist form
  const waitlistForm = document.querySelector("[data-waitlist-form]");
  if (waitlistForm) {
    const waitlistFeedback = document.querySelector("[data-waitlist-feedback]");

    const saveWaitlistEntry = async (entry) => {
      const result = await insertSupabaseRow(supabaseConfig.waitlistTable || "waitlist_leads", {
        name: entry.name,
        email: entry.email.toLowerCase(),
        social: entry.social || null,
        stage: entry.stage,
        project: entry.project || null,
        ...getVisitorContext(),
      });

      if (!result.ok && result.error?.code === "23505") {
        return { ok: true, duplicate: true };
      }

      return result;
    };

    waitlistForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = waitlistForm.querySelector("[type='submit']");
      const formData = new FormData(waitlistForm);
      const entry = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        social: String(formData.get("social") || "").trim(),
        stage: String(formData.get("stage") || "").trim(),
        project: String(formData.get("project") || "").trim(),
        createdAt: new Date().toISOString(),
      };

      if (!entry.name || !entry.email || !entry.stage) {
        if (waitlistFeedback) waitlistFeedback.textContent = "Completa nombre, email y etapa para entrar a la waitlist.";
        return;
      }

      if (submitButton) submitButton.disabled = true;
      if (waitlistFeedback) waitlistFeedback.textContent = "Guardando...";
      trackEvent("waitlist_submit_started", { stage: entry.stage, page: window.location.pathname });

      try {
        const result = await saveWaitlistEntry(entry);

        if (!result.ok) {
          if (waitlistFeedback) {
            waitlistFeedback.textContent = result.error?.code === "CONFIG_MISSING"
              ? "La inscripción todavía no está habilitada. Escríbeme por Instagram mientras terminamos la configuración."
              : "No pude guardar tus datos. Intenta nuevamente en unos minutos.";
          }
          trackEvent("waitlist_submit_failed", { code: result.error?.code || "UNKNOWN" });
          return;
        }

        waitlistForm.reset();
        if (waitlistFeedback) {
          waitlistFeedback.textContent = result.duplicate
            ? "Ya estabas en la waitlist. Te avisaré cuando abra la primera generación."
            : "Listo. Quedaste en la waitlist de la primera generación.";
        }
        trackEvent("waitlist_submit_succeeded", { duplicate: Boolean(result.duplicate) });
      } catch (error) {
        console.warn("No se pudo guardar la waitlist en Supabase.", error);
        if (waitlistFeedback) {
          waitlistFeedback.textContent = "No pude guardar tus datos. Intenta nuevamente en unos minutos.";
        }
        trackEvent("waitlist_submit_failed", { code: "UNEXPECTED" });
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
});
