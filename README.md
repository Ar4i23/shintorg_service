# 🚗 Шинторг Сервис

Адаптивный коммерческий сайт автосервиса **«Шинторг Сервис»** в Воронеже.

<p align="center">
  <a href="https://ar4i23.github.io/shintorg_service/">
    <img src="img/preview.webp" width="90%" alt="Шинторг Сервис — превью проекта">
  </a>
</p>

<p align="center">
  <a href="https://ar4i23.github.io/shintorg_service/">🌐 Live Demo</a>
  •
  <a href="https://github.com/Ar4i23/shintorg_service">📦 GitHub</a>
</p>

---

## 🎯 Цель проекта

Сайт построен вокруг коммерческого сценария:

**услуга → цена → доверие → выбор даты/времени → заявка → обработка заявки.**

Главная задача интерфейса — не просто показать услуги, а сократить путь пользователя до записи.

## 🛠 Tech Stack

- HTML5
- CSS3
- JavaScript ES6+ / ES Modules
- BEM
- Flexbox / CSS Grid
- Responsive Design
- CSS Custom Properties
- Git / GitHub
- Google Apps Script как внешний endpoint для расписания и заявок

## ⚡ Реализовано

- адаптивная версия Desktop / Tablet / Mobile;
- модульная структура JavaScript;
- BEM-структура CSS;
- каталог услуг с категориями;
- форма записи с валидацией;
- календарь и выбор времени;
- проверка доступности слотов;
- защита интерфейса от повторной отправки;
- отзывы и ссылка на Яндекс Карты;
- телефонная связь;
- базовая SEO-разметка;
- Open Graph;
- accessibility-атрибуты для интерактивных элементов;
- оптимизированные изображения WebP;
- отдельная страница политики обработки персональных данных.

## 🧩 Архитектура

```text
shintorg_service/
├── css/
│   ├── style.css
│   ├── base.css
│   └── blocks/
├── js/
│   ├── main.js
│   └── modules/
├── img/
├── index.html
├── privacy.html
├── README.md
├── AUDIT.md
├── CHANGELOG.md
└── .gitignore
```

JavaScript разделён по зонам ответственности: навигация, бургер, вкладки, модальные окна, календарь, форма, валидация, слайдер и анимации.

## 🔐 Важное по заявкам

Фронтенд отправляет заявку во внешний endpoint Google Apps Script. Секретные ключи Telegram **не должны находиться в HTML/JS и не должны публиковаться в GitHub**.

Фактическая доставка заявки в Telegram и Google Sheets зависит от настройки внешнего Apps Script. В этой версии сайта больше нет небезопасного fallback, который мог показать пользователю «заявка отправлена», если серверный endpoint недоступен.

## 📈 Что ещё нужно проверить перед боевым запуском

1. Реальную отправку заявки в Telegram.
2. Дублирование заявки в Google Sheets.
3. Серверную валидацию данных в Apps Script.
4. Ограничение частоты запросов / защиту от спама.
5. Реальный домен клиента и canonical/OG URL.
6. Финальный текст политики обработки персональных данных и сведения об операторе.
7. Мобильное тестирование на реальных устройствах.
8. Lighthouse / Core Web Vitals после публикации.
9. Аналитику отправок формы и звонков.

## 👨‍💻 Автор

**Артур — Frontend / Web Developer**

HTML · CSS · JavaScript · React · Node.js · Python · REST API · Git

**Направление развития:** Frontend → Full-stack → Python → API → Automation → AI
