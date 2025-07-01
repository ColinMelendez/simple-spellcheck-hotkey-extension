/**
 * @file
 * This module supplies a function that listens for text selection changes in the browser and overlays the
 * selected text with a random string of characters. The overlay is purely visual and does not modify the DOM
 * or the original text content. It is removed automatically when the selection changes or is cleared.
 */

/**
 * List of currently active overlay elements added to the DOM.
 * @internal
 */
const activeOverlays: HTMLElement[] = [];

/**
 * Generates a single random character matching the case of the input character.
 * @param char The character to match case with
 * @param scrambleDensity The probability (0-1) of scrambling a character.
 * @returns A random character with matching case
 * @internal
 */
function getRandomChar(char: string, scrambleDensity: number) {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numChars = '0123456789';

  // chance to skip adding the scramble overlay to a character
  if (Math.random() > scrambleDensity)
    return ' ';

  // Replace upper-case with upper-case, lower with lower, and numbers with numbers.
  // This should somewhat help to make the scrambled text layer match up with the underlying characters.
  if (char.match(/[A-Z]/))
    return upperChars[Math.floor(Math.random() * upperChars.length)];
  if (char.match(/[a-z]/))
    return lowerChars[Math.floor(Math.random() * lowerChars.length)];
  if (char.match(/\d/))
    return numChars[Math.floor(Math.random() * numChars.length)];
  return ' '; // preserve non-alphanumeric characters
}

/**
 * Clears all currently active overlay elements from the DOM.
 * @internal
 */
function clearOverlays() {
  for (const overlay of activeOverlays) {
    overlay.remove();
  }
  activeOverlays.length = 0;
}

/**
 * Creates a function that applies overlay elements with random characters to the currently selected text.
 * These overlays visually mask the text without modifying the DOM content.
 * This is a curried function that allows settings to be pre-configured.
 * @param settings - Configuration for the overlay.
 * @param settings.scrambleDensity - The probability (0-1) of scrambling a character.
 * @returns A function that, when called, applies the overlay to the current selection.
 */
export function applyOverlayToSelection(
  // configuration for the overlay
  settings: {
    // the chance of a scrambled character being overlaid on each character of the selected text
    scrambleDensity: number
  },
): () => void {
  return () => {
    clearOverlays();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return;

    const range = selection.getRangeAt(0).cloneRange();
    const rects = range.getClientRects();
    const text = range.toString();

    if (rects.length === 0)
      return;

    for (const rect of rects) {
      const overlay = document.createElement('div');

      overlay.style.position = 'absolute';
      overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.top = `${rect.top + window.scrollY}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.pointerEvents = 'none'; // allow interaction with underlying text
      overlay.style.userSelect = 'none'; // prevent selection of the overlay text
      overlay.style.background = 'transparent';
      overlay.style.color = 'inherit';
      overlay.style.font = 'inherit';
      overlay.style.fontSize = 'inherit';
      overlay.style.lineHeight = 'normal';
      overlay.style.whiteSpace = 'pre';
      overlay.style.zIndex = '9999';

      // Generate random text with the same length as the original text
      const randomText = Array.from(text)
        .map((char) => getRandomChar(char, settings.scrambleDensity))
        .join('');

      overlay.textContent = randomText;
      document.body.appendChild(overlay);
      activeOverlays.push(overlay);
    }
  };
}
