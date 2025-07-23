import { createRoot, type Root } from 'react-dom/client';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { getSelectionPosition } from '@/lib/utils/get-selection-position';
import { getWordUnderCursor } from '@/lib/utils/get-word-under-cursor';
import { SuggestionsMenu } from './suggestions-menu-popover';
import '~/assets/tailwind.css';

// eslint-disable-next-line react-refresh/only-export-components
export default defineContentScript({
  matches: ['*://*/*'],
  cssInjectionMode: 'ui',
  runAt: 'document_idle',
  async main(ctx) {
    console.log('Content script loaded');

    let ui: Awaited<ReturnType<typeof createShadowRootUi<{ root: Root, wrapper: HTMLDivElement }>>> | undefined;

    const mountSuggestionsMenu = async () => {
      // remove the ui if it is already mounted
      if (ui && ui.mounted) {
        ui.remove();
      }

      // get the position of the cursor
      const cursorPosition = getSelectionPosition();
      if (cursorPosition === undefined) {
        console.log('no cursor position found');
        return;
      }

      // get the word under the cursor
      const wordUnderCursor = getWordUnderCursor();
      if (wordUnderCursor === undefined) {
        console.log('no word under cursor found');
        return;
      }

      // define the ui for the suggestions menu popover
      ui = await createShadowRootUi(ctx, {
        name: 'suggestions-menu-popover-shadow-root',
        position: 'inline',
        anchor: 'body',
        append: 'first',
        onMount: (uiContainer) => {
          // create a wrapper element to mount the app component on
          const wrapper = document.createElement('div');
          uiContainer.append(wrapper);
          // mount the root react component on the wrapper element
          const root = createRoot(wrapper);
          root.render(
            <SuggestionsMenu
              wordUnderCursor={wordUnderCursor}
              position={cursorPosition}
            />,
          );
          // return the root and wrapper elements so that they can be accessed and removed later
          return { root, wrapper };
        },
        onRemove: (elements) => {
          elements?.root.unmount();
          elements?.wrapper.remove();
        },
      });

      // mount the ui
      ui.mount()
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // open the suggestions menu if cmd + . key is pressed
      if (event.metaKey && event.key === '.') {
        event.preventDefault();
        console.log('open suggestions menu triggered');
        void mountSuggestionsMenu();
      }
      // close the suggestions menu if the escape key is pressed
      if (event.key === 'Escape') {
        if (ui && ui.mounted) {
          ui.remove();
        }
      }
    };

    // Listen for keyboard events in the host document to open/close the suggestions menu
    document.addEventListener('keydown', handleKeyDown);

    // Clean up event listener and ui when content script is removed
    ctx.onInvalidated(() => {
      document.removeEventListener('keydown', handleKeyDown);
      if (ui && ui.mounted) {
        ui.remove();
      }
    });
  },
});
