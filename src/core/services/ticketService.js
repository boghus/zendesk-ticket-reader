import { queryFirst } from '../../shared/utils/dom.js';
import { extractDueDate, extractText } from '../../shared/utils/format.js';
import { SelectorsRepository } from '../../storage/selectorsRepository.js';

let lastNavigationTime = 0;
let lastKnownUrl = window.location.href;

setInterval(() => {
  const current = window.location.href;
  if (current !== lastKnownUrl) {
    lastKnownUrl = current;
    lastNavigationTime = Date.now();
  }
}, 150);

async function extractTicketData() {
  const selectors = await SelectorsRepository.getAll();

  return {
    subject: extractText(queryFirst(selectors.subject.selectors)),
    priority: extractText(queryFirst(selectors.priority.selectors)),
    dueDate: extractDueDate(queryFirst(selectors.dueDate.selectors)),
    url: window.location.href,
    ticketId: window.location.pathname.match(/\/tickets\/(\d+)/)?.[1] ?? null,
  };
}

export async function extractWhenReady() {
  const timeSinceNav = Date.now() - lastNavigationTime;
  if (timeSinceNav > 3000) {
    return await extractTicketData();
  }

  let prev = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    const data = await extractTicketData();
    if (data.subject && prev && data.subject === prev.subject) {
      return data;
    }
    prev = data;
  }
  return await extractTicketData();
}
