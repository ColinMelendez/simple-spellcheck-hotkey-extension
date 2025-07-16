import type { HtmlPublicPath } from 'wxt/browser';
import { createIframeUi, defineContentScript } from '#imports'; // WXT built-ins

export default defineContentScript({
  matches: ['*://*/*'],

  main(ctx) {
    // Define the UI
    const ui = createIframeUi(ctx, {
      page: '/iframe-ui.html' as HtmlPublicPath, // the output of the entrypoint we created at entrypoints/iframe-ui/index.html
      position: 'modal',
      anchor: 'body',
      append: 'first',
      zIndex: 9999, // this element is inherently in a z-index war with everything
      onMount: (wrapper, iframe) => {
        // Add styles to the iframe like width
        iframe.style.border = 'none';
        iframe.style.minWidth = '100px';
        iframe.style.minHeight = '100px';
        iframe.style.borderRadius = '10px';
        iframe.style.display = 'flex';
        iframe.style.flexDirection = 'column';
        iframe.style.alignItems = 'center';
        iframe.style.justifyContent = 'center';

        // iframe.style.backgroundColor = 'transparent';
        // wrapper.style.backgroundColor = 'transparent';
      },
    });

    // Show UI to user
    ui.mount();
  },
});
