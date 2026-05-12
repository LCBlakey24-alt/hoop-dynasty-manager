const STORAGE_KEY = 'hoop-dynasty-sidebar-collapsed';

function getInitialCollapsedState() {
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

function setCollapsedState(isCollapsed: boolean) {
  document.body.classList.toggle('sidebar-is-collapsed', isCollapsed);
  window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
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
    const nextCollapsedState = !document.body.classList.contains('sidebar-is-collapsed');
    setCollapsedState(nextCollapsedState);
    setButtonText();
  });

  document.body.appendChild(button);
  setButtonText();
}

export function initialiseSidebarToggle() {
  if (typeof window === 'undefined') return;

  setCollapsedState(getInitialCollapsedState());

  window.requestAnimationFrame(() => {
    if (!document.querySelector('.sidebar-collapse-toggle')) {
      createSidebarToggle();
    }
  });
}
