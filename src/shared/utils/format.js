export function extractText(el) {
  if (!el) { return null; }
  return (el.value || el.textContent || el.innerText || '').trim() || null;
}

export function extractDueDate(el) {
  if (!el) { return null; }
  const dt = el.getAttribute?.('datetime');
  if (dt) {
    return new Date(dt).toLocaleString('es', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
  return extractText(el);
}

export function buildClipboardText(data) {
  const priority = data.priority || 'Sin prioridad';
  const dueDate = data.dueDate || 'Sin fecha asignada';
  return [
    `*TICKET #${data.ticketId}*: ${data.subject || '—'}`,
    data.url,
    '*ASIGNADO*: @',
    `*VENCIMIENTO*: ${dueDate}`,
    `*PRIORIDAD*: ${priority}`,
  ].join('\n');
}
