import type { PadKey } from '@/components/Keypad';

/** Standard keypad: 4 × 5, large keys. `decimal` is the locale's separator. */
export function standardRows(decimal: string): PadKey[][] {
  const d = (n: string): PadKey => ({ id: n, label: n, a11y: `digit${n}`, action: { type: 'digit', value: n }, variant: 'digit' });
  return [
    [
      { id: 'clear', label: 'C', a11y: 'clear', action: { type: 'clear' }, variant: 'action' },
      { id: 'paren', label: '( )', a11y: 'parenthesis', action: { type: 'paren' }, variant: 'function' },
      { id: 'percent', label: '%', a11y: 'percent', action: { type: 'percent' }, variant: 'function' },
      { id: 'divide', label: '÷', a11y: 'divide', action: { type: 'op', value: '/' }, variant: 'operator' },
    ],
    [d('7'), d('8'), d('9'), { id: 'multiply', label: '×', a11y: 'multiply', action: { type: 'op', value: '*' }, variant: 'operator' }],
    [d('4'), d('5'), d('6'), { id: 'minus', label: '−', a11y: 'minus', action: { type: 'op', value: '-' }, variant: 'operator' }],
    [d('1'), d('2'), d('3'), { id: 'plus', label: '+', a11y: 'plus', action: { type: 'op', value: '+' }, variant: 'operator' }],
    [
      { id: 'sign', label: '±', a11y: 'sign', action: { type: 'sign' }, variant: 'digit' },
      d('0'),
      { id: 'decimal', label: decimal, a11y: 'decimal', action: { type: 'decimal' }, variant: 'digit' },
      { id: 'equals', label: '=', a11y: 'equals', action: { type: 'equals' }, variant: 'equals' },
    ],
  ];
}

/** Scientific function rows shown above the standard keypad (compact keys). */
export function scientificRows(second: boolean, angle: 'deg' | 'rad'): PadKey[][] {
  const fn = (id: string, label: string, a11y: string, action: PadKey['action']): PadKey => ({ id, label, a11y, action, variant: 'function' });
  return [
    [
      { id: 'second', label: '2nd', a11y: 'second', action: { type: 'second' }, variant: 'function', active: second },
      { id: 'angle', label: angle === 'deg' ? 'DEG' : 'RAD', a11y: angle === 'deg' ? 'degrees' : 'radians', action: { type: 'angle' }, variant: 'function' },
      second ? fn('asin', 'sin⁻¹', 'asin', { type: 'fn', value: 'asin' }) : fn('sin', 'sin', 'sin', { type: 'fn', value: 'sin' }),
      second ? fn('acos', 'cos⁻¹', 'acos', { type: 'fn', value: 'acos' }) : fn('cos', 'cos', 'cos', { type: 'fn', value: 'cos' }),
      second ? fn('atan', 'tan⁻¹', 'atan', { type: 'fn', value: 'atan' }) : fn('tan', 'tan', 'tan', { type: 'fn', value: 'tan' }),
    ],
    [
      fn('square', 'x²', 'square', { type: 'square' }),
      fn('cube', 'x³', 'cube', { type: 'cube' }),
      fn('power', 'xʸ', 'power', { type: 'op', value: '^' }),
      fn('sqrt', '√', 'sqrt', { type: 'fn', value: 'sqrt' }),
      second ? fn('root', 'ʸ√x', 'root', { type: 'fn', value: 'root' }) : fn('cbrt', '∛', 'cbrt', { type: 'fn', value: 'cbrt' }),
    ],
    [
      second ? fn('exp', 'eˣ', 'expPower', { type: 'expPower' }) : fn('ln', 'ln', 'ln', { type: 'fn', value: 'ln' }),
      second ? fn('ten', '10ˣ', 'tenPower', { type: 'tenPower' }) : fn('log', 'log', 'log', { type: 'fn', value: 'log' }),
      fn('fact', 'n!', 'factorial', { type: 'factorial' }),
      fn('pi', 'π', 'pi', { type: 'const', value: 'pi' }),
      fn('e', 'e', 'e', { type: 'const', value: 'e' }),
    ],
    [
      fn('open', '(', 'open', { type: 'open' }),
      fn('close', ')', 'close', { type: 'close' }),
      second ? fn('sep', ';', 'separator', { type: 'separator' }) : fn('inv', '1/x', 'reciprocal', { type: 'reciprocal' }),
      fn('ee', 'EE', 'exp', { type: 'exp' }),
      fn('abs', '|x|', 'abs', { type: 'fn', value: 'abs' }),
    ],
  ];
}
