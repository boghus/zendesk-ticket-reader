import { describe, expect, it } from 'vitest';
import DEFAULT_SELECTORS from '../../src/config/defaultSelectors.json';

describe('Configuración de Selectores', () => {
  it('debe tener las claves requeridas para la extracción', () => {
    const requiredKeys = ['subject', 'priority', 'dueDate'];
    expect(Object.keys(DEFAULT_SELECTORS)).toEqual(expect.arrayContaining(requiredKeys));
  });

  it('cada selector debe tener la estructura correcta', () => {
    Object.values(DEFAULT_SELECTORS).forEach(config => {
      expect(config).toHaveProperty('selectors');
      expect(Array.isArray(config.selectors)).toBe(true);
      expect(config.selectors.length).toBeGreaterThan(0);
      expect(config).toHaveProperty('extractor');
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('display');
    });
  });
});
