import { Icon, useTheme, type IconName } from '@factory/design-system';
import { useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import { photoUri } from '@/services/photos';

import { useLeaf } from './leaf';

/**
 * Local photo with a graceful botanical placeholder (missing file after a restore on a new
 * phone, deleted file, or no photo yet). Never loads remote images.
 */
export function PlantPhoto({
  path,
  icon = 'leaf',
  size,
  height,
  radius,
  style,
  label,
}: {
  path: string | null | undefined;
  icon?: IconName;
  size?: number;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const theme = useTheme();
  const tokens = useLeaf();
  const [failed, setFailed] = useState(false);
  const uri = failed ? null : photoUri(path);
  const dims: ViewStyle = size ? { width: size, height: size } : { width: '100%', height: height ?? 140 };
  const r = radius ?? theme.radius.md;
  return (
    <View
      style={[dims, { borderRadius: r, overflow: 'hidden', backgroundColor: tokens.sage, alignItems: 'center', justifyContent: 'center' }, style]}
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Icon name={icon} size={size ? Math.max(18, size * 0.42) : 44} color={tokens.moss} />
      )}
    </View>
  );
}
