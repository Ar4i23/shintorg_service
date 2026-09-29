import { validateField, validateForm, resetValidation } from "./validation.js";
import { openModal } from "./modal.js";
import { API_URL, refreshSchedule, getSelectedDateISO } from "./calendar.js";

// ID устройства: живёт в браузере, чтобы считать заявки с одного компьютера
function getDeviceId() {
  try {
    let id = localStorage.getItem("st_device_id");
    if (!id) {
      id =
        "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("st_device_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

function formatDateRU(iso) {
  const [year, month, day] = String(iso || "").split("-");
  return year && month && day ? `${day}.${month}.${year}` : "—";
}

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

  // Телефон: маска +7 (___) ___-__-__
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
      date: formatDateRU(form.date.value),
      time: form.time.value || "—",
      device: getDeviceId(),
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
        fail("Эта услуга уже записана на выбранное время — выберите другое.");
      else if (result.error === "user-limit")
        fail(
          "С этого номера уже есть запись на сегодня. Если нужна ещё одна услуга — позвоните нам, запишем вручную.",
        );
      else
        fail("Не удалось отправить заявку. Позвоните нам по телефону — мы запишем вас вручную.");
    } catch (error) {
      console.error("Ошибка отправки заявки:", error);
      fail("Не удалось отправить заявку. Позвоните нам по телефону — мы запишем вас вручную.");
    } finally {
      button.disabled = false;
    }
  });
}
