// Правила для каждого поля
const validators = {
  name: (value) => value.trim().length >= 2,
  phone: (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  },
  service: (value) => value !== "",
  date: (value) => {
    if (!value) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(value) >= today;
  },
};

// Валидация одного поля. Возвращает true/false
export function validateField(field) {
  const rule = field.getAttribute("data-validate");
  const check = validators[rule];
  if (!check) return true;

  const isValid = check(field.value);
  const showError = !isValid && field.dataset.touched === "true";

  field.classList.toggle("cta__input--valid", isValid);
  field.classList.toggle("cta__input--error", showError);

  const errorEl = field.closest(".cta__field")?.querySelector(".cta__error");
  if (errorEl) errorEl.hidden = !showError;

  return isValid;
}
