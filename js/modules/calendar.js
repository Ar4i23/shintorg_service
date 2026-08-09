// ============================================================
// КАЛЕНДАРЬ ЗАПИСИ
// Заказчик управляет датами через Google-таблицу (колонки: дата, статус)
// Файл → Поделиться → Опубликовать в интернете → CSV → ссылка сюда:
// ============================================================
const SHEET_CSV_URL = "ВСТАВЬ_ССЫЛКУ_НА_CSV";

// 'whitelist'  — кликабельны ТОЛЬКО даты со статусом «свободно»
// 'blacklist'  — кликабельны все, КРОМЕ «занято»
const MODE = "whitelist";

const MONTHS_AHEAD = 3; // на сколько месяцев вперёд можно листать

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

let availability = new Map();
let sheetLoaded = false;
let view = new Date();
let selectedISO = "";

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
  availability = new Map();
  text
    .trim()
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (index === 0 && /дата/i.test(line)) return; // шапка
      const [rawDate, rawStatus] = line
        .split(",")
        .map((p) => (p || "").trim().toLowerCase());
      if (!rawDate) return;
      availability.set(rawDate, rawStatus);
    });
}

const pad = (n) => String(n).padStart(2, "0");
const toKey = (d) =>
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function isAvailable(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  if (!sheetLoaded) return true; // таблица не подключена — открыты все даты
  const status = availability.get(toKey(date));
  if (MODE === "whitelist") return status === "свободно" || status === "free";
  return status !== "занято" && status !== "busy";
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

  // пустые ячейки до 1-го числа (неделя с понедельника)
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) grid.append(document.createElement("span"));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const iso = toISO(date);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar__day";
    cell.textContent = day;

    if (toKey(date) === toKey(now)) cell.classList.add("calendar__day--today");

    if (isAvailable(date)) {
      cell.classList.add("calendar__day--free");
      if (iso === selectedISO) cell.classList.add("calendar__day--selected");
      cell.addEventListener("click", () => select(root, iso));
    } else {
      cell.classList.add("calendar__day--disabled");
      cell.disabled = true;
    }

    grid.append(cell);
  }
}

function select(root, iso) {
  selectedISO = iso;
  const input = document.querySelector('[data-form] [name="date"]');
  if (input) {
    input.value = iso;
    input.dataset.touched = "true";
    input.dispatchEvent(new Event("change")); // подсветит валидацию формы
  }
  render(root);
}
