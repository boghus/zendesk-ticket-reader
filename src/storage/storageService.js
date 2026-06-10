import { browserAPI } from '../shared/platform/browserAdapter.js';

export class StorageService {
  /**
   * Obtiene uno o varios valores del almacenamiento.
   * @param {string|string[]|Object|null} key - La clave, array de claves, u objeto con valores por defecto.
   * @param {*} defaultValue - Valor de respaldo si la clave no existe (solo aplica si key es un string).
   */
  static async get(key, defaultValue = null) {
    try {
      const result = await browserAPI.storage.get(key);

      // Si pasaste un string, devolvemos el valor directo o el default
      if (typeof key === 'string') {
        return result[key] ?? defaultValue;
      }

      // Si pasaste un array, null (todo), u un objeto, devolvemos el objeto completo resultante
      return result;
    } catch (error) {
      console.error('[StorageService] Error getting key:', key, error);
      return typeof key === 'string' ? defaultValue : {};
    }
  }

  /**
   * Guarda uno o varios pares clave/valor.
   * @param {string|Object} keyOrObject - Una clave (string) o un objeto con múltiples datos { k1: v1, k2: v2 }
   * @param {*} [value] - El valor a guardar (solo si el primer parámetro es un string)
   */
  static async set(keyOrObject, value) {
    try {
      const dataToSet = typeof keyOrObject === 'string'
        ? { [keyOrObject]: value }
        : keyOrObject;

      await browserAPI.storage.set(dataToSet);
    } catch (error) {
      console.error('[StorageService] Error setting data', keyOrObject, error);
      throw error;
    }
  }

  static async remove(key) {
    try {
      await browserAPI.storage.remove(key);
    } catch (error) {
      console.error('[StorageService] Error removing key:', key, error);
      throw error;
    }
  }

  static async clear() {
    try {
      await browserAPI.storage.clear();
    } catch (error) {
      console.error('[StorageService] Error clearing storage', error);
      throw error;
    }
  }
}
