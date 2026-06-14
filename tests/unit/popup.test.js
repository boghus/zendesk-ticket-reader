// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock global chrome
globalThis.chrome = {
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
};

describe('popup - setStatus', () => {
  beforeEach(() => {
    // Setup required DOM elements
    document.body.innerHTML = `
      <div id="status"></div>
      <div id="data-content"></div>
      <div id="btn-row"></div>
      <div id="ticket-id"></div>
      <div id="field-subject"></div>
      <div id="field-priority"></div>
      <div id="field-due-date"></div>
      <button id="refresh-btn"></button>
      <button id="copy-btn"></button>
    `;
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('sanitiza mensajes de error pasados a setStatus', async () => {
    const { setStatus } = await import('../../src/app/popup/popup.js');

    const maliciousMsg = '<img src=x onerror=alert(1)>';
    setStatus(maliciousMsg, true);

    const statusEl = document.getElementById('status');
    expect(statusEl.innerHTML).toBe('<strong>Error</strong><br>&lt;img src=x onerror=alert(1)&gt;');
    expect(statusEl.className).toBe('error');
    expect(statusEl.style.display).toBe('block');
  });

  it('sanitiza mensajes de carga pasados a setStatus', async () => {
    const { setStatus } = await import('../../src/app/popup/popup.js');

    const maliciousMsg = '<script>console.log("hello")</script>';
    setStatus(maliciousMsg, false);

    const statusEl = document.getElementById('status');
    expect(statusEl.innerHTML).toBe('<div class="spinner"></div>&lt;script&gt;console.log("hello")&lt;/script&gt;');
    expect(statusEl.className).toBe('');
    expect(statusEl.style.display).toBe('block');
  });
});
