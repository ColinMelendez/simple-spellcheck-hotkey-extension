declare module 'typo-js' {
  /**
   * Constructor settings. Available properties mirror those described in the
   * original Typo.js source.
   */
  export interface TypoSettings {
    /**
     * Path to load the dictionary from when running in a non-Chrome environment.
     */
    dictionaryPath?: string

    /**
     * Flag information (mirrors the `{Object} flags` parameter in Typo.js).
     */
    flags?: Record<string, string>

    /**
     * If `true`, `affData` and `wordsData` will be loaded asynchronously.
     */
    asyncLoad?: boolean

    /**
     * Called when both `affData` and `wordsData` have been loaded (only used
     * if {@link asyncLoad} is set to `true`). The callback receives the
     * instantiated {@link Typo} object.
     */
    loadedCallback?: (typo: Typo) => void
  }

  /**
   * JavaScript/TypeScript spell-checker that understands Hunspell dictionaries.
   *
   * The constructor is intentionally lax ‑ every parameter is optional so that
   * consumers can start with the default embedded `en_US` dictionary and only
   * supply what they need.
   */
  class Typo {
    /**
     * Typo constructor.
     *
     * @param dictionary The locale code of the dictionary being used (e.g.
     *                   `"en_US"`). This is only used to auto-load
     *                   dictionaries.
     * @param affData    The data from the dictionary's `.aff` file. If omitted
     *                   and Typo.js is being used in a Chrome extension, the
     *                   `.aff` file will be loaded automatically from
     *                   `lib/typo/dictionaries/[dictionary]/[dictionary].aff`.
     *                   In other environments, it will be loaded from
     *                   `[settings.dictionaryPath]/dictionaries/[dictionary]/[dictionary].aff`.
     * @param wordsData  The data from the dictionary's `.dic` file. If omitted
     *                   and Typo.js is being used in a Chrome extension, the
     *                   `.dic` file will be loaded automatically from
     *                   `lib/typo/dictionaries/[dictionary]/[dictionary].dic`.
     *                   In other environments, it will be loaded from
     *                   `[settings.dictionaryPath]/dictionaries/[dictionary]/[dictionary].dic`.
     * @param settings   {@link TypoSettings}
     */
    constructor(
      dictionary?: string,
      affData?: string,
      wordsData?: string,
      settings?: TypoSettings,
    )

    /**
     * Checks whether a word or a capitalization variant exists in the current
     * dictionary. The word is trimmed and several variations of capitalizations
     * are checked. If you want to check a word without any changes made to it,
     * call {@link checkExact}.
     *
     * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript
     *      re: trimming function
     * @param word The word to check.
     * @returns `true` if the word is present; otherwise `false`.
     */
    check(word: string): boolean

    /**
     * Checks whether a word exists in the current dictionary **exactly as
     * specified**.
     *
     * @param word The word to check.
     * @returns `true` if the exact word is present; otherwise `false`.
     */
    checkExact(word: string): boolean

    /**
     * Returns a list of suggestions for a misspelled word.
     *
     * @see http://www.norvig.com/spell-correct.html for the basis of this
     *      suggester. This suggester is primitive, but it works.
     *
     * @param word  The misspelling.
     * @param limit Maximum number of suggestions to return (defaults to `5`).
     * @returns An array of suggestion strings.
     */
    suggest(word: string, limit?: number): string[]

    /**
     * Loads a Typo instance from a hash of all Typo properties (e.g. the result
     * of `JSON.parse(JSON.stringify(typoInstance))`).
     *
     * @param obj A hash of Typo properties.
     */
    load(obj: Record<string, unknown>): this
  }

  export = Typo
}
