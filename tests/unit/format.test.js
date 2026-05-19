import { describe, expect, it } from 'vitest';
import { buildClipboardText, extractDueDate, extractText } from '../../src/shared/utils/format.js';

describe('extractText', () => {
  it('retorna null cuando el elemento es null', () => {
    expect(extractText(null)).toBeNull();
  });

  it('retorna el value de un input', () => {
    expect(extractText({ value: 'hello' })).toBe('hello');
  });

  it('retorna textContent cuando no hay value', () => {
    expect(extractText({ textContent: 'hello' })).toBe('hello');
  });

  it('retorna innerText cuando no hay value ni textContent', () => {
    expect(extractText({ innerText: 'hello' })).toBe('hello');
  });

  it('elimina espacios en blanco al inicio y al final', () => {
    expect(extractText({ textContent: '  hello  ' })).toBe('hello');
  });

  it('retorna null cuando el texto queda vacío después de trim', () => {
    expect(extractText({ textContent: '   ' })).toBeNull();
  });
});

describe('extractDueDate', () => {
  it('retorna null cuando el elemento es null', () => {
    expect(extractDueDate(null)).toBeNull();
  });

  it('formatea el atributo datetime en español', () => {
    const el = { getAttribute: (attr) => attr === 'datetime' ? '2025-05-20T10:30:00Z' : null };
    const result = extractDueDate(el);
    expect(result).toContain('2025');
    expect(result).toContain('mayo');
  });

  it('usa extractText como fallback cuando no hay atributo datetime', () => {
    const el = { getAttribute: () => null, textContent: 'mañana' };
    expect(extractDueDate(el)).toBe('mañana');
  });
});

describe('buildClipboardText', () => {
  it('genera el texto con todos los campos', () => {
    const data = {
      ticketId: '123',
      subject: 'Bug crítico',
      url: 'https://example.zendesk.com/tickets/123',
      priority: 'high',
      dueDate: '20 de mayo de 2025',
    };
    const result = buildClipboardText(data);
    expect(result).toContain('*TICKET #123*: Bug crítico');
    expect(result).toContain(data.url);
    expect(result).toContain('*VENCIMIENTO*: 20 de mayo de 2025');
    expect(result).toContain('*PRIORIDAD*: high');
  });

  it('usa valores por defecto cuando faltan prioridad y fecha', () => {
    const data = { ticketId: '1', subject: 'Test', url: 'http://x.com', priority: null, dueDate: null };
    const result = buildClipboardText(data);
    expect(result).toContain('Sin prioridad');
    expect(result).toContain('Sin fecha asignada');
  });

  it('usa — cuando falta el asunto', () => {
    const data = { ticketId: '1', subject: null, url: 'http://x.com', priority: null, dueDate: null };
    expect(buildClipboardText(data)).toContain('*TICKET #1*: —');
  });
});
