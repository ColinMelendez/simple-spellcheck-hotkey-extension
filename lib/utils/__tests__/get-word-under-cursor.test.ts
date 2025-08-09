/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { getWordUnderCursor } from '../get-word-under-cursor'

const setupTextAndSelection = (text: string, cursorOffset: number) => {
  // Create a text node and add it to a div
  const div = document.createElement('div')

  // Handle empty text case - create an explicit text node
  let textNode: Text
  if (text === '') {
    textNode = document.createTextNode('')
    div.appendChild(textNode)
  }
  else {
    div.textContent = text
    textNode = div.firstChild as Text
  }

  document.body.appendChild(div)

  // Create a range and set cursor position
  const range = document.createRange()

  // Ensure offset is within bounds
  const adjustedOffset = Math.min(cursorOffset, text.length)
  range.setStart(textNode, adjustedOffset)
  range.setEnd(textNode, adjustedOffset)

  // Set the selection
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }

  return { div, textNode, range, selection }
}

const setupFormElement = (tagName: 'textarea' | 'input', text: string, cursorOffset: number, inputType: string = 'text') => {
  let element: HTMLTextAreaElement | HTMLInputElement

  if (tagName === 'textarea') {
    element = document.createElement('textarea')
  }
  else {
    element = document.createElement('input');
    (element).type = inputType
  }

  element.value = text
  document.body.appendChild(element)

  // Focus the element and set cursor position
  element.focus()

  // Ensure offset is within bounds
  const adjustedOffset = Math.min(cursorOffset, text.length)
  element.selectionStart = adjustedOffset
  element.selectionEnd = adjustedOffset

  return element
}

describe('getWordUnderCursor', () => {
  beforeEach(() => {
    // Clear document body before each test
    document.body.innerHTML = ''

    // Clear any existing selection
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }

    // Clear focus from any active element
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur()
    }
  })

  describe('basic functionality', () => {
    it('should return null when no selection exists', () => {
      // No selection set up
      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should extract word from text node at cursor position', () => {
      setupTextAndSelection('hello world test', 6) // Start of "world"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('world')
    })

    it('should extract word when cursor is in middle of word', () => {
      setupTextAndSelection('testing word extraction', 10) // Middle of "word"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('word')
    })

    it('should handle cursor at end of text', () => {
      setupTextAndSelection('hello world', 11) // End of text

      const result = getWordUnderCursor()
      expect(result?.word).toBe('world')
    })
  })

  describe('textarea functionality', () => {
    it('should extract word from textarea at cursor position', () => {
      setupFormElement('textarea', 'hello world test', 6) // Start of "world"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('world')
    })

    it('should extract word when cursor is in middle of word in textarea', () => {
      setupFormElement('textarea', 'testing word extraction', 10) // Middle of "word"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('word')
    })

    it('should handle cursor at end of textarea text', () => {
      setupFormElement('textarea', 'hello world', 11) // End of text

      const result = getWordUnderCursor()
      expect(result?.word).toBe('world')
    })

    it('should handle multiline text in textarea', () => {
      setupFormElement('textarea', 'first line\nsecond line\nthird line', 18) // "s" in "second"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('line')
    })

    it('should handle empty textarea', () => {
      setupFormElement('textarea', '', 0)

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should handle textarea with only whitespace', () => {
      setupFormElement('textarea', '   \n  \t  ', 3)

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should handle cursor at beginning of textarea', () => {
      setupFormElement('textarea', 'beginning middle end', 0) // At "b" in "beginning"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('beginning')
    })
  })

  describe('input field functionality', () => {
    it('should extract word from text input at cursor position', () => {
      setupFormElement('input', 'hello world test', 6, 'text') // Start of "world"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('world')
    })

    it('should extract word when cursor is in middle of word in input', () => {
      setupFormElement('input', 'testing word extraction', 10, 'text') // Middle of "word"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('word')
    })

    it('should handle empty input field', () => {
      setupFormElement('input', '', 0, 'text')

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should handle cursor at beginning of input', () => {
      setupFormElement('input', 'beginning middle end', 0, 'text') // At "b" in "beginning"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('beginning')
    })

    it('should handle cursor at end of input', () => {
      setupFormElement('input', 'start middle end', 15, 'text') // At end

      const result = getWordUnderCursor()
      expect(result?.word).toBe('end')
    })
  })

  describe('form element edge cases', () => {
    it('should handle cursor on non-alphabetic characters in textarea', () => {
      setupFormElement('textarea', 'hello_world test', 5) // Underscore character

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should handle cursor on non-alphabetic characters in input', () => {
      setupFormElement('input', 'hello_world test', 5, 'text') // Underscore character

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should handle single character words in form elements', () => {
      setupFormElement('textarea', 'a b c', 0) // On "a"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('a')
    })

    it('should handle mixed content with form elements', () => {
      setupFormElement('textarea', 'word1_word2-word3.word4', 6) // in "word2"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('word')
    })

    it('should prioritize form element over text selection', () => {
      // Set up both a text selection and a focused form element
      setupTextAndSelection('background text word', 10)
      setupFormElement('input', 'foreground input word', 15, 'text') // focused input should take priority

      const result = getWordUnderCursor()
      expect(result?.word).toBe('input') // Should get word from input, not background text
    })
  })

  describe('edge cases', () => {
    it('should return null when cursor is on non-alphabetic character', () => {
      setupTextAndSelection('hello_world test', 5) // Underscore character

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should handle single character words', () => {
      setupTextAndSelection('a b c', 0) // On "a"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('a')
    })

    it('should handle empty text content', () => {
      setupTextAndSelection('', 0)

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should handle text with only non-alphabetic characters', () => {
      setupTextAndSelection('123 ___ *** ###', 5)

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })

    it('should handle spaces correctly', () => {
      setupTextAndSelection('word1 word2', 5) // Space between words

      const result = getWordUnderCursor()
      expect(result).toBe(undefined)
    })
  })

  describe('word boundary detection', () => {
    it('should correctly identify word boundaries with spaces', () => {
      const text = 'first second third'
      const testCases = [
        { offset: 2, expected: 'first' }, // middle of "first"
        { offset: 6, expected: 'second' }, // start of "second"
        { offset: 10, expected: 'second' }, // middle of "second"
        { offset: 14, expected: 'third' }, // start of "third"
      ]

      for (const { offset, expected } of testCases) {
        // Clear previous test setup
        document.body.innerHTML = ''
        setupTextAndSelection(text, offset)

        const result = getWordUnderCursor()
        expect(result?.word).toBe(expected)
      }
    })

    it('should handle mixed alphabetic and non-alphabetic characters', () => {
      const text = 'word1_word2-word3.word4'
      const testCases = [
        { offset: 2, expected: 'word' }, // in "word1"
        { offset: 6, expected: 'word' }, // in "word2"
        { offset: 13, expected: 'word' }, // in "word3"
        { offset: 19, expected: 'word' }, // in "word4"
      ]

      for (const { offset, expected } of testCases) {
        document.body.innerHTML = ''
        setupTextAndSelection(text, offset)

        const result = getWordUnderCursor()
        expect(result?.word).toBe(expected)
      }
    })

    it('should handle case sensitivity correctly', () => {
      const text = 'Hello WORLD Test'
      const testCases = [
        { offset: 2, expected: 'Hello' },
        { offset: 8, expected: 'WORLD' },
        { offset: 14, expected: 'Test' },
      ]

      for (const { offset, expected } of testCases) {
        document.body.innerHTML = ''
        setupTextAndSelection(text, offset)

        const result = getWordUnderCursor()
        expect(result?.word).toBe(expected)
      }
    })
  })

  describe('selection vs cursor behavior', () => {
    it('should use start position for text selections', () => {
      const text = 'first second third'
      const div = document.createElement('div')
      div.textContent = text
      document.body.appendChild(div)

      const range = document.createRange()
      const textNode = div.firstChild as Text

      // Create a selection from offset 6 to 12 (selects "second")
      range.setStart(textNode, 6)
      range.setEnd(textNode, 12)

      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }

      const result = getWordUnderCursor()
      expect(result?.word).toBe('second')
    })

    it('should handle collapsed selections (cursor)', () => {
      setupTextAndSelection('cursor test', 7) // cursor position at "test"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('test')
    })
  })

  describe('complex scenarios', () => {
    it('should work with nested elements', () => {
      const div = document.createElement('div')
      const span = document.createElement('span')
      span.textContent = 'nested word'
      div.appendChild(span)
      document.body.appendChild(div)

      const range = document.createRange()
      const textNode = span.firstChild as Text
      range.setStart(textNode, 7) // Position at "word"
      range.setEnd(textNode, 7)

      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }

      const result = getWordUnderCursor()
      expect(result?.word).toBe('word')
    })

    it('should handle unicode characters correctly', () => {
      setupTextAndSelection('café naïve résumé', 5) // On "n" in "naïve"

      const result = getWordUnderCursor()
      expect(result?.word).toBe('na') // Should only get alphabetic ASCII characters
    })

    it('should handle very long words', () => {
      const longWord = 'a'.repeat(100)
      const text = `start ${longWord} end`
      setupTextAndSelection(text, 50) // Middle of long word

      const result = getWordUnderCursor()
      expect(result?.word).toBe(longWord)
    })
  })
})
