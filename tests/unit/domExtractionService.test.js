// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DEFAULT_SELECTORS from '../../src/config/defaultSelectors.json';
import { DomExtractionService } from '../../src/core/services/domExtractionService.js';
import { StorageService } from '../../src/storage/storageService.js';

vi.mock('../../src/storage/storageService.js', () => ({
  StorageService: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('DomExtractionService', () => {
  let service;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="config-error" class="hidden"></div>
      <textarea id="config-textarea"></textarea>
      <button id="btn-save-config">Guardar Configuración</button>
      <button id="btn-reset-config">Restablecer por Defecto</button>
    `;
    vi.clearAllMocks();
    service = new DomExtractionService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Carga de reglas (loadExtractionRules)', () => {
    it('carga las reglas almacenadas', async () => {
      const storedRules = { subject: { selectors: ['.stored-class'] } };
      StorageService.get.mockResolvedValue(storedRules);

      const rules = await service.loadExtractionRules();

      expect(StorageService.get).toHaveBeenCalledWith('selectors', DEFAULT_SELECTORS);
      expect(rules).toEqual(storedRules);
    });

    it('utiliza las reglas por defecto cuando no existen datos almacenados', async () => {
      StorageService.get.mockResolvedValue(DEFAULT_SELECTORS);

      const rules = await service.loadExtractionRules();

      expect(StorageService.get).toHaveBeenCalledWith('selectors', DEFAULT_SELECTORS);
      expect(rules).toEqual(DEFAULT_SELECTORS);
    });

    it('renderiza correctamente el JSON en el textarea', async () => {
      const customRules = { testKey: 'testValue' };
      StorageService.get.mockResolvedValue(customRules);

      await service.loadExtractionRules();

      const textarea = document.getElementById('config-textarea');
      expect(textarea.value).toBe(JSON.stringify(customRules, null, 2));
    });

    it('retorna null y no falla si el textarea no existe en el DOM', async () => {
      document.body.innerHTML = '';
      const result = await service.loadExtractionRules();
      expect(result).toBeNull();
    });
  });

  describe('Guardado de reglas (saveExtractionRules)', () => {
    it('guarda correctamente unas reglas válidas', async () => {
      const validRules = { ticketId: ['.ticket-id'] };
      const textarea = document.getElementById('config-textarea');
      textarea.value = JSON.stringify(validRules);

      StorageService.set.mockResolvedValue(true);

      const success = await service.saveExtractionRules();

      expect(StorageService.set).toHaveBeenCalledWith('selectors', validRules);
      expect(success).toBe(true);
    });

    it('muestra el estado "Guardando...", "¡Guardado!" y restaura el texto original del botón', async () => {
      vi.useFakeTimers();
      const saveBtn = document.getElementById('btn-save-config');
      const textarea = document.getElementById('config-textarea');
      textarea.value = JSON.stringify({ key: 'val' });
      StorageService.set.mockResolvedValue(true);

      const savePromise = service.saveExtractionRules();

      expect(saveBtn.textContent).toBe('Guardando...');
      expect(saveBtn.disabled).toBe(true);

      await savePromise;

      expect(saveBtn.textContent).toBe('¡Guardado!');

      vi.advanceTimersByTime(1500);

      expect(saveBtn.textContent).toBe('Guardar Configuración');
      expect(saveBtn.disabled).toBe(false);
    });

    it('muestra un mensaje de error cuando el JSON es inválido', async () => {
      const textarea = document.getElementById('config-textarea');
      const errorContainer = document.getElementById('config-error');
      textarea.value = '{ invalid json: ';

      const success = await service.saveExtractionRules();

      expect(success).toBe(false);
      expect(errorContainer.classList.contains('hidden')).toBe(false);
      expect(errorContainer.textContent).toContain('Error:');
    });

    it('no persiste información cuando falla el parseo', async () => {
      const textarea = document.getElementById('config-textarea');
      textarea.value = 'invalid json';

      await service.saveExtractionRules();

      expect(StorageService.set).not.toHaveBeenCalled();
    });

    it('retorna false si faltan elementos en el DOM', async () => {
      document.body.innerHTML = '';
      const result = await service.saveExtractionRules();
      expect(result).toBe(false);
    });
  });

  describe('Restaurar reglas (restoreDefaultExtractionRules)', () => {
    it('limpia cualquier mensaje de error', () => {
      const errorContainer = document.getElementById('config-error');
      errorContainer.textContent = 'Un error previo';
      errorContainer.classList.remove('hidden');

      service.restoreDefaultExtractionRules();

      expect(errorContainer.classList.contains('hidden')).toBe(true);
      expect(errorContainer.textContent).toBe('');
    });

    it('restaura las reglas por defecto en el textarea', () => {
      const textarea = document.getElementById('config-textarea');
      textarea.value = '{"modified": true}';

      service.restoreDefaultExtractionRules();

      expect(textarea.value).toBe(JSON.stringify(DEFAULT_SELECTORS, null, 2));
    });

    it('no falla si faltan elementos en el DOM', () => {
      document.body.innerHTML = '';
      expect(() => service.restoreDefaultExtractionRules()).not.toThrow();
    });
  });

  describe('Registro de eventos (registerExtractionEvents)', () => {
    it('registra el evento click del botón Guardar', () => {
      const saveSpy = vi.spyOn(service, 'saveExtractionRules').mockImplementation(() => Promise.resolve(true));
      service.registerExtractionEvents();

      const saveBtn = document.getElementById('btn-save-config');
      saveBtn.click();

      expect(saveSpy).toHaveBeenCalled();
    });

    it('registra el evento click del botón Restaurar', () => {
      const restoreSpy = vi.spyOn(service, 'restoreDefaultExtractionRules').mockImplementation(() => {});
      service.registerExtractionEvents();

      const resetBtn = document.getElementById('btn-reset-config');
      resetBtn.click();

      expect(restoreSpy).toHaveBeenCalled();
    });

    it('no falla si los botones no existen en el DOM', () => {
      document.body.innerHTML = '';
      expect(() => service.registerExtractionEvents()).not.toThrow();
    });
  });

  describe('Manejo defensivo de errores y elementos personalizados', () => {
    it('showError y clearError no fallan si errorContainer no existe', () => {
      document.body.innerHTML = '';
      expect(() => service.showError('test error')).not.toThrow();
      expect(() => service.clearError()).not.toThrow();
    });

    it('renderExtractionRules no falla si textarea no existe', () => {
      document.body.innerHTML = '';
      expect(() => service.renderExtractionRules({})).not.toThrow();
    });

    it('permite inyectar domElements personalizados', () => {
      const customTextarea = document.createElement('textarea');
      const customService = new DomExtractionService({
        domElements: { textarea: customTextarea },
      });
      customService.renderExtractionRules({ foo: 'bar' });
      expect(customTextarea.value).toBe(JSON.stringify({ foo: 'bar' }, null, 2));
    });
  });
});
