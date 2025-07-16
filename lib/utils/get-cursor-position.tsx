/**
 * Get the position of the cursor in the current window
 * @returns The x, y position of the cursor as an object, or undefined if no cursor is found
 */
export const getCursorPosition = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Use the start of the range for positioning
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  };
};
