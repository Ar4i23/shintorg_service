import { validateField } from "./validation.js";
import { openModal } from "./modal.js";
import { sendToTelegram } from "./telegram.js";

export function initForm() {
  const form = document.querySelector("[data-form]");
  if (!form) return;

  const fields = [...form.querySelectorAll("[data-validate]")];

  // Календарь: прошлые даты недоступны
  const dateInput = form.querySelector('[name="date"]');
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  // Real-time: валидируем при вводе, ошибку показываем после blur
  fields.forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("change", () => validateField(field)); // для select и date
    field.addEventListener("blur", () => {
      field.dataset.touched = "true";
      validateField(field);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Прогоняем все поля
    let allValid = true;
    fields.forEach((field) => {
      field.dataset.touched = "true";
      if (!validateField(field)) allValid = false;
    });
    if (!allValid) return;

    const button = form.querySelector(".button");
    button.disabled = true;

    // Собираем заявку
    const data = {
      Имя: form.name.value.trim(),
      Телефон: form.phone.value.trim(),
      Услуга: form.service.value,
      Дата: new Date(form.date.value).toLocaleDateString("ru-RU"),
    };

    await sendToTelegram(data);

    openModal();
    form.reset();
    fields.forEach((field) => {
      delete field.dataset.touched;
      field.classList.remove("cta__input--valid", "cta__input--error");
    });
    button.disabled = false;
  });
}
