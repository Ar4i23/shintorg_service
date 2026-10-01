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
        const nameInput = form.querySelector('[name="name"]');
        const phoneInput = form.querySelector('[name="phone"]');

        // Помечаем обязательные поля как «тронутые» и прогоняем через
        // ту же валидацию, что и при ручном заполнении — пустые поля
        // (имя и телефон) сразу подсветятся с подсказками
        [nameInput, phoneInput].forEach((el) => {
          if (!el) return;
          el.dataset.touched = "true";
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("blur", { bubbles: true }));
        });

        nameInput?.focus({ preventScroll: true });
      }, 600);
    });
  });
}
