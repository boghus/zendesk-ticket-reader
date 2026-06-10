import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from '../../src/storage/storageService.js';

// Mock global de la API browser para evitar "ReferenceError: browser is not defined"
globalThis.browser = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  },
};

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('debe retornar el valor directamente cuando la clave es un string', async () => {
      browser.storage.local.get.mockResolvedValue({ myKey: 'myValue' });
      const result = await StorageService.get('myKey');
      expect(result).toBe('myValue');
      expect(browser.storage.local.get).toHaveBeenCalledWith('myKey');
    });

    it('debe retornar defaultValue si la clave no existe en el storage', async () => {
      browser.storage.local.get.mockResolvedValue({});
      const result = await StorageService.get('missingKey', 'fallback');
      expect(result).toBe('fallback');
    });

    it('debe retornar el objeto completo si se pasa un array de claves o null', async () => {
      const mockData = { a: 1, b: 2 };
      browser.storage.local.get.mockResolvedValue(mockData);
      const result = await StorageService.get(['a', 'b']);
      expect(result).toEqual(mockData);
    });

    it('debe retornar el default y loguear error si la API de browser falla', async () => {
      const error = new Error('Storage error');
      browser.storage.local.get.mockRejectedValue(error);
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await StorageService.get('key', 'default');
      expect(result).toBe('default');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('debe envolver clave/valor en un objeto si se pasan como argumentos separados', async () => {
      await StorageService.set('key', 'value');
      expect(browser.storage.local.set).toHaveBeenCalledWith({ key: 'value' });
    });

    it('debe pasar el objeto directamente si el primer argumento es un objeto', async () => {
      const data = { a: 1, b: 2 };
      await StorageService.set(data);
      expect(browser.storage.local.set).toHaveBeenCalledWith(data);
    });
  });

  describe('remove y clear', () => {
    it('debe invocar los métodos nativos de browser.storage', async () => {
      await StorageService.remove('key');
      expect(browser.storage.local.remove).toHaveBeenCalledWith('key');
      await StorageService.clear();
      expect(browser.storage.local.clear).toHaveBeenCalled();
    });
  });
});
