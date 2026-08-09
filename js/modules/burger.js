// Мобильное меню-бургер
export function initBurger() {
  const burger = document.querySelector("[data-burger]");
  const nav = document.querySelector("[data-nav]");
  if (!burger || !nav) return;

  const close = () => {
    nav.classList.remove("header__nav--open");
    burger.classList.remove("header__burger--open");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("header__nav--open");
    burger.classList.toggle("header__burger--open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".header__nav-item").forEach((link) => {
    link.addEventListener("click", close);
  });
}
