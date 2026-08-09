// Кнопка «Записаться» у строки прайса: подставляет услугу в форму и скроллит к ней
export function initPreselect() {
  const form = document.querySelector("[data-form]");
  const select = form?.querySelector('select[name="service"]');
  if (!form || !select) return;

  document.querySelectorAll("[data-book]").forEach((button) => {
    button.addEventListener("click", () => {
      const service = button.getAttribute("data-book");
      const option = [...select.options].find((o) => o.text === service);
      if (option) {
        select.value = option.text;
        select.dispatchEvent(new Event("change")); // сработает валидация
      }
      document
        .querySelector("#request")
        ?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        form.querySelector('[name="name"]')?.focus({ preventScroll: true });
      }, 600);
    });
  });
}
