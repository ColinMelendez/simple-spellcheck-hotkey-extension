/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { getWordUnderCursor } from '../get-word-under-cursor';

const setupTextAndSelection = (text: string, cursorOffset: number) => {
  // Create a text node and add it to a div
  const div = document.createElement('div');

  // Handle empty text case - create an explicit text node
  let textNode: Text;
  if (text === '') {
    textNode = document.createTextNode('');
    div.appendChild(textNode);
  }
  else {
    div.textContent = text;
    textNode = div.firstChild as Text;
  }

  document.body.appendChild(div);

  // Create a range and set cursor position
  const range = document.createRange();

  // Ensure offset is within bounds
  const adjustedOffset = Math.min(cursorOffset, text.length);
  range.setStart(textNode, adjustedOffset);
  range.setEnd(textNode, adjustedOffset);

  // Set the selection
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

  return { div, textNode, range, selection };
};

describe('getWordUnderCursor', () => {
  beforeEach(() => {
    // Clear document body before each test
    document.body.innerHTML = '';

    // Clear any existing selection
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  });

  describe('basic functionality', () => {
    it('should return null when no selection exists', () => {
      // No selection set up
      const result = getWordUnderCursor();
      expect(result).toBe(undefined);
    });

    it('should extract word from text node at cursor position', () => {
      setupTextAndSelection('hello world test', 6); // Start of "world"

      const result = getWordUnderCursor();
      expect(result).toBe('world');
    });

    it('should extract word when cursor is in middle of word', () => {
      setupTextAndSelection('testing word extraction', 10); // Middle of "word"

      const result = getWordUnderCursor();
      expect(result).toBe('word');
    });

    it('should handle cursor at end of text', () => {
      setupTextAndSelection('hello world', 11); // End of text

      const result = getWordUnderCursor();
      expect(result).toBe('world');
    });
  });

  describe('edge cases', () => {
    it('should return null when cursor is on non-alphabetic character', () => {
      setupTextAndSelection('hello_world test', 5); // Underscore character

      const result = getWordUnderCursor();
      expect(result).toBe(undefined);
    });

    it('should handle the example from requirements: "wxspf jfds _dddne vbcx"', () => {
      setupTextAndSelection('wxspf jfds _dddne vbcx', 13); // On "n" in "dddne"

      const result = getWordUnderCursor();
      expect(result).toBe('dddne');
    });

    it('should handle single character words', () => {
      setupTextAndSelection('a b c', 0); // On "a"

      const result = getWordUnderCursor();
      expect(result).toBe('a');
    });

    it('should handle empty text content', () => {
      setupTextAndSelection('', 0);

      const result = getWordUnderCursor();
      expect(result).toBe(undefined);
    });

    it('should handle text with only non-alphabetic characters', () => {
      setupTextAndSelection('123 ___ *** ###', 5);

      const result = getWordUnderCursor();
      expect(result).toBe(undefined);
    });

    it('should handle spaces correctly', () => {
      setupTextAndSelection('word1 word2', 5); // Space between words

      const result = getWordUnderCursor();
      expect(result).toBe(undefined);
    });
  });

  describe('word boundary detection', () => {
    it('should correctly identify word boundaries with spaces', () => {
      const text = 'first second third';
      const testCases = [
        { offset: 2, expected: 'first' }, // middle of "first"
        { offset: 6, expected: 'second' }, // start of "second"
        { offset: 10, expected: 'second' }, // middle of "second"
        { offset: 14, expected: 'third' }, // start of "third"
      ];

      for (const { offset, expected } of testCases) {
        // Clear previous test setup
        document.body.innerHTML = '';
        setupTextAndSelection(text, offset);

        const result = getWordUnderCursor();
        expect(result).toBe(expected);
      }
    });

    it('should handle mixed alphabetic and non-alphabetic characters', () => {
      const text = 'word1_word2-word3.word4';
      const testCases = [
        { offset: 2, expected: 'word' }, // in "word1"
        { offset: 6, expected: 'word' }, // in "word2"
        { offset: 13, expected: 'word' }, // in "word3"
        { offset: 19, expected: 'word' }, // in "word4"
      ];

      for (const { offset, expected } of testCases) {
        document.body.innerHTML = '';
        setupTextAndSelection(text, offset);

        const result = getWordUnderCursor();
        expect(result).toBe(expected);
      }
    });

    it('should handle case sensitivity correctly', () => {
      const text = 'Hello WORLD Test';
      const testCases = [
        { offset: 2, expected: 'Hello' },
        { offset: 8, expected: 'WORLD' },
        { offset: 14, expected: 'Test' },
      ];

      for (const { offset, expected } of testCases) {
        document.body.innerHTML = '';
        setupTextAndSelection(text, offset);

        const result = getWordUnderCursor();
        expect(result).toBe(expected);
      }
    });
  });

  describe('selection vs cursor behavior', () => {
    it('should use start position for text selections', () => {
      const text = 'first second third';
      const div = document.createElement('div');
      div.textContent = text;
      document.body.appendChild(div);

      const range = document.createRange();
      const textNode = div.firstChild as Text;

      // Create a selection from offset 6 to 12 (selects "second")
      range.setStart(textNode, 6);
      range.setEnd(textNode, 12);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      const result = getWordUnderCursor();
      expect(result).toBe('second');
    });

    it('should handle collapsed selections (cursor)', () => {
      setupTextAndSelection('cursor test', 7); // cursor position at "test"

      const result = getWordUnderCursor();
      expect(result).toBe('test');
    });
  });

  describe('complex scenarios', () => {
    it('should work with nested elements', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      span.textContent = 'nested word';
      div.appendChild(span);
      document.body.appendChild(div);

      const range = document.createRange();
      const textNode = span.firstChild as Text;
      range.setStart(textNode, 7); // Position at "word"
      range.setEnd(textNode, 7);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      const result = getWordUnderCursor();
      expect(result).toBe('word');
    });

    it('should handle unicode characters correctly', () => {
      setupTextAndSelection('café naïve résumé', 5); // On "n" in "naïve"

      const result = getWordUnderCursor();
      expect(result).toBe('na'); // Should only get alphabetic ASCII characters
    });

    it('should handle very long words', () => {
      const longWord = 'a'.repeat(100);
      const text = `start ${longWord} end`;
      setupTextAndSelection(text, 50); // Middle of long word

      const result = getWordUnderCursor();
      expect(result).toBe(longWord);
    });
  });
});
