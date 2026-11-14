import { Button, EmptyState, Screen } from '@factory/design-system';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { authenticate, isUnlockValid } from '@/services/documentLock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

/**
 * Shows its children only when the optional Documents lock is off or was passed recently.
 * The lock uses the phone's biometrics or screen lock; it hides content, it does not encrypt it.
 */
export function DocumentsGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const locked = usePreferences((s) => s.documentsLock);
  const unlockedAt = useSession((s) => s.documentsUnlockedAt);
  const setUnlockedAt = useSession((s) => s.setDocumentsUnlockedAt);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const open = !locked || isUnlockValid(unlockedAt, now);

  const unlock = async () => {
    setFailed(false);
    const ok = await authenticate(t('documents.unlockPrompt'), t('common.cancel'));
    if (ok) {
      const at = Date.now();
      setUnlockedAt(at);
      setNow(at);
    } else setFailed(true);
  };

  useEffect(() => {
    if (open) return;
    let active = true;
    authenticate(t('documents.unlockPrompt'), t('common.cancel')).then((ok) => {
      if (!active) return;
      if (ok) {
        const at = Date.now();
        setUnlockedAt(at);
        setNow(at);
      } else setFailed(true);
    });
    return () => {
      active = false;
    };
    // Prompt once when the gate first appears locked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (open) return <>{children}</>;
  return (
    <Screen testID="documents-locked">
      <EmptyState
        icon="lock-closed-outline"
        title={t('documents.lockedTitle')}
        message={failed ? t('documents.unlockFailed') : t('documents.lockedMessage')}
        action={<Button label={t('documents.unlock')} icon="finger-print-outline" onPress={unlock} testID="documents-unlock" />}
      />
    </Screen>
  );
}
