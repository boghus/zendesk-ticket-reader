import { settingsService } from '../../core/services/settingsService.js';

const showPriority = document.getElementById('show-priority');
const showDueDate = document.getElementById('show-due-date');
const status = document.getElementById('status');

function showStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? '#d93025' : '#188038';
}

async function loadSettings() {
  try {
    const settings = await settingsService.getAll();
    showPriority.checked = settings.showPriority;
    showDueDate.checked = settings.showDueDate;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('No se pudo cargar la configuración.', error);
    showStatus('No se pudo cargar la configuración.', true);
  }
}

async function saveSettings() {
  try {
    await settingsService.update({
      showPriority: showPriority.checked,
      showDueDate: showDueDate.checked,
    });
    showStatus('Configuración guardada.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('No se pudo guardar la configuración.', error);
    showStatus('No se pudo guardar la configuración.', true);
  }
}

async function resetSettings() {
  try {
    await settingsService.reset();
    await loadSettings();
    showStatus('Valores restaurados.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('No se pudo restaurar la configuración.', error);
    showStatus('No se pudo restaurar la configuración.', true);
  }
}

document.getElementById('save-btn').addEventListener('click', saveSettings);
document.getElementById('reset-btn').addEventListener('click', resetSettings);
document.addEventListener('DOMContentLoaded', loadSettings);
