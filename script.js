document.addEventListener("DOMContentLoaded", () => {
  // Mouse Blob Follower
  const blob = document.getElementById("cursor-blob");
  if (blob) {
    document.addEventListener("mousemove", (e) => {
      const x = e.clientX;
      const y = e.clientY;
      blob.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
    });
  }

  // Parallax Effect
  const handleScroll = () => {
    const scroll = window.pageYOffset;

    // Hero parallax
    const parallaxTexts = document.querySelectorAll(".parallax-text");
    parallaxTexts.forEach((text) => {
      const speed = text.getAttribute("data-speed");
      if (speed) {
        text.style.transform = `translateX(${scroll * parseFloat(speed) * 0.1}px)`;
      }
    });
  };
  
  // Smart Header (Hide on scroll down, show on scroll up)
  const nav = document.querySelector('nav');
  let lastScrollY = window.scrollY;

  const handleSmartHeader = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY <= 50) {
      // At the top
      nav.classList.remove('nav-hidden');
      nav.classList.remove('nav-scrolled');
    } else if (currentScrollY > lastScrollY) {
      // Scrolling down
      nav.classList.add('nav-hidden');
      nav.classList.remove('nav-scrolled');
    } else {
      // Scrolling up
      nav.classList.remove('nav-hidden');
      nav.classList.add('nav-scrolled');
    }
    
    lastScrollY = currentScrollY;
  };

  window.addEventListener("scroll", () => {
    handleScroll();
    handleSmartHeader();
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
            behavior: "smooth",
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
});
