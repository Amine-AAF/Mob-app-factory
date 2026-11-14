import { useRef } from 'react';
import type { GestureResponderEvent } from 'react-native';

/**
 * Minimal drag gesture on React Native's responder props (no PanResponder object built during
 * render, no extra native dependency). Spread the result on a View.
 * - `capture` is called when the finger goes down; its value is handed back to every `onMove`
 *   (e.g. the crop rectangle at the start of the drag).
 * - `onMove` receives the displacement (screen px) since the finger went down.
 * Callers never touch refs: all mutable gesture state lives here, in event handlers only.
 */
export function useDrag<T>(handlers: {
  capture: () => T;
  onMove: (dx: number, dy: number, start: T) => void;
  onGrant?: (start: T) => void;
  onRelease?: () => void;
  enabled?: boolean;
}) {
  const gesture = useRef<{ x: number; y: number; start: T | null }>({ x: 0, y: 0, start: null });
  const enabled = handlers.enabled ?? true;
  return {
    onStartShouldSetResponder: () => enabled,
    onMoveShouldSetResponder: () => enabled,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: GestureResponderEvent) => {
      const start = handlers.capture();
      gesture.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, start };
      handlers.onGrant?.(start);
    },
    onResponderMove: (e: GestureResponderEvent) => {
      const g = gesture.current;
      if (g.start !== null) handlers.onMove(e.nativeEvent.pageX - g.x, e.nativeEvent.pageY - g.y, g.start);
    },
    onResponderRelease: () => handlers.onRelease?.(),
    onResponderTerminate: () => handlers.onRelease?.(),
  };
}
