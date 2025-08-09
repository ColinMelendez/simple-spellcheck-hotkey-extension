/**
 * Get the word under the cursor's current position
 * @returns The word under the cursor, or undefined if no word is under the cursor
 */
export const getWordUnderCursor = ():
  | { word: string, element?: HTMLTextAreaElement | HTMLInputElement, range?: { start: number, end: number } }
  | undefined => {
  // First, check if we're dealing with a form element (textarea or input)
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
    // safe to cast as we've already checked the tagName
    const formElement = activeElement as HTMLTextAreaElement | HTMLInputElement

    // Only handle text-based inputs
    if (formElement.tagName === 'INPUT') {
      const inputElement = formElement as HTMLInputElement
      if (inputElement.type !== 'text'
        && inputElement.type !== 'textarea'
        && inputElement.type !== 'password'
        && inputElement.type !== 'search'
        && inputElement.type !== 'email'
        && inputElement.type !== 'url'
      ) {
        return undefined
      }
    }

    const result = extractWordFromFormElement(formElement)
    if (result) {
      return {
        word: result.word,
        element: formElement,
        range: result.range,
      }
    }
    return undefined
  }

  // Fall back to selection-based extraction for contentEditable and regular text
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return undefined
  }

  const range = selection.getRangeAt(0)
  const { startContainer, startOffset } = range

  // For selections, use the start position; for cursor, use the position
  const container = startContainer
  const offset = startOffset

  // Make sure we're working with a text node
  if (container.nodeType !== Node.TEXT_NODE) {
    // If it's not a text node, try to find a text node child
    const textNode = findTextNodeAtPosition(container, offset)
    if (!textNode) {
      return undefined
    }
    const result = extractWordAtOffset(textNode.node, textNode.offset)
    return result ? { word: result.word } : undefined
  }

  const result = extractWordAtOffset(container as Text, offset)
  return result ? { word: result.word } : undefined
}

/**
 * Find the text node at (intersected by) a given offset in a container
 * @param container - The container to find the text node in
 * @param offset - The offset to find the text node at
 * @returns The text node at the offset, or undefined if no text node is found
 */
function findTextNodeAtPosition(container: Node, offset: number): { node: Text, offset: number } | undefined {
  // If container is an element, find the text node at the given offset
  if (container.nodeType === Node.ELEMENT_NODE) {
    const childNodes = Array.from(container.childNodes)
    let currentOffset = 0

    for (const child of childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const textContent = (child as Text).textContent
        const textLength = textContent !== null ? textContent.length : 0
        if (currentOffset + textLength > offset) {
          return { node: child as Text, offset: offset - currentOffset }
        }
        currentOffset += textLength
      }
      else if (child.nodeType === Node.ELEMENT_NODE) {
        // For element nodes, treat them as single positions
        if (currentOffset === offset) {
          // Find the first text node in this element
          const firstTextNode = findFirstTextNode(child)
          if (firstTextNode) {
            return { node: firstTextNode, offset: 0 }
          }
        }
        currentOffset += 1
      }
    }
  }
  return undefined
}

/**
 * Find the first text node from the children of a given node
 * @param node - The node from which to find the first text node
 * @returns The first text node, or undefined if no text node is found
 */
function findFirstTextNode(node: Node): Text | undefined {
  if (node.nodeType === Node.TEXT_NODE) {
    return node as Text
  }

  for (const child of Array.from(node.childNodes)) {
    const textNode = findFirstTextNode(child)
    if (textNode) {
      return textNode
    }
  }
  return undefined
}

/**
 * Check if a character is alphabetic (a-z, case insensitive)
 * @param char - The character to check
 * @returns True if the character is alphabetic, false otherwise
 */
function isAlphabetic(char: string | undefined): boolean {
  if (char === undefined) {
    return false
  }
  return /^[a-z]$/i.test(char)
}

/**
 * Extract the word under the cursor from a form element (textarea or input)
 * @param element - The form element to extract the word from
 * @returns The word under the cursor and its range, or undefined if no word is found
 */
function extractWordFromFormElement(element: HTMLTextAreaElement | HTMLInputElement): { word: string, range: { start: number, end: number } } | undefined {
  const text = element.value
  const cursorPosition = element.selectionStart

  if (cursorPosition === null || text.length === 0) {
    return undefined
  }

  // Use the same word extraction logic as the text node version
  return extractWordAtTextPosition(text, cursorPosition)
}

/**
 * Extract the word at a given position in a text string
 * @param text - The text to extract the word from
 * @param offset - The offset to extract the word from
 * @returns The word at the offset and its range, or undefined if the offset is out of bounds or the character is not alphabetic
 */
function extractWordAtTextPosition(text: string, offset: number): { word: string, range: { start: number, end: number } } | undefined {
  // Ensure offset is within bounds
  if (offset < 0 || offset > text.length) {
    return undefined
  }

  // If we're at the very end, move back one position
  const adjustedOffset = offset === text.length ? offset - 1 : offset

  // Check if the character at the offset is alphabetic
  const charAtCursor = text[adjustedOffset]
  if (adjustedOffset < 0 || !isAlphabetic(charAtCursor)) {
    return undefined
  }

  // Find the start of the word (go backwards until non-alphabetic)
  let start = adjustedOffset
  while (start > 0) {
    const prevChar = text[start - 1]
    if (!isAlphabetic(prevChar)) {
      break
    }
    start--
  }

  // Find the end of the word (go forwards until non-alphabetic)
  let end = adjustedOffset
  while (end < text.length - 1) {
    const nextChar = text[end + 1]
    if (!isAlphabetic(nextChar)) {
      break
    }
    end++
  }

  // Extract the word
  const word = text.substring(start, end + 1)
  return word.length > 0 ? { word, range: { start, end: end + 1 } } : undefined
}

/**
 * Extract the word at (intersected by) a given offset in a text node
 * @param textNode - The text node to extract the word from
 * @param offset - The offset to extract the word from
 * @returns The word at the offset and its range, or undefined if the offset is out of bounds or the character is not alphabetic
 */
function extractWordAtOffset(textNode: Text, offset: number): { word: string, range: { start: number, end: number } } | undefined {
  const textContent = textNode.textContent
  if (textContent === null) {
    return undefined
  }

  return extractWordAtTextPosition(textContent, offset)
}
