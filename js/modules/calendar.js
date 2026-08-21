// Мини-бэкенд в Google-таблице (Apps Script)
export const API_URL =
  "https://script.google.com/macros/s/AKfycbweXF_PQvTEFp75z3j34uHfoM0yY1D6jsvX7v9yhk38MdDbgqDeFKozb3CC7hUSRzM2Jg/exec";

const MONTHS_AHEAD = 3;
const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

let schedule = new Map(); // "21.08.2026" -> [{ time, left, busyOnce }]
let loaded = false;
let view = new Date();
let selectedDate = "";
let selectedTime = "";

// Конфликт услуги «раз в час» с выбором в форме:
// null   — конфликта нет
// 'time' — выбранное время занято этой услугой
// 'date' — на выбранной дате нет ни одного часа для этой услуги
export function getServiceConflict(serviceValue) {
  const form = document.querySelector("[data-form]");
  if (!form || !serviceValue) return null;
  const date = form.querySelector('[name="date"]')?.value || "";
  if (!date) return null;

  const svc = serviceValue.toLowerCase();
  const slots = freeSlots(keyFromISO(date));
  const time = form.querySelector('[name="time"]')?.value || "";

  if (time) {
    const slot = slots.find((s) => s.time === time);
    return slot && slot.busyOnce.includes(svc) ? "time" : null;
  }
  return slots.some((s) => !s.busyOnce.includes(svc)) ? null : "date";
}

// Отдать текущую выбранную дату (ISO) наружу
export function getSelectedDateISO() {
  return selectedDate;
}

// Обновить счётчики мест с сервера:
// 'keep-date' — дату оставить, время сбросить (минус виден сразу)
// 'all'       — сбросить всё
export async function refreshSchedule(mode = "keep-date") {
  if (mode === "all") {
    selectedDate = "";
    selectedTime = "";
  }
  if (mode === "keep-date") {
    selectedTime = "";
  }
  const root = document.querySelector("[data-calendar]");
  if (root) await load(root);
}

export function initCalendar() {
  const root = document.querySelector("[data-calendar]");
  if (!root) return;

  root.querySelector("[data-cal-prev]").addEventListener("click", () => {
    view.setMonth(view.getMonth() - 1);
    render(root);
  });
  root.querySelector("[data-cal-next]").addEventListener("click", () => {
    view.setMonth(view.getMonth() + 1);
    render(root);
  });

  const serviceSelect = document.querySelector('[data-form] [name="service"]');
  if (serviceSelect)
    serviceSelect.addEventListener("change", () => renderSlots(root));

  load(root);
}

async function load(root) {
  if (API_URL.startsWith("http")) {
    try {
      // nocache — чтобы не получить старый ответ из кэша
      const res = await fetch(
        API_URL + (API_URL.includes("?") ? "&" : "?") + "nocache=" + Date.now(),
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      schedule = new Map();
      (data.slots || []).forEach((s) => {
        if (!schedule.has(s.date)) schedule.set(s.date, []);
        schedule
          .get(s.date)
          .push({ time: s.time, left: s.left, busyOnce: s.busyOnce || [] });
      });
      loaded = true;
      const form = document.querySelector("[data-form]");
      if (form) form.dataset.slots = "on";
    } catch (e) {
      console.warn("Календарь: расписание недоступно — открыты все даты", e);
      loaded = false;
    }
  }
  render(root);
}

const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) =>
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const keyFromISO = (iso) => {
  const p = (iso || "").split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : "";
};

const freeSlots = (key) => (schedule.get(key) || []).filter((s) => s.left > 0);

function isDateAvailable(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  if (!loaded) return true;
  return freeSlots(toKey(date)).length > 0;
}

function render(root) {
  const grid = root.querySelector("[data-cal-grid]");
  const label = root.querySelector("[data-cal-month]");
  const prevBtn = root.querySelector("[data-cal-prev]");
  const nextBtn = root.querySelector("[data-cal-next]");

  const year = view.getFullYear(),
    month = view.getMonth();
  const now = new Date();
  const diff = (year - now.getFullYear()) * 12 + (month - now.getMonth());

  label.textContent = `${MONTHS[month]} ${year}`;
  prevBtn.disabled = diff <= 0;
  nextBtn.disabled = diff >= MONTHS_AHEAD;
  grid.innerHTML = "";

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) grid.append(document.createElement("span"));

  const days = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= days; day++) {
    const date = new Date(year, month, day);
    const iso = toISO(date),
      key = toKey(date);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar__day";
    cell.textContent = day;
    if (key === toKey(now)) cell.classList.add("calendar__day--today");

    if (isDateAvailable(date)) {
      cell.classList.add("calendar__day--free");
      if (iso === selectedDate) cell.classList.add("calendar__day--selected");
      cell.addEventListener("click", () => selectDate(root, iso));
    } else {
      cell.classList.add("calendar__day--disabled");
      cell.disabled = true;
    }
    grid.append(cell);
  }

  if (selectedDate) renderSlots(root);
  else {
    const box = root.querySelector("[data-cal-slots]");
    if (box) box.hidden = true;
    const list = root.querySelector("[data-cal-slots-list]");
    if (list) list.innerHTML = "";
  }
}

function selectDate(root, iso) {
  selectedDate = iso;
  selectedTime = "";
  const dateInput = document.querySelector('[data-form] [name="date"]');
  if (dateInput) {
    dateInput.value = iso;
    dateInput.dataset.touched = "true";
    dateInput.dispatchEvent(new Event("change"));
  }
  const timeInput = document.querySelector('[data-form] [name="time"]');
  if (timeInput) timeInput.value = "";

  const svc = document.querySelector('[data-form] [name="service"]');
  if (svc) svc.dispatchEvent(new Event("change"));

  render(root);
}

function renderSlots(root) {
  const box = root.querySelector("[data-cal-slots]");
  const list = root.querySelector("[data-cal-slots-list]");
  if (!box || !list) return;
  list.innerHTML = "";
  if (!loaded) {
    box.hidden = true;
    return;
  }

  const slots = freeSlots(keyFromISO(selectedDate)).sort((a, b) =>
    a.time.localeCompare(b.time),
  );
  box.hidden = false;

  if (!slots.length) {
    list.innerHTML =
      '<span class="calendar__slots-empty">На эту дату нет свободных слотов</span>';
    return;
  }

  const service = (
    document.querySelector('[data-form] [name="service"]')?.value || ""
  ).toLowerCase();

  slots.forEach((s) => {
    const busy = service !== "" && s.busyOnce.includes(service);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "calendar__slot" +
      (busy ? " calendar__slot--busy" : "") +
      (!busy && s.left <= 3 ? " calendar__slot--few" : "") +
      (!busy && s.time === selectedTime ? " calendar__slot--selected" : "");
    btn.disabled = busy;
    btn.title = busy
      ? "Эта услуга уже записана на данное время"
      : `Свободно мест: ${s.left}`;

    const time = document.createElement("span");
    time.className = "calendar__slot-time";
    time.textContent = s.time;

    const left = document.createElement("span");
    left.className = "calendar__slot-left";
    left.textContent = busy
      ? "занято"
      : s.left <= 3
        ? `осталось ${s.left}`
        : `свободно: ${s.left}`;

    btn.append(time, left);
    if (!busy) btn.addEventListener("click", () => selectTime(s.time));
    list.append(btn);
  });
}

function selectTime(time) {
  selectedTime = time;
  const timeInput = document.querySelector('[data-form] [name="time"]');
  if (timeInput) {
    timeInput.value = time;
    timeInput.dataset.touched = "true";
    timeInput.dispatchEvent(new Event("change"));
  }

  const svc = document.querySelector('[data-form] [name="service"]');
  if (svc) svc.dispatchEvent(new Event("change"));

  renderSlots(document.querySelector("[data-calendar]"));
}
