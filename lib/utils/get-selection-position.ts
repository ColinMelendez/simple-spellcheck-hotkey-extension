/* eslint-disable better-tailwindcss/no-unregistered-classes */
/**
 * Get the position of the cursor selection in the current window
 * @returns The x, y position of the cursor selection as an object, or undefined if no cursor selection is found
 */
export const getSelectionPosition = () => {
  // First, check if we're dealing with a form element (textarea or input)
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
    // safe to cast as we've already checked the tagName
    const formElement = activeElement as HTMLTextAreaElement | HTMLInputElement
    return getFormElementCursorPosition(formElement)
  }

  // Fall back to selection-based positioning for contentEditable and regular text
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    console.log('no selection')
    return undefined
  }

  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  // Use the start of the range for positioning
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  }
}

/**
 * Get the cursor position within a form element (textarea or input)
 * @param element - The form element to get the cursor position from
 * @returns The x, y position of the cursor, or undefined if no cursor position is found
 */
function getFormElementCursorPosition(element: HTMLTextAreaElement | HTMLInputElement): { x: number, y: number } | undefined {
  const cursorPosition = element.selectionStart
  if (cursorPosition === null) {
    console.log('no cursor position')
    return undefined
  }

  // Get the element's bounding rectangle
  const elementRect = element.getBoundingClientRect()

  // Create a temporary element to measure text dimensions
  const mirror = document.createElement('div')
  const computed = window.getComputedStyle(element)

  // Copy relevant styles to the mirror element
  const styles = [
    'position',
    'top',
    'left',
    'height',
    'width',
    'border',
    'padding',
    'margin',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'textDecoration',
    'textIndent',
    'textAlign',
    'whiteSpace',
    'wordWrap',
  ] as const satisfies (keyof CSSStyleDeclaration)[]

  styles.forEach((style) => {
    const value = computed.getPropertyValue(style)
    if (value) {
      mirror.style.setProperty(style, value)
    }
  })

  // Set mirror specific styles
  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.whiteSpace = element.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre'
  mirror.style.overflow = 'hidden'
  mirror.style.pointerEvents = 'none'

  document.body.appendChild(mirror)

  try {
    const text = element.value
    const textBeforeCursor = text.substring(0, cursorPosition)

    // Set the text content up to the cursor position
    mirror.textContent = textBeforeCursor

    // Create a span for the cursor position
    const cursorSpan = document.createElement('span')
    cursorSpan.textContent = '|' // Use a visible character to measure
    mirror.appendChild(cursorSpan)

    // Get the cursor span's position
    const spanRect = cursorSpan.getBoundingClientRect()

    // Calculate the absolute position
    const x = elementRect.left + window.scrollX + (spanRect.left - mirror.getBoundingClientRect().left) + Number.parseFloat(computed.paddingLeft)
    const y = elementRect.top + window.scrollY + (spanRect.top - mirror.getBoundingClientRect().top) + Number.parseFloat(computed.paddingTop)

    return { x, y }
  }
  finally {
    document.body.removeChild(mirror)
  }
}
