export function isVisible(el) {
  return getComputedStyle(el).visibility === 'visible';
}

export function queryFirst(selectorList) {
  for (const sel of selectorList) {
    const match = [...document.querySelectorAll(sel)].find(isVisible);
    if (match) { return match; }
  }
  return null;
}
