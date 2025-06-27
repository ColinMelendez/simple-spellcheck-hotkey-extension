/**
 * @file
 * This file exports modified type definitions to improve several common typescript pain points.
 *
 * These include:
 * - make `.json` and `JSON.parse()` return `unknown` instead of `any`
 * - make `sessionStorage` and `localStorage` access typed as `unknown` instead of `any`
 * - make `Array.isArray()` return `unknown` instead of `any`
 * - make const literal arrays, sets, and maps type their elements as generics instead of literals
 * - make `.filter(Boolean)` properly narrow the returned type to remove `undefined`
 *
 * The reasoning for changing the use of `any` to `unknown` in these cases is that the use of `any` by the
 * standard library for json parsing, storage apis, and array identity checking can lead to subtle bugs,
 * and that the use of `unknown` more appropriately reflects the unvalidated state of values returned by
 * these apis.
 *
 * The reasoning for changing const literal arrays, sets, and maps to type their elements as
 * generics instead of literals is that the default type behavior prevents them from being used for
 * things like runtime value checking against unknown values for no actual benefit. This change is completely safe,
 * and is intended for make common application patterns easier, but it should not be used in libraries that will
 * be consumed by other applications, as they will inherit the behavior.
 *
 * The reasoning for making `.filter(Boolean)` narrow the returned type to remove `undefined` is that
 * this is already how the method works, but typescript is not quite sophisticated enough to infer it as of 5.8.3.
 */

// Do not add any other lines of code to this file!
import '@total-typescript/ts-reset';
