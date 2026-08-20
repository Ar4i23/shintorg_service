// ============================================================
// КАЛЕНДАРЬ ЗАПИСИ С ВЫБОРОМ ВРЕМЕНИ
// Google-таблица: колонки — дата, время, статус
// Файл → Поделиться → Опубликовать → CSV → ссылка сюда:
// ============================================================
const SHEET_CSV_URL = "ВСТАВЬ_ССЫЛКУ_НА_CSV";

// 'whitelist'  — кликабельны ТОЛЬКО слоты «свободно»
// 'blacklist'  — открыты все, КРОМЕ «занято»
const MODE = "whitelist";

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

// Map: "21.08.2026" → [ { time: "09:00", status: "свободно" }, ... ]
let schedule = new Map();
let sheetLoaded = false;
let view = new Date();
let selectedDate = "";
let selectedTime = "";

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

  load(root);
}

async function load(root) {
  if (SHEET_CSV_URL.startsWith("http")) {
    try {
      const response = await fetch(SHEET_CSV_URL);
      parseCsv(await response.text());
      sheetLoaded = true;
    } catch (error) {
      console.warn("Календарь: расписание не загрузилось", error);
      sheetLoaded = false;
    }
  }
  render(root);
}

function parseCsv(text) {
  schedule = new Map();
  text
    .trim()
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (index === 0 && /дата/i.test(line)) return;
      const parts = line.split(",").map((p) => (p || "").trim());
      const [rawDate, rawTime, rawStatus] = parts;
      if (!rawDate || !rawTime) return;

      const status = (rawStatus || "").toLowerCase();
      if (!schedule.has(rawDate)) schedule.set(rawDate, []);
      schedule.get(rawDate).push({ time: rawTime, status });
    });
}

const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) =>
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function getFreeSlots(dateKey) {
  const slots = schedule.get(dateKey);
  if (!slots) return [];
  return slots.filter((s) => {
    if (MODE === "whitelist")
      return s.status === "свободно" || s.status === "free";
    return s.status !== "занято" && s.status !== "busy";
  });
}

function hasAnyFreeSlot(dateKey) {
  if (!sheetLoaded) return true;
  return getFreeSlots(dateKey).length > 0;
}

function isDateAvailable(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  if (!sheetLoaded) return true;
  return hasAnyFreeSlot(toKey(date));
}

function render(root) {
  const grid = root.querySelector("[data-cal-grid]");
  const label = root.querySelector("[data-cal-month]");
  const prevBtn = root.querySelector("[data-cal-prev]");
  const nextBtn = root.querySelector("[data-cal-next]");

  const year = view.getFullYear();
  const month = view.getMonth();
  const now = new Date();
  const monthDiff = (year - now.getFullYear()) * 12 + (month - now.getMonth());

  label.textContent = `${MONTHS[month]} ${year}`;
  prevBtn.disabled = monthDiff <= 0;
  nextBtn.disabled = monthDiff >= MONTHS_AHEAD;

  grid.innerHTML = "";

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) grid.append(document.createElement("span"));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const iso = toISO(date);
    const key = toKey(date);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar__day";
    cell.textContent = day;

    if (key === toKey(now)) cell.classList.add("calendar__day--today");

    if (isDateAvailable(date)) {
      cell.classList.add("calendar__day--free");
      if (iso === selectedDate) cell.classList.add("calendar__day--selected");
      cell.addEventListener("click", () => selectDate(root, iso, key));
    } else {
      cell.classList.add("calendar__day--disabled");
      cell.disabled = true;
    }

    grid.append(cell);
  }

  // Если выбранная дата ещё актуальна — показать слоты
  if (selectedDate) {
    const parts = selectedDate.split("-");
    const key = `${parts[2]}.${parts[1]}.${parts[0]}`;
    renderSlots(root, key);
  }
}

function selectDate(root, iso, dateKey) {
  selectedDate = iso;
  selectedTime = "";

  // Обновляем скрытый инпут даты
  const dateInput = document.querySelector('[data-form] [name="date"]');
  if (dateInput) {
    dateInput.value = iso;
    dateInput.dataset.touched = "true";
    dateInput.dispatchEvent(new Event("change"));
  }

  // Сбрасываем время
  const timeInput = document.querySelector('[data-form] [name="time"]');
  if (timeInput) {
    timeInput.value = "";
  }

  render(root);
  renderSlots(root, dateKey);
}

function renderSlots(root, dateKey) {
  const slotsBox = root.querySelector("[data-cal-slots]");
  const slotsList = root.querySelector("[data-cal-slots-list]");
  if (!slotsBox || !slotsList) return;

  slotsList.innerHTML = "";

  if (!sheetLoaded) {
    slotsBox.hidden = true;
    return;
  }

  const freeSlots = getFreeSlots(dateKey);
  slotsBox.hidden = false;

  if (freeSlots.length === 0) {
    const empty = document.createElement("span");
    empty.className = "calendar__slots-empty";
    empty.textContent = "На эту дату нет свободных слотов";
    slotsList.append(empty);
    return;
  }

  // Сортируем по времени
  freeSlots.sort((a, b) => a.time.localeCompare(b.time));

  freeSlots.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "calendar__slot";
    btn.textContent = slot.time;

    if (slot.time === selectedTime) {
      btn.classList.add("calendar__slot--selected");
    }

    btn.addEventListener("click", () => selectTime(root, slot.time));
    slotsList.append(btn);
  });
}

function selectTime(root, time) {
  selectedTime = time;

  const timeInput = document.querySelector('[data-form] [name="time"]');
  if (timeInput) {
    timeInput.value = time;
    timeInput.dataset.touched = "true";
    timeInput.dispatchEvent(new Event("change"));
  }

  // Перерисовать слоты чтобы подсветить выбранный
  const parts = selectedDate.split("-");
  const key = `${parts[2]}.${parts[1]}.${parts[0]}`;
  renderSlots(root, key);
}
