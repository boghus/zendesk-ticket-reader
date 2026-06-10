import { PRIORITY_LABELS } from '../../shared/constants/labels.js';
import { browserAPI } from '../../shared/platform/browserAdapter.js';
import { buildClipboardText } from '../../shared/utils/format.js';
import { SanitizerService } from '../../core/services/sanitizerService.js';

let currentData = null;

export function setStatus(msg, isError = false) {
  const el = document.getElementById('status');
  el.style.display = 'block';
  el.className = isError ? 'error' : '';
  el.innerHTML = isError
    ? `<strong>Error</strong><br>${SanitizerService.escapeHtml(msg)}`
    : `<div class="spinner"></div>${SanitizerService.escapeHtml(msg)}`;
  document.getElementById('data-content').style.display = 'none';
  document.getElementById('btn-row').style.display = 'none';
}

function renderEmpty(text) {
  return `<span class="empty">${text}</span>`;
}

function renderPriority(raw) {
  if (!raw) { return renderEmpty('Sin prioridad'); }
  const key = raw.toLowerCase().replace(/\s+/g, '_');
  const label = PRIORITY_LABELS[key] ?? raw;
  const cls = `priority-${key}`;
  return `<span class="priority-badge ${cls}">${label}</span>`;
}

function renderField(id, value, emptyMsg) {
  const el = document.getElementById(id);
  if (value) {
    el.textContent = value;
    el.classList.remove('empty');
  } else {
    el.innerHTML = renderEmpty(emptyMsg);
  }
}

function showData(data) {
  if (data?.error) {
    setStatus(data.error, true);
    return;
  }

  currentData = data;
  document.getElementById('ticket-id').textContent = data.ticketId ? `#${data.ticketId}` : '—';
  renderField('field-subject', data.subject, 'No encontrado');
  document.getElementById('field-priority').innerHTML = renderPriority(data.priority);
  renderField('field-due-date', data.dueDate, 'Sin fecha asignada');
  document.getElementById('status').style.display = 'none';
  document.getElementById('data-content').style.display = 'flex';
  document.getElementById('btn-row').style.display = 'flex';
}

async function getActiveTab() {
  const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function readTicketData(tab) {
  try {
    return await browserAPI.tabs.sendMessage(tab.id, { type: 'GET_TICKET_DATA' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('No se pudo leer el ticket con el content script actual.', error);
  }

  await browserAPI.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
  return browserAPI.tabs.sendMessage(tab.id, { type: 'GET_TICKET_DATA' });
}

async function fetchTicketData() {
  setStatus('Leyendo ticket...');

  try {
    const tab = await getActiveTab();

    if (!tab?.url?.match(/zendesk\.com\/agent\/tickets\/\d+/)) {
      setStatus('Abre un ticket de Zendesk para ver sus datos.', true);
      return;
    }

    const response = await readTicketData(tab);
    showData(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('No se pudo leer el ticket.', error);
    setStatus('No se pudo leer el ticket. Recarga la página e intenta de nuevo.', true);
  }
}

document.getElementById('refresh-btn').addEventListener('click', fetchTicketData);

document.getElementById('copy-btn').addEventListener('click', async () => {
  if (!currentData) { return; }
  await navigator.clipboard.writeText(buildClipboardText(currentData));
  const btn = document.getElementById('copy-btn');
  btn.textContent = '¡Copiado!';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = 'Copiar';
    btn.classList.remove('copied');
  }, 2000);
});

document.addEventListener('DOMContentLoaded', fetchTicketData);
