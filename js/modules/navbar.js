// Подсветка активного пункта меню при скролле
export function initNavbar() {
  const links = document.querySelectorAll('.header__nav-item[href^="#"]');
  if (!links.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle(
        "header__nav-item--active",
        link.getAttribute("href") === `#${id}`,
      );
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );

  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) observer.observe(section);
  });
}
