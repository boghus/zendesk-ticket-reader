import { beforeEach, describe, expect, it, vi } from 'vitest';
import DEFAULT_SELECTORS from '../../src/config/defaultSelectors.json';
import { SelectorsRepository } from '../../src/storage/selectorsRepository.js';
import { StorageService } from '../../src/storage/storageService.js';

vi.mock('../../src/storage/storageService.js', () => ({
  StorageService: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../src/config/defaultSelectors.json', () => ({
  default: {
    subject: ['.old-subject'],
    priority: ['.old-priority'],
  },
}));

describe('SelectorsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resetear el cache interno manual ya que es una propiedad estática
    SelectorsRepository._cache = null;
  });

  describe('initialize', () => {
    it('debe cargar los selectores existentes si están en storage', async () => {
      const mockData = { subject: ['.custom-subject'] };
      StorageService.get.mockResolvedValue(mockData);

      await SelectorsRepository.initialize();

      expect(SelectorsRepository._cache).toEqual(mockData);
      expect(StorageService.set).not.toHaveBeenCalledWith('selectors', expect.anything());
    });

    it('debe guardar los DEFAULT_SELECTORS si el storage está vacío', async () => {
      StorageService.get.mockResolvedValue(null);

      await SelectorsRepository.initialize();

      expect(SelectorsRepository._cache).toEqual(DEFAULT_SELECTORS);
      expect(StorageService.set).toHaveBeenCalledWith('selectors', DEFAULT_SELECTORS);
    });
  });

  describe('getAll', () => {
    it('debe retornar el cache si ya existe sin consultar storage', async () => {
      SelectorsRepository._cache = { cached: true };
      
      const result = await SelectorsRepository.getAll();
      
      expect(result).toEqual({ cached: true });
      expect(StorageService.get).not.toHaveBeenCalled();
    });

    it('debe consultar el storage si el cache es nulo', async () => {
      const mockData = { fromStorage: true };
      StorageService.get.mockResolvedValue(mockData);

      const result = await SelectorsRepository.getAll();

      expect(result).toEqual(mockData);
      expect(SelectorsRepository._cache).toEqual(mockData);
    });
  });

  describe('getByKey', () => {
    it('debe retornar los selectores de una clave específica', async () => {
      SelectorsRepository._cache = { subject: ['.target'] };
      
      const result = await SelectorsRepository.getByKey('subject');
      
      expect(result).toEqual(['.target']);
    });

    it('debe retornar un array vacío si la clave no existe', async () => {
      SelectorsRepository._cache = { subject: ['.target'] };
      
      const result = await SelectorsRepository.getByKey('nonExistent');
      
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('debe actualizar el cache y persistir en storage', async () => {
      SelectorsRepository._cache = { subject: ['.old'] };
      const newValue = ['.new'];

      await SelectorsRepository.update('subject', newValue);

      expect(SelectorsRepository._cache.subject).toEqual(newValue);
      expect(StorageService.set).toHaveBeenCalledWith('selectors', { subject: newValue });
    });
  });

  describe('reset', () => {
    it('debe volver a los valores por defecto', async () => {
      SelectorsRepository._cache = { subject: ['.modified'] };

      await SelectorsRepository.reset();

      expect(SelectorsRepository._cache).toEqual(DEFAULT_SELECTORS);
      expect(StorageService.set).toHaveBeenCalledWith('selectors', DEFAULT_SELECTORS);
    });
  });
});
