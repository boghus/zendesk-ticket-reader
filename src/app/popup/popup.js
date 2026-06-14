import { PRIORITY_LABELS } from '../../shared/constants/labels.js';
import { browserAPI } from '../../shared/platform/browserAdapter.js';
import { buildClipboardText } from '../../shared/utils/format.js';
import { SanitizerService } from '../../core/services/sanitizerService.js';

let currentData = null;

export function setStatus(msg, isError = false) {
  const el = document.getElementById('status');

  el.style.display = 'block';
  el.className = isError ? 'error' : '';

  el.replaceChildren();

  if (isError) {
    const strong = document.createElement('strong');
    strong.textContent = 'Error';

    el.appendChild(strong);
    el.appendChild(document.createElement('br'));
    el.appendChild(document.createTextNode(SanitizerService.escapeHtml(msg)));
  } else {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    el.appendChild(spinner);
    el.appendChild(document.createTextNode(SanitizerService.escapeHtml(msg)));
  }

  document.getElementById('data-content').style.display = 'none';
  document.getElementById('btn-row').style.display = 'none';
}

function renderPriority(el, raw) {
  el.replaceChildren();
  el.classList.remove('empty');

  if (!raw) {
    el.textContent = 'Sin prioridad';
    el.classList.add('empty');
    return;
  }

  const key = raw.toLowerCase().replace(/\s+/g, '_');
  const label = PRIORITY_LABELS[key] ?? raw;

  const badge = document.createElement('span');
  badge.className = `priority-badge priority-${key}`;
  badge.textContent = label;

  el.appendChild(badge);
}

function renderField(id, value, emptyMsg) {
  const el = document.getElementById(id);

  el.replaceChildren();

  if (value) {
    el.textContent = value;
    el.classList.remove('empty');
  } else {
    el.textContent = emptyMsg;
    el.classList.add('empty');
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
  renderPriority(document.getElementById('field-priority'), data.priority);
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
