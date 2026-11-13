import { router } from 'expo-router';

import { getTool, type ToolId } from '@/constants/tools';

/** Opens a tool screen; standard/scientific open the Calculator tab in the right mode. */
export function openTool(id: ToolId): void {
  const tool = getTool(id);
  if (!tool) return;
  if (id === 'standard' || id === 'scientific') {
    router.navigate({ pathname: '/(tabs)/calculator', params: { mode: id } });
    return;
  }
  router.push(tool.route);
}
