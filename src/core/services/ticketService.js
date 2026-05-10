import { SELECTORS } from '../../shared/constants/selectors.js';
import { queryFirst } from '../../shared/utils/dom.js';
import { extractText, extractDueDate } from '../../shared/utils/format.js';

let lastNavigationTime = 0;
let lastKnownUrl = window.location.href;

setInterval(() => {
  const current = window.location.href;
  if (current !== lastKnownUrl) {
    lastKnownUrl = current;
    lastNavigationTime = Date.now();
  }
}, 150);

function extractTicketData() {
  return {
    subject: extractText(queryFirst(SELECTORS.subject)),
    priority: extractText(queryFirst(SELECTORS.priority)),
    dueDate: extractDueDate(queryFirst(SELECTORS.dueDate)),
    url: window.location.href,
    ticketId: window.location.pathname.match(/\/tickets\/(\d+)/)?.[1] ?? null,
  };
}

export async function extractWhenReady() {
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
