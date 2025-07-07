import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()], // adds configs from wxt.config.ts, sets up WXT-specific globals, and polyfills the browser extension APIs
});
