const STORAGE_KEY = 'hoop-dynasty-sidebar-collapsed';
const TOGGLE_SELECTOR = '.sidebar-collapse-toggle';

function getInitialCollapsedState() {
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

function hasSidebarLayout() {
  return Boolean(document.querySelector('.app-shell .sidebar'));
}

function setCollapsedState(isCollapsed: boolean) {
  document.body.classList.toggle('sidebar-is-collapsed', isCollapsed && hasSidebarLayout());
  window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
}

function getExistingToggle() {
  return document.querySelector<HTMLButtonElement>(TOGGLE_SELECTOR);
}

function updateToggleVisibility() {
  const button = getExistingToggle();

  if (!button) return;

  const shouldShow = hasSidebarLayout();
  button.hidden = !shouldShow;
  button.setAttribute('aria-hidden', String(!shouldShow));

  if (!shouldShow) {
    document.body.classList.remove('sidebar-is-collapsed');
    return;
  }

  document.body.classList.toggle('sidebar-is-collapsed', getInitialCollapsedState());
  button.textContent = document.body.classList.contains('sidebar-is-collapsed') ? '›' : '‹';
}

function createSidebarToggle() {
  const button = document.createElement('button');
  button.className = 'sidebar-collapse-toggle';
  button.type = 'button';
  button.setAttribute('aria-label', 'Toggle sidebar navigation');

  const setButtonText = () => {
    button.textContent = document.body.classList.contains('sidebar-is-collapsed') ? '›' : '‹';
  };

  button.addEventListener('click', () => {
    if (!hasSidebarLayout()) return;

    const nextCollapsedState = !document.body.classList.contains('sidebar-is-collapsed');
    setCollapsedState(nextCollapsedState);
    setButtonText();
  });

  document.body.appendChild(button);
  setButtonText();
  updateToggleVisibility();
}

export function initialiseSidebarToggle() {
  if (typeof window === 'undefined') return;

  window.requestAnimationFrame(() => {
    if (!getExistingToggle()) {
      createSidebarToggle();
    }

    updateToggleVisibility();
  });

  const observer = new MutationObserver(() => {
    updateToggleVisibility();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
