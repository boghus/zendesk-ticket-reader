// TODO: eliminar este archivo y usar directamente DEFAULT_SELECTORS desde el config
export const SELECTORS = {
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
