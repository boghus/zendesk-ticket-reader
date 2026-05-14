// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { isVisible, queryFirst } from '../../src/shared/utils/dom.js';

describe('isVisible', () => {
  it('retorna true para un elemento visible', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(isVisible(el)).toBe(true);
    el.remove();
  });

  it('retorna false para un elemento oculto', () => {
    const el = document.createElement('div');
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    expect(isVisible(el)).toBe(false);
    el.remove();
  });
});

describe('queryFirst', () => {
  it('retorna el primer elemento visible que coincide', () => {
    const el = document.createElement('div');
    el.className = 'target';
    document.body.appendChild(el);
    expect(queryFirst(['.target'])).toBe(el);
    el.remove();
  });

  it('retorna null cuando ningún selector coincide', () => {
    expect(queryFirst(['.no-existe'])).toBeNull();
  });

  it('ignora elementos ocultos y retorna el visible', () => {
    const hidden = document.createElement('div');
    hidden.className = 'target';
    hidden.style.visibility = 'hidden';

    const visible = document.createElement('div');
    visible.className = 'target';

    document.body.appendChild(hidden);
    document.body.appendChild(visible);

    expect(queryFirst(['.target'])).toBe(visible);

    hidden.remove();
    visible.remove();
  });

  it('prueba el siguiente selector cuando el primero no tiene coincidencias', () => {
    const el = document.createElement('div');
    el.className = 'fallback';
    document.body.appendChild(el);
    expect(queryFirst(['.no-match', '.fallback'])).toBe(el);
    el.remove();
  });
});
