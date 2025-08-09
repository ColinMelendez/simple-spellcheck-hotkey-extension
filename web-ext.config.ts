import { defineWebExtConfig } from 'wxt'

export default defineWebExtConfig({
  // IMPORTANT: install the puppeteer browser binaries and specify the paths here for development
  binaries: {
    chrome: './chrome/mac_arm-138.0.7204.94/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', // Use Chrome For Testing instead of regular Chrome
    firefox: './firefox/mac_arm-stable_140.0.4/Firefox.app/Contents/MacOS/firefox', // Use Firefox Developer Edition instead of regular Firefox
    // ------ other browsers can be included in the same format as above --------
    // edge: '/path/to/edge', // Open MS Edge when running "wxt -b edge"
  },
})
