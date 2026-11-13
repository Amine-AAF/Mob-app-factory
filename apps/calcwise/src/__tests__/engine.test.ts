import { autoClose, evaluate, type EvaluationResult } from '@/services/MathematicalEngine';
import { formatDecimal } from '@/utils/numberFormat';

const show = (r: EvaluationResult) => (r.ok ? formatDecimal(r.value, 'en-US', { grouping: false }) : `ERR:${r.error}`);
const calc = (expr: string, angle: 'deg' | 'rad' = 'deg') => show(evaluate(expr, { angle }));

describe('MathematicalEngine — standard arithmetic', () => {
  it.each([
    ['1+2', '3'],
    ['2+3*4', '14'],
    ['(2+3)*4', '20'],
    ['10-4-3', '3'],
    ['100/4/5', '5'],
    ['7/2', '3.5'],
    ['2×3÷4', '1.5'],
    ['8−10', '−2'],
    ['-5+3', '−2'],
    ['--5', '5'],
    ['3*-2', '−6'],
    ['.5+.25', '0.75'],
  ])('%s = %s', (expr, expected) => expect(calc(expr)).toBe(expected));

  it('is exact on classic floating point traps', () => {
    expect(calc('0.1+0.2')).toBe('0.3');
    expect(calc('0.3-0.1')).toBe('0.2');
    expect(calc('1.1*1.1')).toBe('1.21');
    expect(calc('0.07*100')).toBe('7');
    expect(calc('1/3*3')).toBe('1');
    expect(calc('1/3*3-1')).toBe('0');
    expect(calc('2/3')).toBe('0.666666666666667');
  });

  it('keeps exact differences of large integers (no false cancellation)', () => {
    expect(calc('12345678901234567890^2-(12345678901234567890^2-1)')).toBe('1');
  });

  it('reports division by zero instead of Infinity', () => {
    expect(calc('1/0')).toBe('ERR:division_by_zero');
    expect(calc('5/(3-3)')).toBe('ERR:division_by_zero');
    expect(calc('0/0')).toBe('ERR:division_by_zero');
  });

  it('auto-closes parentheses', () => {
    expect(autoClose('(2+3')).toBe('(2+3)');
    expect(calc('(2+3')).toBe('5');
    expect(calc('2*(3+(4')).toBe('14');
  });

  it('supports implicit multiplication', () => {
    expect(calc('2(3+1)')).toBe('8');
    expect(calc('(1+1)(2+3)')).toBe('10');
    expect(calc('2π', 'rad')).toBe('6.28318530717959');
    expect(calc('3√16')).toBe('12');
  });

  it('rejects malformed expressions', () => {
    for (const bad of ['2+', '*3', '1..2', '()', '2)(', 'abc', '1E', 'sin 30', '3+*4', ')']) {
      expect(calc(bad)).toBe('ERR:syntax');
    }
    expect(calc('')).toBe('ERR:empty');
    expect(calc('1+'.repeat(300))).toBe('ERR:too_long');
  });

  it('never executes code', () => {
    expect(calc('alert(1)')).toBe('ERR:syntax');
    expect(calc('constructor')).toBe('ERR:syntax');
    expect(calc('1;2')).toBe('ERR:syntax');
  });
});

describe('MathematicalEngine — percent', () => {
  it.each([
    ['50%', '0.5'],
    ['20%*250', '50'],
    ['250*20%', '50'],
    ['200+10%', '220'],
    ['200-10%', '180'],
    ['500-15%', '425'],
    ['100+(10)%', '110'],
    ['10%+5', '5.1'],
  ])('%s = %s', (expr, expected) => expect(calc(expr)).toBe(expected));
});

describe('MathematicalEngine — scientific', () => {
  it('powers and roots', () => {
    expect(calc('2^10')).toBe('1024');
    expect(calc('2^3^2')).toBe('512');
    expect(calc('-2^2')).toBe('−4');
    expect(calc('(-2)^2')).toBe('4');
    expect(calc('2^-1')).toBe('0.5');
    expect(calc('4^0.5')).toBe('2');
    expect(calc('5²')).toBe('25');
    expect(calc('3³')).toBe('27');
    expect(calc('√2')).toBe('1.4142135623731');
    expect(calc('sqrt(144)')).toBe('12');
    expect(calc('cbrt(-27)')).toBe('−3');
    expect(calc('root(32;5)')).toBe('2');
    expect(calc('root(-8;3)')).toBe('−2');
    expect(calc('root(-16;4)')).toBe('ERR:domain');
    expect(calc('√(-1)')).toBe('ERR:domain');
    expect(calc('(-8)^(1/3)')).toBe('ERR:domain');
    expect(calc('0^-1')).toBe('ERR:division_by_zero');
  });

  it('trigonometry in degrees', () => {
    expect(calc('sin(30)')).toBe('0.5');
    expect(calc('sin(90)')).toBe('1');
    expect(calc('sin(180)')).toBe('0');
    expect(calc('cos(60)')).toBe('0.5');
    expect(calc('cos(90)')).toBe('0');
    expect(calc('tan(45)')).toBe('1');
    expect(calc('tan(90)')).toBe('ERR:domain');
    expect(calc('tan(270)')).toBe('ERR:domain');
    expect(calc('sin(-30)')).toBe('−0.5');
    expect(calc('sin(30)*2-1')).toBe('0');
  });

  it('trigonometry in radians', () => {
    expect(calc('sin(π)', 'rad')).toBe('0');
    expect(calc('cos(π)', 'rad')).toBe('−1');
    expect(calc('sin(π/6)', 'rad')).toBe('0.5');
    expect(calc('tan(π/2)', 'rad')).toBe('ERR:domain');
    expect(calc('sin(1)', 'rad')).toBe('0.841470984807897');
  });

  it('inverse trigonometry', () => {
    expect(calc('asin(0.5)')).toBe('30');
    expect(calc('acos(0)')).toBe('90');
    expect(calc('atan(1)')).toBe('45');
    expect(calc('asin(1)', 'rad')).toBe('1.5707963267949');
    expect(calc('asin(2)')).toBe('ERR:domain');
    expect(calc('acos(-1.0001)')).toBe('ERR:domain');
  });

  it('logarithms', () => {
    expect(calc('log(1000)')).toBe('3');
    expect(calc('log(0.01)')).toBe('−2');
    expect(calc('ln(e)')).toBe('1');
    expect(calc('ln(1)')).toBe('0');
    expect(calc('e^ln(5)')).toBe('5');
    expect(calc('log(0)')).toBe('ERR:domain');
    expect(calc('ln(-1)')).toBe('ERR:domain');
  });

  it('factorial', () => {
    expect(calc('0!')).toBe('1');
    expect(calc('5!')).toBe('120');
    expect(calc('3!!')).toBe('720');
    expect(calc('-3!')).toBe('−6');
    // 20! = 2432902008176640000 (19 digits) → scientific with a 10-digit mantissa, rounded half-up
    expect(calc('20!')).toBe('2.432902008 × 10¹⁸');
    expect(calc('17!')).toBe('355687428096000');
    expect(calc('2.5!')).toBe('ERR:domain');
    expect(calc('(-1)!')).toBe('ERR:domain');
    expect(calc('3001!')).toBe('ERR:overflow');
  });

  it('constants and scientific notation input', () => {
    expect(calc('π', 'rad')).toBe('3.14159265358979');
    expect(calc('e')).toBe('2.71828182845905');
    expect(calc('1.5E3+1')).toBe('1501');
    expect(calc('2E-3')).toBe('0.002');
  });

  it('handles very large and very small magnitudes without silent errors', () => {
    expect(calc('10^20')).toBe('1 × 10²⁰');
    expect(calc('1/10^12')).toBe('1 × 10⁻¹²');
    expect(calc('2^-40')).toBe('9.094947018 × 10⁻¹³');
    expect(calc('10^9999*10')).toBe('ERR:overflow');
    expect(calc('1000!')).toBe('4.023872601 × 10²⁵⁶⁷'); // 4.0238726007709… rounded half-up
  });
});
