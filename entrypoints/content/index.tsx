import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import { createRoot } from 'react-dom/client';
import { browser } from 'wxt/browser';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { Message } from '@/lib/domain/message-schema';
import { SuggestionsMenuPopover } from './suggestions-menu-popover';
import '~/assets/tailwind.css';

// eslint-disable-next-line react-refresh/only-export-components
export default defineContentScript({
  matches: ['*://*/*'],
  cssInjectionMode: 'ui',
  runAt: 'document_idle',
  async main(ctx) {
    console.log('Content script loaded');
    // define the ui for the suggestions menu popover
    const ui = await createShadowRootUi(ctx, {
      name: 'suggestions-menu-popover-shadow-root',
      position: 'inline',
      anchor: 'body',
      append: 'first',
      isolateEvents: true,
      onMount: (uiContainer) => {
        // create a wrapper element to mount the app component on
        const wrapper = document.createElement('div');
        uiContainer.append(wrapper);
        // mount the root react component on the wrapper element
        const root = createRoot(wrapper);
        root.render(<SuggestionsMenuPopover />);
        // return the root and wrapper elements so that they can be accessed and removed later
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    // mount the ui
    ui.mount();

    // listen for the termination signal from the popup, and remove the ui if it is received
    browser.runtime.onMessage.addListener((message) => {
      const decodedMessage = Schema.decodeUnknownOption(Message)(message);
      if (Option.isSome(decodedMessage) && decodedMessage.value.messageCategory === 'disable-scramble') {
        ui.remove();
      }
    })
  },
});
