import { beforeEach, describe, expect, it, vi } from 'vitest';

const storageService = {
  get: vi.fn(),
  getAll: vi.fn(),
  set: vi.fn(),
  resetToDefault: vi.fn(),
};

vi.mock('../../src/core/services/storageService.js', () => ({
  storageService,
}));

const { settingsService } = await import('../../src/core/services/settingsService.js');

describe('settingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageService.get.mockResolvedValue(undefined);
    storageService.getAll.mockResolvedValue({});
    storageService.set.mockResolvedValue(undefined);
    storageService.resetToDefault.mockResolvedValue(undefined);
  });

  it('returns the default value when a setting is not stored', async () => {
    await expect(settingsService.get('showPriority')).resolves.toBe(true);
  });

  it('merges stored settings with defaults', async () => {
    storageService.getAll.mockResolvedValue({ showPriority: false });

    await expect(settingsService.getAll()).resolves.toEqual({
      showPriority: false,
      showDueDate: true,
    });
  });

  it('updates multiple settings', async () => {
    await settingsService.update({ showPriority: false, showDueDate: false });

    expect(storageService.set).toHaveBeenNthCalledWith(1, 'showPriority', false);
    expect(storageService.set).toHaveBeenNthCalledWith(2, 'showDueDate', false);
  });

  it('resets to defaults', async () => {
    await settingsService.reset();

    expect(storageService.resetToDefault).toHaveBeenCalledWith({
      showPriority: true,
      showDueDate: true,
    });
  });
});
