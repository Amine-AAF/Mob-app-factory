import { Button, Row, Stack, Text } from '@factory/design-system';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { recordError } from '@/services/analytics';
import { stopSpeaking } from '@/services/speech';

/**
 * Record-and-replay. Recordings stay in the app cache and are never uploaded.
 * There is intentionally no automatic pronunciation score.
 */
export function Recorder({ onRecorded }: { onRecorded?: () => void }) {
  const { t } = useTranslation();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);
  const [uri, setUri] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    return () => {
      if (recorder.isRecording) recorder.stop().catch(() => undefined);
    };
  }, [recorder]);

  const start = async () => {
    try {
      stopSpeaking();
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setDenied(true);
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (e) {
      recordError(e, 'recorder_start');
    }
  };

  const stop = async () => {
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      setUri(recorder.uri);
      if (recorder.uri) {
        player.replace({ uri: recorder.uri });
        onRecorded?.();
      }
    } catch (e) {
      recordError(e, 'recorder_stop');
    }
  };

  const play = async () => {
    if (!uri) return;
    await player.seekTo(0);
    player.play();
  };

  if (denied) {
    return (
      <Text variant="bodySmall" tone="warning">
        {t('practice.micDenied')}
      </Text>
    );
  }

  return (
    <Stack gap={2}>
      <Row gap={2}>
        <Stack style={{ flex: 1 }}>
          {state.isRecording ? (
            <Button label={`${t('practice.stopRecording')} · ${Math.floor((state.durationMillis ?? 0) / 1000)}s`} icon="stop" variant="danger" onPress={stop} testID="stop-recording" />
          ) : (
            <Button label={t('practice.record')} icon="mic" variant="secondary" onPress={start} testID="record" />
          )}
        </Stack>
        {uri && !state.isRecording ? (
          <Stack style={{ flex: 1 }}>
            <Button label={t('practice.playMine')} icon="play" variant="secondary" onPress={play} />
          </Stack>
        ) : null}
      </Row>
    </Stack>
  );
}
