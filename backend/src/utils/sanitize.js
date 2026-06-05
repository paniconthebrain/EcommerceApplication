const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);

/**
 * Strip all HTML/script tags from a user-supplied string.
 * Returns the original value unchanged if it is not a string.
 */
function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
}

module.exports = { sanitizeText };
