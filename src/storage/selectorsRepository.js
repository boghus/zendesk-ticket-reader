import defaultSelectors from '../config/defaultSelectors.json';
import StorageService from '../services/StorageService.js';

const STORAGE_KEY = 'zendesk_field_selectors';

export class SelectorsRepository {
  static async getAll() {
    const selectors = await StorageService.get(STORAGE_KEY);
    if (!selectors || Object.keys(selectors).length === 0) {
      await this.reset();
      return defaultSelectors;
    }
    return selectors;
  }

  static async getById(id) {
    const selectors = await this.getAll();
    return selectors[id] || null;
  }

  static async save(id, selectorData) {
    const selectors = await this.getAll();
    selectors[id] = { ...selectorData };
    await StorageService.set(STORAGE_KEY, selectors);
  }

  static async remove(id) {
    const selectors = await this.getAll();
    if (selectors[id]) {
      delete selectors[id];
      await StorageService.set(STORAGE_KEY, selectors);
    }
  }

  static async reset() {
    await StorageService.set(STORAGE_KEY, defaultSelectors);
  }
}

export default SelectorsRepository;
