import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

vi.mock('../../src/shared/platform/browserAdapter.js', () => ({
  browserAPI: {
    storage: {
      local: storage,
    },
  },
}));

const { storageService } = await import('../../src/core/services/storageService.js');

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.get.mockResolvedValue({ settings: {} });
    storage.set.mockResolvedValue(undefined);
    storage.remove.mockResolvedValue(undefined);
  });

  it('gets a setting', async () => {
    storage.get.mockResolvedValue({ settings: { showPriority: false } });

    await expect(storageService.get('showPriority')).resolves.toBe(false);
    expect(storage.get).toHaveBeenCalledWith('settings');
  });

  it('gets all settings', async () => {
    storage.get.mockResolvedValue({ settings: { showPriority: false } });

    await expect(storageService.getAll()).resolves.toEqual({ showPriority: false });
  });

  it('sets a setting without replacing other settings', async () => {
    storage.get.mockResolvedValue({ settings: { showPriority: true } });

    await storageService.set('showDueDate', false);

    expect(storage.set).toHaveBeenCalledWith({
      settings: {
        showPriority: true,
        showDueDate: false,
      },
    });
  });

  it('removes a setting', async () => {
    storage.get.mockResolvedValue({ settings: { showPriority: true, showDueDate: false } });

    await storageService.remove('showDueDate');

    expect(storage.set).toHaveBeenCalledWith({
      settings: {
        showPriority: true,
      },
    });
  });

  it('resets the settings to the provided defaults', async () => {
    const defaults = { showPriority: true, showDueDate: true };

    await storageService.resetToDefault(defaults);

    expect(storage.set).toHaveBeenCalledWith({ settings: defaults });
  });
});
