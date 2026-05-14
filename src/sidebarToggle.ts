const STORAGE_KEY = 'hoop-dynasty-sidebar-collapsed';
const TOGGLE_SELECTOR = '.sidebar-collapse-toggle';

function getInitialCollapsedState() {
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

function hasSidebarLayout() {
  return Boolean(document.querySelector('.app-shell .sidebar'));
}

function setCollapsedState(isCollapsed: boolean) {
  const shouldCollapse = isCollapsed && hasSidebarLayout();

  if (document.body.classList.contains('sidebar-is-collapsed') !== shouldCollapse) {
    document.body.classList.toggle('sidebar-is-collapsed', shouldCollapse);
  }

  window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
}

function getExistingToggle() {
  return document.querySelector<HTMLButtonElement>(TOGGLE_SELECTOR);
}

function setAttributeIfChanged(element: HTMLElement, name: string, value: string) {
  if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
}

function updateToggleVisibility() {
  const button = getExistingToggle();

  if (!button) return;

  const shouldShow = hasSidebarLayout();

  if (button.hidden === shouldShow) {
    button.hidden = !shouldShow;
  }

  setAttributeIfChanged(button, 'aria-hidden', String(!shouldShow));

  if (!shouldShow) {
    if (document.body.classList.contains('sidebar-is-collapsed')) {
      document.body.classList.remove('sidebar-is-collapsed');
    }
    return;
  }

  const shouldCollapse = getInitialCollapsedState();
  if (document.body.classList.contains('sidebar-is-collapsed') !== shouldCollapse) {
    document.body.classList.toggle('sidebar-is-collapsed', shouldCollapse);
  }

  const nextText = document.body.classList.contains('sidebar-is-collapsed') ? '›' : '‹';
  if (button.textContent !== nextText) {
    button.textContent = nextText;
  }
}

function createSidebarToggle() {
  const button = document.createElement('button');
  button.className = 'sidebar-collapse-toggle';
  button.type = 'button';
  button.setAttribute('aria-label', 'Toggle sidebar navigation');

  const setButtonText = () => {
    const nextText = document.body.classList.contains('sidebar-is-collapsed') ? '›' : '‹';
    if (button.textContent !== nextText) {
      button.textContent = nextText;
    }
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

  let updateQueued = false;

  const queueVisibilityUpdate = () => {
    if (updateQueued) return;

    updateQueued = true;
    window.requestAnimationFrame(() => {
      updateQueued = false;

      if (!getExistingToggle()) {
        createSidebarToggle();
      }

      updateToggleVisibility();
    });
  };

  queueVisibilityUpdate();

  const appRoot = document.getElementById('root');
  if (!appRoot) return;

  const observer = new MutationObserver(() => {
    queueVisibilityUpdate();
  });

  observer.observe(appRoot, {
    childList: true,
    subtree: true,
  });
}
