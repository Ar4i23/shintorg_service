import { validateField, validateForm, resetValidation } from "./validation.js";
import { openModal } from "./modal.js";
import { sendToTelegram } from "./telegram.js";
import { API_URL, refreshSchedule, getSelectedDateISO } from "./calendar.js";

export function initForm() {
  const form = document.querySelector("[data-form]");
  if (!form) return;

  // Имя: первая буква заглавная, остальные строчные
  const nameInput = form.querySelector('[name="name"]');
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      const v = nameInput.value;
      const fixed = v
        ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
        : v;
      if (fixed !== v) nameInput.value = fixed;
    });
  }

  // Телефон: маска +7 (___) ___-__-__, буквы не печатаются
  const phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let d = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      if (!d) {
        phoneInput.value = "";
        return;
      }
      if (d.startsWith("8")) d = "7" + d.slice(1);
      else if (!d.startsWith("7")) d = "7" + d;

      let out = "+7";
      if (d.length > 1) out += " (" + d.slice(1, 4);
      if (d.length > 4) out += ") " + d.slice(4, 7);
      if (d.length > 7) out += "-" + d.slice(7, 9);
      if (d.length > 9) out += "-" + d.slice(9, 11);
      phoneInput.value = out;
    });
  }

  // Real-time валидация
  form.querySelectorAll("[data-validate]").forEach((field) => {
    ["input", "change", "blur"].forEach((evt) =>
      field.addEventListener(evt, () => {
        field.dataset.touched = "true";
        validateField(field);
      }),
    );
  });

  // Отправка
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm(form)) return;

    const payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      service: form.service.value,
      date: new Date(form.date.value).toLocaleDateString("ru-RU"),
      time: form.time.value || "—",
    };

    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    const errorEl = form
      .querySelector('[name="date"]')
      .closest(".cta__field")
      .querySelector(".cta__error");

    const success = () => {
      openModal();
      form.reset();
      resetValidation(form);
      if (errorEl) errorEl.hidden = true;

      // Счётчики обновятся СРАЗУ: дата остаётся, время сбрасывается
      refreshSchedule("keep-date");
      const dateInput = form.querySelector('[name="date"]');
      const iso = getSelectedDateISO();
      if (dateInput && iso) dateInput.value = iso;
    };
    const fail = (text) => {
      if (errorEl) {
        errorEl.textContent = text;
        errorEl.hidden = false;
      }
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.ok) success();
      else if (result.error === "full")
        fail("Это время только что полностью заняли — выберите другое.");
      else if (result.error === "once-busy")
        fail(
          "Компьютерная диагностика уже записана на это время — выберите другой час.",
        );
      else {
        await sendToTelegram(payload);
        success();
      }
    } catch {
      await sendToTelegram(payload);
      success();
    } finally {
      button.disabled = false;
    }
  });
}
