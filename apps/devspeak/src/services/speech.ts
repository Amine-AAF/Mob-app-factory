import * as Speech from 'expo-speech';

/**
 * Text-to-speech via the device engine (Android TTS). Free, offline when the
 * English voice pack is installed. We never claim to evaluate pronunciation.
 */
let englishVoiceCache: boolean | null = null;

export async function hasEnglishVoice(): Promise<boolean> {
  if (englishVoiceCache !== null) return englishVoiceCache;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Some Android engines return an empty list but still speak; treat empty as "unknown = available".
    englishVoiceCache = voices.length === 0 || voices.some((v) => v.language?.toLowerCase().startsWith('en'));
  } catch {
    englishVoiceCache = false;
  }
  return englishVoiceCache;
}

export function speak(text: string, opts: { rate?: number; onDone?: () => void; onError?: () => void } = {}): void {
  Speech.stop().catch(() => undefined);
  Speech.speak(text, {
    language: 'en-US',
    rate: opts.rate ?? 0.95,
    pitch: 1,
    onDone: opts.onDone,
    onStopped: opts.onDone,
    onError: () => opts.onError?.(),
  });
}

export function stopSpeaking(): void {
  Speech.stop().catch(() => undefined);
}
