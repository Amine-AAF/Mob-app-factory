import { Screen, Text } from '@factory/design-system';

import manifest from '../app.manifest.json';

export default function Home() {
  return (
    <Screen>
      <Text variant="title">{manifest.name}</Text>
      <Text tone="muted">Start building your app here.</Text>
    </Screen>
  );
}
