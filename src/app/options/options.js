import { browserAPI } from '../../shared/platform/browserAdapter.js';

/**
 * Displays the extension version in the app version element.
 */
function setVersion() {
  const versionEl = document.getElementById('app-version');
  const version = browserAPI.runtime.getManifest()?.version ?? '—';

  if (versionEl) {
    versionEl.textContent = version;
  }
}

/**
 * Binds navigation items to their corresponding panels.
 */
function bindNavigation() {
  const items = document.querySelectorAll('[data-section]');
  const panels = document.querySelectorAll('[data-panel]');

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');

      items.forEach((navItem) => {
        const isActive = navItem === item;
        navItem.classList.toggle('active', isActive);
        if (isActive) {
          navItem.setAttribute('aria-current', 'page');
        } else {
          navItem.removeAttribute('aria-current');
        }
      });

      panels.forEach((panel) => {
        panel.classList.toggle('active', panel.getAttribute('data-panel') === section);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setVersion();
  bindNavigation();
});
