// Карусель отзывов: автопрокрутка + свайп + точки (только мобильные)
export function initReviewsSlider() {
  const list = document.querySelector(".reviews__list");
  const dotsBox = document.querySelector("[data-reviews-dots]");
  if (!list || !dotsBox) return;

  const cards = [...list.querySelectorAll(".review-card")];
  if (cards.length < 2) return;

  const isMobile = window.matchMedia("(max-width: 767px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let index = 0;
  let timer = null;

  /* Точки по количеству отзывов */
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "reviews__dot";
    dot.setAttribute("aria-label", `Отзыв ${i + 1}`);
    dot.addEventListener("click", () => {
      goTo(i);
      restart();
    });
    dotsBox.append(dot);
  });
  const dots = [...dotsBox.children];

  const step = () => cards[0].offsetWidth + 16; // ширина карточки + gap

  function goTo(i) {
    index = (i + cards.length) % cards.length;
    list.scrollTo({
      left: index * step(),
      behavior: reduced.matches ? "auto" : "smooth",
    });
  }

  function syncDots() {
    dots.forEach((d, i) =>
      d.classList.toggle("reviews__dot--active", i === index),
    );
  }

  /* Следим за свайпами — синхронизируем точки */
  let raf;
  list.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        index = Math.min(
          cards.length - 1,
          Math.max(0, Math.round(list.scrollLeft / step())),
        );
        syncDots();
      });
    },
    { passive: true },
  );

  /* Автопрокрутка: каждые 5 секунд */
  function start() {
    stop();
    if (!isMobile.matches || reduced.matches) return;
    timer = setInterval(() => goTo(index + 1), 5000);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }
  function restart() {
    stop();
    start();
  }

  /* Пользователь трогает — не мешаем, после паузы продолжаем */
  list.addEventListener("touchstart", stop, { passive: true });
  list.addEventListener("touchend", () => setTimeout(start, 4000), {
    passive: true,
  });

  /* Крутим только пока секция на экране */
  new IntersectionObserver(
    ([entry]) => {
      entry.isIntersecting ? start() : stop();
    },
    { threshold: 0.3 },
  ).observe(list);

  /* Повернули телефон / растянули окно — пересчитываем режим */
  isMobile.addEventListener("change", () =>
    isMobile.matches ? start() : stop(),
  );

  syncDots();
  start();
}
