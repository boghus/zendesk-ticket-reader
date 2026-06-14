import DEFAULT_SELECTORS from '../config/defaultSelectors.json';
import { StorageService } from './storageService.js';

const STORAGE_KEY = 'selectors';

export class SelectorsRepository {
  static _cache = null;

  static async initialize() {
    const existingSelectors = await StorageService.get(STORAGE_KEY);

    if (existingSelectors) {
      this._cache = existingSelectors;
    } else {
      await StorageService.set(STORAGE_KEY, DEFAULT_SELECTORS);
      this._cache = DEFAULT_SELECTORS;
    }
  }

  static async getAll() {
    if (!this._cache) {
      await this.initialize();
    }
  
    return this._cache;
  }

  static async getByKey(key) {
    const selectors = await this.getAll();

    return selectors[key] || [];
  }

  static async update(key, value) {
    const selectors = await this.getAll();

    selectors[key] = value;
    this._cache = { ...selectors };

    await StorageService.set(
      STORAGE_KEY,
      this._cache,
    );
  }

  static async reset() {
    this._cache = DEFAULT_SELECTORS;
    await StorageService.set(
      STORAGE_KEY,
      DEFAULT_SELECTORS,
    );
  }
}
