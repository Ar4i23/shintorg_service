import { getServiceConflict } from "./calendar.js";

const validators = {
  name: (value) => /^[а-яё]{2,}$/i.test(value.trim()),
  phone: (value) => {
    let d = value.replace(/\D/g, "");
    if (d.length === 10 && d.startsWith("9")) d = "7" + d;
    if (d.length !== 11) return false;
    if (!d.startsWith("7") && !d.startsWith("8")) return false;
    return ["3", "4", "8", "9"].includes(d[1]);
  },
  service: (value) => value !== "" && getServiceConflict(value) === null,
  date: (value) => {
    if (!value) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(value) >= today;
  },
  time: (value) => {
    const form = document.querySelector("[data-form]");
    if (!form || form.dataset.slots !== "on") return true;
    return value !== "";
  },
};

export function validateField(field) {
  const rule = field.getAttribute("data-validate");
  const check = validators[rule];
  if (!check) return true;

  const isValid = check(field.value);
  const showError = !isValid && field.dataset.touched === "true";

  field.classList.toggle("cta__input--valid", isValid && field.value !== "");
  field.classList.toggle("cta__input--error", showError);

  const errorEl = field.closest(".cta__field")?.querySelector(".cta__error");
  if (errorEl) {
    if (!errorEl.dataset.default) errorEl.dataset.default = errorEl.textContent;

    let msg = errorEl.dataset.default;
    if (rule === "service" && field.value) {
      const conflict = getServiceConflict(field.value);
      if (conflict === "time")
        msg =
          "Эта услуга уже записана на выбранное время — выберите другое время";
      if (conflict === "date")
        msg = "На выбранную дату эта услуга недоступна — выберите другую дату";
    }
    errorEl.textContent = msg;
    errorEl.hidden = !showError;
  }

  return isValid;
}

export function validateForm(form) {
  const fields = [...form.querySelectorAll("[data-validate]")];
  let firstInvalid = null;

  const allValid = fields
    .map((f) => {
      f.dataset.touched = "true";
      const ok = validateField(f);
      if (!ok && !firstInvalid) firstInvalid = f;
      return ok;
    })
    .every(Boolean);

  if (firstInvalid && typeof firstInvalid.focus === "function")
    firstInvalid.focus();
  return allValid;
}

export function resetValidation(form) {
  form.querySelectorAll("[data-validate]").forEach((f) => {
    delete f.dataset.touched;
    f.classList.remove("cta__input--valid", "cta__input--error");
  });
  form.querySelectorAll(".cta__error").forEach((el) => (el.hidden = true));
}
