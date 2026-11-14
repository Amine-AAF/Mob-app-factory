/**
 * Sets android:largeHeap="true" on the <application> element.
 * ImageCraft decodes photos into bitmaps natively; the large heap lowers the risk of
 * OutOfMemoryError on mid-range devices. Bitmaps are still bounded in code (pixel budgets).
 */
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withLargeHeap(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app) app.$['android:largeHeap'] = 'true';
    return cfg;
  });
};
