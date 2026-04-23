const elements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  {
    threshold: 0.12,
  },
);

elements.forEach((el) => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();
