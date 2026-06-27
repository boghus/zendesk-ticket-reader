// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadOptionsModule() {
  vi.resetModules();

  let domContentLoadedHandler = null;
  const addEventListenerSpy = vi.spyOn(document, 'addEventListener').mockImplementation((type, listener) => {
    if (type === 'DOMContentLoaded') {
      domContentLoadedHandler = listener;
    }
  });

  await import('../../src/app/options/options.js');

  return {
    addEventListenerSpy,
    domContentLoadedHandler,
  };
}

describe('options', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    globalThis.browser = {
      runtime: {
        getManifest: vi.fn().mockReturnValue({ version: '2.4.6' }),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    delete globalThis.browser;
  });

  it('muestra la version desde el manifest al cargar', async () => {
    document.body.innerHTML = `
      <div id="app-version">—</div>
    `;

    const { domContentLoadedHandler } = await loadOptionsModule();

    expect(domContentLoadedHandler).toEqual(expect.any(Function));
    domContentLoadedHandler(new Event('DOMContentLoaded'));

    expect(document.getElementById('app-version').textContent).toBe('2.4.6');
  });

  it('usa un guion cuando el manifest no trae version', async () => {
    globalThis.browser.runtime.getManifest.mockReturnValue({});
    document.body.innerHTML = `
      <div id="app-version">—</div>
    `;

    const { domContentLoadedHandler } = await loadOptionsModule();

    domContentLoadedHandler(new Event('DOMContentLoaded'));

    expect(document.getElementById('app-version').textContent).toBe('—');
  });

  it('activa la seccion y el panel correspondientes al navegar', async () => {
    document.body.innerHTML = `
      <button type="button" data-section="about" class="nav-item active" aria-current="page">Acerca de</button>
      <button type="button" data-section="faq" class="nav-item">FAQ</button>
      <section data-panel="about" class="panel active"></section>
      <section data-panel="faq" class="panel"></section>
      <div id="app-version">—</div>
    `;

    const { domContentLoadedHandler } = await loadOptionsModule();
    domContentLoadedHandler(new Event('DOMContentLoaded'));

    const [aboutButton, faqButton] = document.querySelectorAll('[data-section]');
    faqButton.click();

    expect(aboutButton.classList.contains('active')).toBe(false);
    expect(aboutButton.hasAttribute('aria-current')).toBe(false);
    expect(faqButton.classList.contains('active')).toBe(true);
    expect(faqButton.getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('[data-panel="about"]').classList.contains('active')).toBe(false);
    expect(document.querySelector('[data-panel="faq"]').classList.contains('active')).toBe(true);
  });
});
