/**
 * Sets android:largeHeap="true" on the <application> element.
 * FilePilot decodes large photos and renders PDF pages to bitmaps natively; the large heap
 * lowers the risk of OutOfMemoryError on mid-range devices. Bitmaps are still bounded in code.
 */
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withLargeHeap(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app) app.$['android:largeHeap'] = 'true';
    return cfg;
  });
};
