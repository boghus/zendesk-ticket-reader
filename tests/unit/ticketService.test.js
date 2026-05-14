// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/shared/utils/dom.js', () => ({
  queryFirst: vi.fn(),
}))

function mockLocation(href, pathname) {
  Object.defineProperty(window, 'location', {
    value: { href, pathname },
    writable: true,
    configurable: true,
  });
}

function makeEl(textContent) {
  return { textContent, getAttribute: () => null }
}

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
})

describe('extractWhenReady — path inmediato (sin navegación reciente)', () => {
  it('extrae ticketId desde la URL', async () => {
    mockLocation('https://x.zendesk.com/agent/tickets/123', '/agent/tickets/123');
    const { queryFirst } = await import('../../src/shared/utils/dom.js');
    const { extractWhenReady } = await import('../../src/core/services/ticketService.js');
    queryFirst.mockReturnValue(makeEl('Asunto'));

    const result = await extractWhenReady();

    expect(result.ticketId).toBe('123');
    expect(result.url).toBe('https://x.zendesk.com/agent/tickets/123');
  })

  it('retorna ticketId null cuando la URL no corresponde a un ticket', async () => {
    mockLocation('https://x.zendesk.com/agent', '/agent');
    const { queryFirst } = await import('../../src/shared/utils/dom.js');
    const { extractWhenReady } = await import('../../src/core/services/ticketService.js');
    queryFirst.mockReturnValue(null);

    const result = await extractWhenReady();

    expect(result.ticketId).toBeNull();
  })

  it('incluye subject, priority y dueDate en los datos extraídos', async () => {
    mockLocation('https://x.zendesk.com/agent/tickets/42', '/agent/tickets/42')
    const { queryFirst } = await import('../../src/shared/utils/dom.js')
    const { extractWhenReady } = await import('../../src/core/services/ticketService.js')
    queryFirst
      .mockReturnValueOnce(makeEl('Bug crítico'))
      .mockReturnValueOnce(makeEl('high'))
      .mockReturnValueOnce(null)

    const result = await extractWhenReady()

    expect(result.subject).toBe('Bug crítico')
    expect(result.priority).toBe('high')
    expect(result.dueDate).toBeNull()
  })
})

describe('extractWhenReady — path de polling (navegación reciente)', () => {
  // vi.setSystemTime(0) + lastNavigationTime=0 → timeSinceNav=0 < 3000 → entra al loop

  it('retorna cuando el subject se estabiliza entre dos iteraciones consecutivas', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    mockLocation('https://x.zendesk.com/agent/tickets/99', '/agent/tickets/99')

    const { queryFirst } = await import('../../src/shared/utils/dom.js')
    const { extractWhenReady } = await import('../../src/core/services/ticketService.js')

    // iter 1: subject=null → no match; iter 2+: subject estable
    queryFirst.mockReturnValueOnce(null).mockReturnValue(makeEl('Ticket estable'))

    const promise = extractWhenReady()
    await vi.advanceTimersByTimeAsync(600) // 3 iters × 200ms

    const result = await promise
    expect(result.subject).toBe('Ticket estable')
    expect(result.ticketId).toBe('99')
  })

  it('agota las 20 iteraciones y retorna aunque el subject nunca aparezca', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    mockLocation('https://x.zendesk.com/agent/tickets/0', '/agent/tickets/0')

    const { queryFirst } = await import('../../src/shared/utils/dom.js')
    const { extractWhenReady } = await import('../../src/core/services/ticketService.js')
    queryFirst.mockReturnValue(null)

    const promise = extractWhenReady()
    await vi.advanceTimersByTimeAsync(4100) // 20 × 200ms + margen

    const result = await promise
    expect(result.ticketId).toBe('0');
    expect(result.subject).toBeNull();
  })
})
