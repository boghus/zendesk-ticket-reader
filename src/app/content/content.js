import { extractWhenReady } from '../../core/services/ticketService.js';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TICKET_DATA') {
    extractWhenReady().then(sendResponse);
    return true;
  }
  return true;
});
