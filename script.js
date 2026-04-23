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
  
  window.addEventListener("scroll", handleScroll);

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
});
