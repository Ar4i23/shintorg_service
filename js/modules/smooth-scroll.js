// Плавный скролл: и для ссылок, и для кнопок с data-scroll
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"], [data-scroll]').forEach((el) => {
    el.addEventListener("click", (event) => {
      const selector =
        el.getAttribute("data-scroll") || el.getAttribute("href");
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
