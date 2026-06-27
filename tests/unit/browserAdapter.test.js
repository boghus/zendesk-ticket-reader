import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadBrowserUtils() {
  vi.resetModules();
  return import('../../src/shared/platform/browserAdapter.js');
}

afterEach(() => {
  vi.restoreAllMocks();
  delete globalThis.browser;
  delete globalThis.chrome;
});

describe('adaptador de navegador', () => {
  it('usa APIs browser basadas en promesas cuando estan disponibles', async () => {
    const query = vi.fn().mockResolvedValue([{ id: 123 }]);
    const sendMessage = vi.fn().mockResolvedValue({ ticketId: '123' });
    const executeScript = vi.fn().mockResolvedValue([]);

    globalThis.browser = {
      tabs: { query, sendMessage },
      scripting: { executeScript },
      runtime: {
        onMessage: {
          addListener: vi.fn(),
        },
      },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.tabs.query({ active: true })).resolves.toEqual([{ id: 123 }]);
    await expect(browserAPI.tabs.sendMessage(123, { type: 'GET_TICKET_DATA' })).resolves.toEqual({
      ticketId: '123',
    });
    await expect(browserAPI.scripting.executeScript({ target: { tabId: 123 } })).resolves.toEqual([]);
  });

  it('envuelve APIs chrome con callbacks en promesas', async () => {
    const query = vi.fn((_queryInfo, callback) => callback([{ id: 123 }]));
    const sendMessage = vi.fn((_tabId, _message, callback) => callback({ ticketId: '123' }));
    const executeScript = vi.fn((_details, callback) => callback([]));

    globalThis.chrome = {
      tabs: { query, sendMessage },
      scripting: { executeScript },
      runtime: {
        lastError: null,
        onMessage: {
          addListener: vi.fn(),
        },
      },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.tabs.query({ active: true })).resolves.toEqual([{ id: 123 }]);
    await expect(browserAPI.tabs.sendMessage(123, { type: 'GET_TICKET_DATA' })).resolves.toEqual({
      ticketId: '123',
    });
    await expect(browserAPI.scripting.executeScript({ target: { tabId: 123 } })).resolves.toEqual([]);
  });

  it('rechaza APIs chrome con callbacks cuando runtime.lastError esta definido', async () => {
    const query = vi.fn((_queryInfo, callback) => {
      globalThis.chrome.runtime.lastError = { message: 'No tab found' };
      callback();
    });

    globalThis.chrome = {
      tabs: { query },
      scripting: {},
      runtime: {
        lastError: null,
        onMessage: {
          addListener: vi.fn(),
        },
      },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.tabs.query({ active: true })).rejects.toThrow('No tab found');
  });

  it('convierte excepciones sincronas de APIs browser en rechazos', async () => {
    const query = vi.fn(() => {
      throw new Error('Query failed');
    });

    globalThis.browser = {
      tabs: { query },
      runtime: {
        onMessage: {
          addListener: vi.fn(),
        },
      },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.tabs.query({ active: true })).rejects.toThrow('Query failed');
  });

  it('expone runtime.openOptionsPage para APIs browser basadas en promesas', async () => {
    const openOptionsPage = vi.fn().mockResolvedValue(undefined);

    globalThis.browser = {
      runtime: {
        openOptionsPage,
        getManifest: vi.fn().mockReturnValue({ version: '1.2.3' }),
        onMessage: {
          addListener: vi.fn(),
        },
      },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.runtime.openOptionsPage()).resolves.toBeUndefined();
    expect(openOptionsPage).toHaveBeenCalledWith();
  });

  it('envuelve runtime.openOptionsPage de Chrome con callbacks en promesas', async () => {
    const openOptionsPage = vi.fn((callback) => callback());

    globalThis.chrome = {
      runtime: {
        openOptionsPage,
        lastError: null,
        getManifest: vi.fn().mockReturnValue({ version: '1.2.3' }),
        onMessage: {
          addListener: vi.fn(),
        },
      },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.runtime.openOptionsPage()).resolves.toBeUndefined();
    expect(openOptionsPage).toHaveBeenCalledWith(expect.any(Function));
  });

  it('expone runtime.getManifest sin envolver la respuesta', async () => {
    const getManifest = vi.fn().mockReturnValue({ version: '9.9.9' });

    globalThis.browser = {
      runtime: {
        getManifest,
        onMessage: {
          addListener: vi.fn(),
        },
      },
    };

    const { browserAPI } = await loadBrowserUtils();

    expect(browserAPI.runtime.getManifest()).toEqual({ version: '9.9.9' });
    expect(getManifest).toHaveBeenCalledTimes(1);
  });

  it('retorna promesas desde listeners asincronos de mensajes en Firefox', async () => {
    const addListener = vi.fn();

    globalThis.browser = {
      runtime: {
        onMessage: { addListener },
      },
    };

    const { addRuntimeMessageListener } = await loadBrowserUtils();

    addRuntimeMessageListener(() => Promise.resolve({ ok: true }));

    const listener = addListener.mock.calls[0][0];

    await expect(listener({ type: 'GET_TICKET_DATA' })).resolves.toEqual({ ok: true });
  });

  it('retorna payload de error cuando un listener sincronico falla en Firefox', async () => {
    const addListener = vi.fn();

    globalThis.browser = {
      runtime: {
        onMessage: { addListener },
      },
    };

    const { addRuntimeMessageListener } = await loadBrowserUtils();

    addRuntimeMessageListener(() => {
      throw new Error('Handler failed');
    });

    const listener = addListener.mock.calls[0][0];

    expect(listener({ type: 'GET_TICKET_DATA' })).toEqual({ error: 'Handler failed' });
  });

  it('usa sendResponse para listeners asincronos de mensajes en Chrome', async () => {
    const addListener = vi.fn();

    globalThis.chrome = {
      runtime: {
        lastError: null,
        onMessage: { addListener },
      },
    };

    const { addRuntimeMessageListener } = await loadBrowserUtils();

    addRuntimeMessageListener(() => Promise.resolve({ ok: true }));

    const listener = addListener.mock.calls[0][0];
    const sendResponse = vi.fn();

    expect(listener({ type: 'GET_TICKET_DATA' }, {}, sendResponse)).toBe(true);
    await vi.waitFor(() => expect(sendResponse).toHaveBeenCalledWith({ ok: true }));
  });

  it('responde con payload de error cuando un listener sincronico falla en Chrome', async () => {
    const addListener = vi.fn();

    globalThis.chrome = {
      runtime: {
        lastError: null,
        onMessage: { addListener },
      },
    };

    const { addRuntimeMessageListener } = await loadBrowserUtils();

    addRuntimeMessageListener(() => {
      throw new Error('Handler failed');
    });

    const listener = addListener.mock.calls[0][0];
    const sendResponse = vi.fn();

    expect(listener({ type: 'GET_TICKET_DATA' }, {}, sendResponse)).toBe(false);
    expect(sendResponse).toHaveBeenCalledWith({ error: 'Handler failed' });
  });
  it('usa APIs storage basadas en promesas cuando están disponibles', async () => {
    const get = vi.fn().mockResolvedValue({ key: 'value' });
    const set = vi.fn().mockResolvedValue(undefined);
    const remove = vi.fn().mockResolvedValue(undefined);
    const clear = vi.fn().mockResolvedValue(undefined);

    globalThis.browser = {
      storage: { local: { get, set, remove, clear } },
      runtime: { onMessage: { addListener: vi.fn() } },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.storage.get('key')).resolves.toEqual({ key: 'value' });
    await expect(browserAPI.storage.set({ key: 'value' })).resolves.toBeUndefined();
    await expect(browserAPI.storage.remove('key')).resolves.toBeUndefined();
    await expect(browserAPI.storage.clear()).resolves.toBeUndefined();

    expect(get).toHaveBeenCalledWith('key');
    expect(set).toHaveBeenCalledWith({ key: 'value' });
    expect(remove).toHaveBeenCalledWith('key');
    expect(clear).toHaveBeenCalled();
  });

  it('envuelve APIs storage de Chrome con callbacks en promesas', async () => {
    const get = vi.fn((_key, cb) => cb({ key: 'value' }));
    const set = vi.fn((_data, cb) => cb());
    const remove = vi.fn((_key, cb) => cb());
    const clear = vi.fn((cb) => cb());

    globalThis.chrome = {
      storage: { local: { get, set, remove, clear } },
      runtime: { lastError: null, onMessage: { addListener: vi.fn() } },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.storage.get('key')).resolves.toEqual({ key: 'value' });
    await expect(browserAPI.storage.set({ key: 'value' })).resolves.toBeUndefined();
    await expect(browserAPI.storage.remove('key')).resolves.toBeUndefined();
    await expect(browserAPI.storage.clear()).resolves.toBeUndefined();

    expect(get).toHaveBeenCalledWith('key', expect.any(Function));
    expect(set).toHaveBeenCalledWith({ key: 'value' }, expect.any(Function));
    expect(remove).toHaveBeenCalledWith('key', expect.any(Function));
    expect(clear).toHaveBeenCalledWith(expect.any(Function));
  });

  it('rechaza API storage chrome con callbacks cuando runtime.lastError está definido', async () => {
    const get = vi.fn((_key, cb) => {
      globalThis.chrome.runtime.lastError = { message: 'Storage error' };
      cb();
    });

    globalThis.chrome = {
      storage: { local: { get } },
      runtime: { lastError: null, onMessage: { addListener: vi.fn() } },
    };

    const { browserAPI } = await loadBrowserUtils();

    await expect(browserAPI.storage.get('key')).rejects.toThrow('Storage error');
  });

});
