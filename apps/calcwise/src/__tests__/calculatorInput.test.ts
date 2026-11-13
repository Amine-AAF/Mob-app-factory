import { equals, INITIAL_STATE, loadValue, press, previewValue, type CalcState, type Key } from '@/features/calculator/input';

const keys = (seq: string): Key[] =>
  seq.split(' ').map((k): Key => {
    if (/^[0-9]$/.test(k)) return { type: 'digit', value: k };
    if (k === '.') return { type: 'decimal' };
    if ('+-*/^'.includes(k)) return { type: 'op', value: k as '+' };
    const named: Record<string, Key> = {
      '%': { type: 'percent' },
      '()': { type: 'paren' },
      '(': { type: 'open' },
      ')': { type: 'close' },
      '±': { type: 'sign' },
      '⌫': { type: 'backspace' },
      C: { type: 'clear' },
      sin: { type: 'fn', value: 'sin' },
      root: { type: 'fn', value: 'root' },
      ';': { type: 'separator' },
      π: { type: 'const', value: 'pi' },
      'x²': { type: 'square' },
      '!': { type: 'factorial' },
      EE: { type: 'exp' },
      '1/x': { type: 'reciprocal' },
    };
    const key = named[k];
    if (!key) throw new Error(`unknown key ${k}`);
    return key;
  });

const type = (seq: string, from: CalcState = INITIAL_STATE) => keys(seq).reduce(press, from);
const result = (seq: string, from?: CalcState) => equals(type(seq, from), 'deg');

describe('calculator keypad', () => {
  it('builds expressions', () => {
    expect(type('1 2 + 3 . 5').expr).toBe('12+3.5');
    expect(type('. 5').expr).toBe('0.5');
    expect(type('0 0 7').expr).toBe('7');
    expect(type('1 0 0').expr).toBe('100');
    expect(type('3 . 1 . 4').expr).toBe('3.14');
  });

  it('replaces a trailing operator but allows a negative operand', () => {
    expect(type('5 + *').expr).toBe('5*');
    expect(type('5 * -').expr).toBe('5*-');
    expect(type('- 5').expr).toBe('-5');
    expect(type('*').expr).toBe('');
  });

  it('smart parenthesis', () => {
    expect(type('() 2 + 3 () * 4').expr).toBe('(2+3)*4');
    expect(result('() 2 + 3 () * 4').record?.result).toBe('20');
  });

  it('± toggles the sign of the current number', () => {
    expect(type('5 ±').expr).toBe('(-5');
    expect(type('5 ± ±').expr).toBe('5');
    expect(type('3 + 5 ±').expr).toBe('3+(-5');
    expect(result('3 + 5 ±').record?.result).toBe('-2');
  });

  it('backspace removes whole function names', () => {
    expect(type('sin ⌫').expr).toBe('');
    expect(type('1 2 ⌫').expr).toBe('1');
  });

  it('percent, square, factorial and reciprocal need an operand', () => {
    expect(type('%').expr).toBe('');
    expect(result('2 0 0 + 1 0 %').record?.result).toBe('220');
    expect(result('5 x²').record?.result).toBe('25');
    expect(result('5 !').record?.result).toBe('120');
    expect(result('4 1/x').record?.result).toBe('0.25');
  });

  it('scientific notation entry and root separator', () => {
    expect(result('1 EE 3 + 1').record?.result).toBe('1001');
    expect(result('root 2 7 ; 3 )').record?.result).toBe('3');
  });

  it('chains on the exact previous result (no 0.999… artefact)', () => {
    const first = result('1 / 3');
    expect(first.record?.result).toBe('0.333333333333333');
    const chained = result('* 3', first.state);
    expect(chained.state.expr).toBe('1');
    expect(chained.record?.expression).toBe('0.333333333333333*3');
  });

  it('a digit after "=" starts a new calculation', () => {
    const first = result('2 + 2');
    expect(type('7', first.state).expr).toBe('7');
  });

  it('shows a preview only for real operations', () => {
    expect(previewValue(type('2 + 3'), 'deg')?.toString()).toBe('5');
    expect(previewValue(type('2 +'), 'deg')).toBeNull();
    expect(previewValue(type('4 2'), 'deg')).toBeNull();
    expect(previewValue(type('- 4'), 'deg')).toBeNull();
  });

  it('keeps the expression and reports the error on invalid input', () => {
    const r = result('1 / 0');
    expect(r.state.error).toBe('division_by_zero');
    expect(r.state.expr).toBe('1/0');
    expect(r.record).toBeUndefined();
  });

  it('clear keeps ans; loadValue reuses a history value', () => {
    const r = result('6 * 7');
    expect(press(r.state, { type: 'clear' }).ans).toBe('42');
    expect(loadValue(INITIAL_STATE, '-12.5').expr).toBe('(-12.5');
    expect(loadValue(type('3 +'), '4').expr).toBe('3+4');
  });

  it('limits digits per number', () => {
    expect(type('9 '.repeat(25).trim()).expr).toHaveLength(20);
  });
});
