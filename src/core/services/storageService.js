import { browserAPI } from '../../shared/platform/browserAdapter.js';

const SETTINGS_KEY = 'settings';

async function readSettings() {
  const stored = await browserAPI.storage.local.get(SETTINGS_KEY);
  return stored[SETTINGS_KEY] ?? {};
}

async function writeSettings(settings) {
  await browserAPI.storage.local.set({
    [SETTINGS_KEY]: settings,
  });
}

export const storageService = {
  async get(key) {
    const settings = await readSettings();
    return settings[key];
  },

  async getAll() {
    return readSettings();
  },

  async set(key, value) {
    const settings = await readSettings();
    settings[key] = value;
    await writeSettings(settings);
  },

  async remove(key) {
    const settings = await readSettings();
    delete settings[key];
    await writeSettings(settings);
  },

  async resetToDefault(defaultSettings) {
    await writeSettings({ ...defaultSettings });
  },
};
