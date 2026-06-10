import { describe, it, expect } from 'vitest';
import { SanitizerService } from '../../src/core/services/sanitizerService.js';

describe('SanitizerService.escapeHtml', () => {
  it('no modifica strings que no contienen caracteres HTML especiales', () => {
    expect(SanitizerService.escapeHtml('Hola Mundo')).toBe('Hola Mundo');
    expect(SanitizerService.escapeHtml('Error: No se pudo conectar')).toBe('Error: No se pudo conectar');
  });

  it('escapa caracteres HTML especiales correctamente (OWASP)', () => {
    expect(SanitizerService.escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    expect(SanitizerService.escapeHtml('<img src=x onerror=alert(1)>')).toBe('&lt;img src&#x3D;x onerror&#x3D;alert(1)&gt;');
    expect(SanitizerService.escapeHtml('A & B')).toBe('A &amp; B');
    expect(SanitizerService.escapeHtml("John's status")).toBe('John&#x27;s status');
    expect(SanitizerService.escapeHtml('a/b')).toBe('a&#x2F;b');
    expect(SanitizerService.escapeHtml('`hello`')).toBe('&#x60;hello&#x60;');
    expect(SanitizerService.escapeHtml('x=y')).toBe('x&#x3D;y');
  });

  it('retorna string vacío para valores no string', () => {
    expect(SanitizerService.escapeHtml(null)).toBe('');
    expect(SanitizerService.escapeHtml(undefined)).toBe('');
    expect(SanitizerService.escapeHtml(123)).toBe('');
  });
});
