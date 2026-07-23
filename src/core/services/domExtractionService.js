import DEFAULT_SELECTORS from '../../config/defaultSelectors.json';
import { StorageService } from '../../storage/storageService.js';

const STORAGE_KEY = 'selectors';

export class DomExtractionService {
  constructor({
    storageService = StorageService,
    defaultSelectors = DEFAULT_SELECTORS,
    domElements = null,
  } = {}) {
    this.storageService = storageService;
    this.defaultSelectors = defaultSelectors;
    this._customElements = domElements;
  }

  get elements() {
    if (this._customElements) {
      return this._customElements;
    }

    return {
      textarea: document.getElementById('config-textarea'),
      errorContainer: document.getElementById('config-error'),
      saveBtn: document.getElementById('btn-save-config'),
      resetBtn: document.getElementById('btn-reset-config'),
    };
  }

  async loadExtractionRules() {
    const { textarea } = this.elements;
    if (!textarea) {
      return null;
    }

    const config = await this.storageService.get(STORAGE_KEY, this.defaultSelectors);
    this.renderExtractionRules(config);
    return config;
  }

  renderExtractionRules(config) {
    const { textarea } = this.elements;
    if (!textarea) {
      return;
    }

    textarea.value = JSON.stringify(config, null, 2);
  }

  async saveExtractionRules() {
    const { textarea, errorContainer, saveBtn } = this.elements;
    if (!textarea || !errorContainer || !saveBtn) {
      return false;
    }

    this.clearError();

    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Guardando...';
    saveBtn.disabled = true;

    try {
      const jsonString = textarea.value;
      const newConfig = JSON.parse(jsonString);

      await this.storageService.set(STORAGE_KEY, newConfig);

      saveBtn.textContent = '¡Guardado!';
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }, 1500);

      return true;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      this.showError(`Error: ${error.message}`);
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
      return false;
    }
  }

  restoreDefaultExtractionRules() {
    const { textarea, errorContainer } = this.elements;
    if (!textarea || !errorContainer) {
      return;
    }

    this.clearError();
    this.renderExtractionRules(this.defaultSelectors);
  }

  registerExtractionEvents() {
    const { saveBtn, resetBtn } = this.elements;

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveExtractionRules();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.restoreDefaultExtractionRules();
      });
    }
  }

  showError(message) {
    const { errorContainer } = this.elements;
    if (!errorContainer) {
      return;
    }

    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
  }

  clearError() {
    const { errorContainer } = this.elements;
    if (!errorContainer) {
      return;
    }

    errorContainer.classList.add('hidden');
    errorContainer.textContent = '';
  }
}
