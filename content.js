const SELECTORS = {
  subject: [
    'input[data-test-id="omni-header-subject"]',
  ],
  priority: [
    '[data-test-id="ticket-fields-priority-select"] [data-garden-id="dropdowns.combobox.value"]',
  ],
  dueDate: [
    'time[data-test-id="timestamp-relative"]',
  ],

};

let lastNavigationTime = 0;
let lastKnownUrl = window.location.href;

setInterval(() => {
  const current = window.location.href;
  if (current !== lastKnownUrl) {
    lastKnownUrl = current;
    lastNavigationTime = Date.now();
  }
}, 150);

function isVisible(el) {
  return getComputedStyle(el).visibility === 'visible';
}

function queryFirst(selectorList) {
  for (const sel of selectorList) {
    const match = [...document.querySelectorAll(sel)].find(isVisible);
    if (match) return match;
  }
  return null;
}

function extractText(el) {
  if (!el) return null;
  return (el.value || el.textContent || el.innerText || '').trim() || null;
}

function extractDueDate(el) {
  if (!el) return null;
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

function extractTicketData() {
  return {
    subject: extractText(queryFirst(SELECTORS.subject)),
    priority: extractText(queryFirst(SELECTORS.priority)),
    dueDate: extractDueDate(queryFirst(SELECTORS.dueDate)),
    url: window.location.href,
    ticketId: window.location.pathname.match(/\/tickets\/(\d+)/)?.[1] ?? null,
  };
}

async function extractWhenReady() {
  const timeSinceNav = Date.now() - lastNavigationTime;
  if (timeSinceNav > 3000) {
    return extractTicketData();
  }

  let prev = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    const data = extractTicketData();
    if (data.subject && prev && data.subject === prev.subject) {
      return data;
    }
    prev = data;
  }
  return extractTicketData();
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TICKET_DATA') {
    extractWhenReady().then(sendResponse);
    return true;
  }
  return true;
});
