// Переключение категорий прайса
export function initTabs() {
  const tabs = document.querySelectorAll("[data-tab]");
  const panels = document.querySelectorAll("[data-panel]");
  if (!tabs.length || !panels.length) return;

  const activate = (id) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === id;
      tab.classList.toggle("price__tab--active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== id;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab.dataset.tab));
  });
}
