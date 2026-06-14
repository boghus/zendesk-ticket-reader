const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

export class SanitizerService {
  /**
   * Escapes a string to make it safe for HTML interpolation.
   * Replaces &, <, >, ", ', /, `, and = with their corresponding HTML entities.
   * @param {string} str The string to escape.
   * @returns {string} The escaped safe string.
   */
  static escapeHtml(str) {
    if (typeof str !== 'string') {
      return '';
    }
    return str.replace(/[&<>"'`=\/]/g, (char) => ESCAPE_MAP[char]);
  }
}
