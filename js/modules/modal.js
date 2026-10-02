let modal = null;
let lastFocused = null;

export function initModal() {
  modal = document.querySelector("[data-modal]");
  if (!modal) return;

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}

export function openModal() {
  if (!modal) return;
  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal__button")?.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  lastFocused?.focus();
}
