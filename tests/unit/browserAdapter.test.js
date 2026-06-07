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
});
