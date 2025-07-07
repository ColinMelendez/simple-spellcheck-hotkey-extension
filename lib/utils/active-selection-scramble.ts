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
 * @returns A random character with matching case or null if not scrambling
 * @internal
 */
function getRandomChar(char: string, scrambleDensity: number): string | undefined {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numChars = '0123456789';

  // chance to skip adding the scramble overlay to a character
  if (Math.random() > scrambleDensity)
    return;

  // Replace upper-case with upper-case, lower with lower, and numbers with numbers.
  // This should somewhat help to make the scrambled text layer match up with the underlying characters.
  if (/[A-Z]/.test(char))
    return upperChars[Math.floor(Math.random() * upperChars.length)];
  if (/[a-z]/.test(char))
    return lowerChars[Math.floor(Math.random() * lowerChars.length)];
  if (/\d/.test(char))
    return numChars[Math.floor(Math.random() * numChars.length)];
  // don't scramble non-alphanumeric characters
}

/**
 * Clears all currently active overlay elements from the DOM.
 * @internal
 */
export function clearOverlays() {
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
  settings: {
    scrambleDensity: number
  },
): () => void {
  return () => {
    clearOverlays();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return;

    const range = selection.getRangeAt(0);
    const text = range.toString();

    if (text.length === 0)
      return;

    // Use the improved rectangle-based approach
    applyRectangleBasedOverlay(range, text, settings.scrambleDensity);
  };
}

/**
 * Improved rectangle-based overlays with better text distribution.
 * @param range The selection range
 * @param text The selected text
 * @param scrambleDensity The probability (0-1) of scrambling a character
 * @internal
 */
function applyRectangleBasedOverlay(range: Range, text: string, scrambleDensity: number) {
  const rects = range.getClientRects();
  if (rects.length === 0)
    return;

  // Get the actual font properties from the selection
  const startContainer = range.startContainer;
  const startElement = startContainer.nodeType === Node.TEXT_NODE
    ? startContainer.parentElement
    : startContainer as Element;

  const computedStyle = startElement ? window.getComputedStyle(startElement) : undefined;

  // Extract font properties for accurate character width calculation
  const fontFamily = computedStyle !== undefined ? computedStyle.fontFamily : 'inherit';
  const fontSize = computedStyle !== undefined ? computedStyle.fontSize : 'inherit';
  const fontWeight = computedStyle !== undefined ? computedStyle.fontWeight : 'inherit';
  const fontStyle = computedStyle !== undefined ? computedStyle.fontStyle : 'inherit';
  const letterSpacing = computedStyle !== undefined ? computedStyle.letterSpacing : 'inherit';

  // First, generate a scrambled version of the entire text with proper distribution
  const scrambledChars = Array.from(text).map((char) => {
    const scrambledChar = getRandomChar(char, scrambleDensity);
    return {
      original: char,
      scrambled: scrambledChar !== undefined ? scrambledChar : undefined,
      shouldScramble: scrambledChar !== undefined,
    };
  });

  // Calculate total width to ensure we distribute all characters
  const totalWidth = Array.from(rects).reduce((sum, rect) => sum + rect.width, 0);
  const totalChars = text.length;

  // Calculate approximate characters per rectangle based on actual font metrics
  let textIndex = 0;
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    if (!rect)
      continue;

    // Calculate how many characters should go in this rectangle
    let charsInRect: number;
    if (i === rects.length - 1) {
      // Last rectangle gets all remaining characters
      charsInRect = totalChars - textIndex;
    }
    else {
      // Calculate proportional characters based on rectangle width
      const rectProportion = rect.width / totalWidth;
      charsInRect = Math.round(totalChars * rectProportion);
    }

    const rectChars = scrambledChars.slice(textIndex, textIndex + charsInRect);

    if (rectChars.length > 0) {
      // Calculate a dynamic offset based on font size for better alignment
      const fontSizeValue = Number.parseFloat(fontSize) || 16; // Default to 16 if parsing fails
      const baselineOffset = fontSizeValue * 0.15; // ~15% of font size for baseline adjustment

      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.top = `${rect.top + window.scrollY - baselineOffset}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.pointerEvents = 'none';
      overlay.style.userSelect = 'none';
      overlay.style.background = 'transparent';
      overlay.style.color = 'inherit';

      // Apply the actual font properties from the selected text
      overlay.style.fontFamily = fontFamily;
      overlay.style.fontSize = fontSize;
      overlay.style.fontWeight = fontWeight;
      overlay.style.fontStyle = fontStyle;
      overlay.style.letterSpacing = letterSpacing;
      overlay.style.lineHeight = computedStyle !== undefined ? computedStyle.lineHeight : 'normal';

      overlay.style.whiteSpace = 'pre';
      overlay.style.overflow = 'hidden';
      overlay.style.zIndex = '9999';

      // Force text to align at the very top of the container
      overlay.style.margin = '0';
      overlay.style.padding = '0';
      overlay.style.display = 'block';
      overlay.style.verticalAlign = 'top';
      overlay.style.textAlign = 'left';
      overlay.style.border = '0';
      overlay.style.outline = '0';

      // Create individual spans for each character to control transparency
      rectChars.forEach(({ original, scrambled, shouldScramble }) => {
        const span = document.createElement('span');

        // Reset any default styling that might affect positioning
        span.style.margin = '0';
        span.style.padding = '0';
        span.style.verticalAlign = 'baseline';
        span.style.lineHeight = 'inherit';

        if (shouldScramble) {
          span.textContent = scrambled !== undefined ? scrambled : '';
          span.style.color = 'inherit';
        }
        else {
          span.textContent = original;
          span.style.color = 'transparent';
        }
        overlay.appendChild(span);
      });

      document.body.appendChild(overlay);
      activeOverlays.push(overlay);
    }

    textIndex += charsInRect;
  }
}
