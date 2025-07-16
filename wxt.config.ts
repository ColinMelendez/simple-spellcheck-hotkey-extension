import path from 'node:path';
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // WXT module plugins
  modules: ['@wxt-dev/module-react'],
  // @ts-expect-error: WxtViteConfig is not typed correctly
  vite: () => ({
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'), // to work with shadcn cli
      },
    },
  }),
  manifest: {
    web_accessible_resources: [
      {
        resources: ['iframe-ui.html'], // output from entrypoints/iframe-ui/index.html
        matches: ['*://*/*'],
      },
    ],
    // Chrome needs this to allow the extension to ask users for permissions on mv3
    optional_host_permissions: ['*://*/*'],
    // @ts-expect-error: Firefox needs this to allow the extension to ask users for permissions on mv2
    optional_permissions: ['*://*/*'],
    permissions: [
      'storage',
      'scripting',
      'contextMenus',
      'activeTab',
    ],
    // this field must be present for webext-permission-toggle, but nothing needs to be specified
    action: {},
  },
  // WXT build hooks
  hooks: {
    'build:manifestGenerated': (wxt, manifest) => {
      if (wxt.config.command === 'serve') {
        // During development, content scripts are not listed in manifest at
        // all times, causing "webext-dynamic-content-scripts" to throw an error.
        // So we need to add them manually.
        // each content script should have it's triggers (value of the `matches` key in it's index.ts) and
        // the output js file it compiles to listed here to work.
        manifest.content_scripts ??= [];
        manifest.content_scripts.push({
          matches: ['*://*/*'],
          js: ['/content-scripts/content.js'],
          // If the script has CSS, add it here.
        });
      }
    },
  },
  webExt: {
    // These URLs will be automatically opened when running the dev server
    startUrls: [
      'https://wxt.dev',
      'https://google.com',
    ],
  },
  // Disable WXT auto-imports - use manual imports instead
  imports: false,
});
