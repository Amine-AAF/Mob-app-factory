import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { usePreferences } from '@/store/preferences';

/**
 * Optional sound & vibration cues for rest ends and timer phases. Both are user
 * settings (Profile › Settings) and per-timer toggles. Failures are ignored: a cue
 * is a convenience, never required for the timer to work.
 */
let player: AudioPlayer | null = null;

function beepPlayer(): AudioPlayer | null {
  if (player) return player;
  try {
    player =createAudioPlayer(require('../../assets/sounds/beep.wav'));
  } catch {
    player = null;
  }
  return player;
}

export function cue(kind: 'tick' | 'phase' | 'end', opts?: { sound?: boolean; vibration?: boolean }): void {
  const p = usePreferences.getState();
  const sound = opts?.sound ?? p.sound;
  const vibration = opts?.vibration ?? p.vibration;
  if (vibration) {
    const run = kind === 'end' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Haptics.impactAsync(kind === 'phase' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
    run.catch(() => undefined);
  }
  if (sound && kind !== 'tick') {
    try {
      const pl = beepPlayer();
      if (pl) {
        pl.seekTo(0).catch(() => undefined);
        pl.play();
      }
    } catch {
      // audio unavailable
    }
  }
}
