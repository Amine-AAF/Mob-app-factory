import * as ScreenCapture from 'expo-screen-capture';

/**
 * FLAG_SECURE on Android (via expo-screen-capture): blocks screenshots and screen recording,
 * and shows a blank thumbnail in the recent-apps switcher. Enabled by default for the whole app.
 * Limit: it does not protect against a camera pointed at the screen, nor against a rooted device.
 */
const TAG = 'safevault';

export async function applyScreenProtection(enabled: boolean): Promise<void> {
  try {
    if (enabled) await ScreenCapture.preventScreenCaptureAsync(TAG);
    else await ScreenCapture.allowScreenCaptureAsync(TAG);
  } catch {
    // Not supported on this platform/build: nothing else we can do.
  }
}
