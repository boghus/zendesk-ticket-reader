import { DomExtractionService } from '../../core/services/domExtractionService.js';
import { browserAPI } from '../../shared/platform/browserAdapter.js';

function setVersion() {
  const versionEl = document.getElementById('app-version');
  const version = browserAPI.runtime.getManifest()?.version ?? '—';

  if (versionEl) {
    versionEl.textContent = version;
  }
}

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

  const extractionService = new DomExtractionService();
  extractionService.registerExtractionEvents();
  extractionService.loadExtractionRules();
});
