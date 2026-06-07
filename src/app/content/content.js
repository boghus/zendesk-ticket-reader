import { extractWhenReady } from '../../core/services/ticketService.js';
import { addRuntimeMessageListener } from '../../shared/platform/browserAdapter.js';

addRuntimeMessageListener((message) => {
  if (message.type === 'GET_TICKET_DATA') {
    return extractWhenReady()
      .catch(error => {
        return { error: error.message };
      });
  }

  return null;
});
