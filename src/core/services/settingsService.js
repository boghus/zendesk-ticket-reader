import { defaultSettings } from '../settings/defaultSettings.js';
import { storageService } from './storageService.js';

export const settingsService = {
  async get(key) {
    const value = await storageService.get(key);
    return value ?? defaultSettings[key];
  },

  async getAll() {
    const storedSettings = await storageService.getAll();
    return {
      ...defaultSettings,
      ...storedSettings,
    };
  },

  async set(key, value) {
    await storageService.set(key, value);
  },

  async update(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await storageService.set(key, value);
    }
  },

  async reset() {
    await storageService.resetToDefault(defaultSettings);
  },
};
