import SelectorsRepository from './selectorsRepository.js';

const listContainer = document.getElementById('selectors-list');
const addBtn = document.getElementById('add-selector');
const restoreBtn = document.getElementById('restore-defaults');

/**
 * Renderiza la lista de selectores en la interfaz.
 */
async function loadSelectors() {
  try {
    const selectors = await SelectorsRepository.getAll();

    console.log('Cargando selectores:', selectors);
    listContainer.innerHTML = '';

    if (!selectors || Object.keys(selectors).length === 0) {
      listContainer.innerHTML = '<div class="loading">No hay selectores configurados.</div>';
      return;
    }

    Object.entries(selectors).forEach(([id, config]) => {
      const card = document.createElement('div');
      card.className = 'field-group';
      card.innerHTML = `
        <h3>Campo ID: ${id}</h3>
        <label>Etiqueta Visible:</label>
        <input type="text" value="${config.label || ''}" data-id="${id}" data-field="label">
        
        <label>Selectores CSS (uno por línea):</label>
        <textarea data-id="${id}" data-field="selectors" placeholder="Escribe un selector CSS por línea...">${(config.selectors || []).join('\n')}</textarea>
        
        <label>Tipo de Extractor (ej: text, dueDate):</label>
        <input type="text" value="${config.extractor || 'text'}" data-id="${id}" data-field="extractor">
        
        <label>Formato de Display:</label>
        <input type="text" value="${config.display || 'text'}" data-id="${id}" data-field="display">

        <div class="actions">
          <button class="btn-save" data-id="${id}">Guardar</button>
          <button class="btn-delete" data-id="${id}">Eliminar</button>
        </div>
      `;
      listContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar selectores:', error);
    listContainer.innerHTML = '<div class="loading" style="color: red;">Error al cargar la configuración.</div>';
  }
}

/**
 * Delegación de eventos para las acciones de cada selector.
 */
listContainer.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('btn-save')) {
    const card = e.target.closest('.field-group');
    const updatedConfig = {
      label: card.querySelector(`[data-field="label"]`).value,
      selectors: card.querySelector(`[data-field="selectors"]`).value.split('\n').filter(s => s.trim() !== ''),
      extractor: card.querySelector(`[data-field="extractor"]`).value,
      display: card.querySelector(`[data-field="display"]`).value
    };
    await SelectorsRepository.save(id, updatedConfig);
    
    // Feedback visual temporal en el botón
    const btn = e.target;
    const originalText = btn.textContent;
    btn.textContent = '¡Guardado!';
    btn.style.backgroundColor = '#28a745';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = '';
    }, 1500);
  }

  if (e.target.classList.contains('btn-delete')) {
    if (confirm(`¿Eliminar el campo "${id}"?`)) {
      await SelectorsRepository.remove(id);
      loadSelectors();
    }
  }
});

addBtn.addEventListener('click', async () => {
  const newId = prompt('ID técnico del nuevo campo (ej: status):');
  if (newId) {
    await SelectorsRepository.save(newId, { label: 'Nuevo Campo', selectors: [], extractor: 'text', display: 'text' });
    loadSelectors();
  }
});

restoreBtn.addEventListener('click', async () => {
  if (confirm('¿Restaurar configuración original? Se perderán tus cambios.')) {
    await SelectorsRepository.reset();
    loadSelectors();
  }
});

document.addEventListener('DOMContentLoaded', loadSelectors);