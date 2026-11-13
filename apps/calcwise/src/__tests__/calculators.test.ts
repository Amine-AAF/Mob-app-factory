import { applyDiscounts, compareOffers, unitPrice, vatFromGross, vatFromNet } from '@/services/calculators/DiscountCalculator';
import { calculateLoan, compareLoans, simulatePrepayment } from '@/services/calculators/LoanCalculator';
import * as P from '@/services/calculators/PercentageCalculator';
import { calculateSavings, equivalentMonthlyRate, futureValueClosedForm, type SavingsInput } from '@/services/calculators/SavingsCalculator';
import { splitBill } from '@/services/calculators/TipCalculator';
import { convert, convertAll, UNITS, UNIT_CATEGORIES } from '@/services/calculators/UnitConverter';
import { Dec, sum } from '@/utils/decimal';

const d = (v: string | number) => new Dec(v);
const val = <T>(r: { ok: true; value: T } | { ok: false }) => {
  if (!r.ok) throw new Error(`expected ok, got ${JSON.stringify(r)}`);
  return r.value;
};
const str = (v: Dec, dp = 2) => v.toDecimalPlaces(dp).toFixed(dp);

describe('PercentageCalculator', () => {
  it('20 % of 250 = 50', () => expect(val(P.percentOf(d(20), d(250))).toString()).toBe('50'));
  it('15 % off 500 = 425 (saves 75)', () => {
    const r = val(P.decrease(d(500), d(15)));
    expect(r.result.toString()).toBe('425');
    expect(r.delta.toString()).toBe('75');
  });
  it('+12.5 % on 80 = 90', () => expect(val(P.increase(d(80), d(12.5))).result.toString()).toBe('90'));
  it('100 → 120 is +20 %', () => expect(val(P.change(d(100), d(120))).percent.toString()).toBe('20'));
  it('120 → 100 is −16.67 %', () => expect(str(val(P.change(d(120), d(100))).percent)).toBe('-16.67'));
  it('change from a negative base uses |from|', () => expect(val(P.change(d(-50), d(-25))).percent.toString()).toBe('50'));
  it('45 is 25 % of 180', () => expect(val(P.ratio(d(45), d(180))).toString()).toBe('25'));
  it('original price before a 20 % discount of a 80 item = 100', () => expect(val(P.originalBeforeDecrease(d(80), d(20))).original.toString()).toBe('100'));
  it('original price before +20 % VAT on 120 = 100', () => expect(val(P.originalBeforeIncrease(d(120), d(20))).original.toString()).toBe('100'));
  it('margin and markup', () => {
    const r = val(P.marginFromPrices(d(60), d(100)));
    expect(r.profit.toString()).toBe('40');
    expect(r.marginPercent?.toString()).toBe('40');
    expect(str(r.markupPercent as Dec)).toBe('66.67');
    expect(val(P.priceFromMargin(d(60), d(40))).price.toString()).toBe('100');
    expect(val(P.priceFromMarkup(d(60), d(50))).price.toString()).toBe('90');
  });
  it('rejects impossible inputs instead of returning wrong values', () => {
    expect(P.change(d(0), d(5))).toEqual({ ok: false, issue: 'zero_division', field: 'from' });
    expect(P.ratio(d(5), d(0)).ok).toBe(false);
    expect(P.originalBeforeDecrease(d(10), d(100)).ok).toBe(false);
    expect(P.priceFromMargin(d(10), d(100)).ok).toBe(false);
    expect(P.marginFromPrices(d(-1), d(10)).ok).toBe(false);
  });
});

describe('DiscountCalculator', () => {
  it('single discount', () => {
    const r = val(applyDiscounts(d(80), [d(25)]));
    expect(r.final.toString()).toBe('60');
    expect(r.saved.toString()).toBe('20');
  });
  it('successive discounts multiply (20 % then 10 % = 28 %)', () => {
    const r = val(applyDiscounts(d(100), [d(20), d(10)]));
    expect(r.final.toString()).toBe('72');
    expect(r.effectivePercent.toString()).toBe('28');
    expect(r.steps.map((s) => s.saved.toString())).toEqual(['20', '8']);
  });
  it('100 % discount is free, more is refused', () => {
    expect(val(applyDiscounts(d(50), [d(100)])).final.toString()).toBe('0');
    expect(applyDiscounts(d(50), [d(101)]).ok).toBe(false);
    expect(applyDiscounts(d(-1), [d(10)]).ok).toBe(false);
  });
  it('VAT both ways (20 %)', () => {
    const a = val(vatFromNet(d(100), d(20)));
    expect([a.vat.toString(), a.gross.toString()]).toEqual(['20', '120']);
    const b = val(vatFromGross(d(120), d(20)));
    expect([b.net.toString(), b.vat.toString()]).toEqual(['100', '20']);
    const c = val(vatFromGross(d(10), d(5.5)));
    expect(str(c.net)).toBe('9.48');
    expect(str(c.net.plus(c.vat))).toBe('10.00');
  });
  it('unit price per kg / per L', () => {
    expect(val(unitPrice({ price: d(3), quantity: d(500), unit: 'g' })).perBase.toString()).toBe('6');
    expect(val(unitPrice({ price: d(1.5), quantity: d(75), unit: 'cl' })).perBase.toString()).toBe('2');
    expect(unitPrice({ price: d(1), quantity: d(0), unit: 'kg' }).ok).toBe(false);
  });
  it('compares offers with different pack sizes', () => {
    const r = val(compareOffers({ price: d(2.4), quantity: d(400), unit: 'g' }, { price: d(5), quantity: d(1), unit: 'kg' }));
    expect(r.cheaper).toBe('b');
    expect(r.a.perBase.toString()).toBe('6');
    expect(r.differencePercent.toString()).toBe('20');
    expect(compareOffers({ price: d(1), quantity: d(1), unit: 'kg' }, { price: d(1), quantity: d(1), unit: 'l' })).toMatchObject({ ok: false, issue: 'incompatible_units' });
  });
});

describe('TipCalculator', () => {
  const base = { tipPercent: d(15), people: 1, extra: d(0), roundStep: null, fractionDigits: 2 };
  it('15 % tip on 80', () => {
    const r = val(splitBill({ ...base, bill: d(80) }));
    expect([r.tip.toString(), r.total.toString()]).toEqual(['12', '92']);
  });
  it('splits to the cent and always adds up (100 / 3)', () => {
    const r = val(splitBill({ ...base, bill: d(100), tipPercent: d(0), people: 3 }));
    expect(r.shares.map((s) => [s.amount.toFixed(2), s.count])).toEqual([
      ['33.34', 1],
      ['33.33', 2],
    ]);
    expect(sum(r.shares.map((s) => s.amount.times(s.count))).toFixed(2)).toBe('100.00');
  });
  it('rounds each share up to the chosen step and reports the surplus', () => {
    const r = val(splitBill({ ...base, bill: d(87.4), tipPercent: d(10), people: 4, roundStep: d(1) }));
    // total 96.14 → 24.035 each → 25.00 each → 100.00 collected
    expect(r.total.toString()).toBe('96.14');
    expect(r.shares).toEqual([{ amount: d(25), count: 4 }]);
    expect(r.roundingSurplus.toString()).toBe('3.86');
  });
  it('adds a fixed extra and supports zero-decimal currencies', () => {
    const r = val(splitBill({ ...base, bill: d(1000), tipPercent: d(10), people: 3, extra: d(500), fractionDigits: 0 }));
    expect(r.total.toString()).toBe('1600');
    expect(r.shares.map((s) => [s.amount.toString(), s.count])).toEqual([
      ['534', 1],
      ['533', 2],
    ]);
  });
  it('validates input', () => {
    expect(splitBill({ ...base, bill: d(10), people: 0 }).ok).toBe(false);
    expect(splitBill({ ...base, bill: d(10), people: 1.5 }).ok).toBe(false);
    expect(splitBill({ ...base, bill: d(-10) }).ok).toBe(false);
  });
});

describe('LoanCalculator', () => {
  it('reference annuity: 200 000 at 3.5 % over 20 years', () => {
    const r = val(calculateLoan({ principal: d(200000), annualRate: d(3.5), months: 240 }));
    // M = P·i/(1−(1+i)^−n) = 1159.92 (bank tables)
    expect(r.monthlyPayment.toFixed(2)).toBe('1159.92');
    expect(r.schedule).toHaveLength(240);
    expect(r.schedule[0]?.interest.toFixed(2)).toBe('583.33');
    expect(r.schedule[0]?.principal.toFixed(2)).toBe('576.59');
  });

  it('amortization table is consistent: Σ principal = P, balance ends at 0, totals add up', () => {
    for (const [P, rate, n] of [
      [10000, 5, 36],
      [250000, 4.2, 300],
      [1234.56, 19.9, 7],
      [5000, 0, 12],
      [999999, 12.75, 600],
    ] as const) {
      const r = val(calculateLoan({ principal: d(P), annualRate: d(rate), months: n }));
      expect(sum(r.schedule.map((row) => row.principal)).toString()).toBe(d(P).toString());
      expect(r.schedule[r.schedule.length - 1]?.balance.toString()).toBe('0');
      expect(r.totalPaid.toString()).toBe(sum(r.schedule.map((row) => row.payment)).toString());
      expect(r.totalInterest.toString()).toBe(sum(r.schedule.map((row) => row.interest)).toString());
      expect(sum(r.years.map((y) => y.principal)).toString()).toBe(d(P).toString());
      // every amount is in cents
      r.schedule.forEach((row) => expect(row.payment.decimalPlaces()).toBeLessThanOrEqual(2));
      // the payment is rounded up, so the adjusted last payment is never larger than the others
      const last = r.schedule[r.schedule.length - 1]?.payment as Dec;
      expect(last.lte(r.monthlyPayment) && last.gt(0)).toBe(true);
      expect(r.schedule).toHaveLength(n);
    }
  });

  it('zero-rate loan divides evenly', () => {
    const r = val(calculateLoan({ principal: d(1200), annualRate: d(0), months: 12 }));
    expect(r.monthlyPayment.toString()).toBe('100');
    expect(r.totalInterest.toString()).toBe('0');
  });

  it('includes upfront fees in total cost only', () => {
    const r = val(calculateLoan({ principal: d(10000), annualRate: d(5), months: 36, fees: d(300) }));
    expect(r.totalCost.minus(r.totalInterest).toString()).toBe('300');
  });

  it('validates input', () => {
    expect(calculateLoan({ principal: d(0), annualRate: d(5), months: 12 }).ok).toBe(false);
    expect(calculateLoan({ principal: d(1000), annualRate: d(-1), months: 12 }).ok).toBe(false);
    expect(calculateLoan({ principal: d(1000), annualRate: d(5), months: 0 }).ok).toBe(false);
    expect(calculateLoan({ principal: d(1000), annualRate: d(5), months: 601 }).ok).toBe(false);
    expect(calculateLoan({ principal: d(1000), annualRate: d(5), months: 12.5 }).ok).toBe(false);
  });

  it('early repayment — reduce term keeps the payment and saves interest', () => {
    const input = { principal: d(100000), annualRate: d(4), months: 180 };
    const r = val(simulatePrepayment(input, { afterMonth: 24, amount: d(20000), mode: 'reduce_term' }));
    expect(r.newMonthlyPayment.toString()).toBe(r.base.monthlyPayment.toString());
    expect(r.monthsSaved).toBeGreaterThan(0);
    expect(r.interestSaved.gt(0)).toBe(true);
    expect(sum(r.withPrepayment.schedule.map((row) => row.principal)).toString()).toBe('100000');
    expect(r.withPrepayment.schedule[r.withPrepayment.schedule.length - 1]?.balance.toString()).toBe('0');
  });

  it('early repayment — reduce payment keeps the end date', () => {
    const input = { principal: d(100000), annualRate: d(4), months: 180 };
    const r = val(simulatePrepayment(input, { afterMonth: 24, amount: d(20000), mode: 'reduce_payment' }));
    expect(r.withPrepayment.months).toBe(180);
    expect(r.newMonthlyPayment.lt(r.base.monthlyPayment)).toBe(true);
    expect(sum(r.withPrepayment.schedule.map((row) => row.principal)).toString()).toBe('100000');
  });

  it('early repayment larger than the balance closes the loan', () => {
    const r = val(simulatePrepayment({ principal: d(10000), annualRate: d(5), months: 24 }, { afterMonth: 12, amount: d(999999), mode: 'reduce_term' }));
    expect(r.withPrepayment.months).toBe(12);
    expect(r.withPrepayment.schedule[11]?.balance.toString()).toBe('0');
  });

  it('compares two simulations', () => {
    const r = val(compareLoans({ principal: d(150000), annualRate: d(3.8), months: 240 }, { principal: d(150000), annualRate: d(3.8), months: 300 }));
    expect(r.paymentDifference.lt(0)).toBe(true); // longer = lower payment…
    expect(r.interestDifference.gt(0)).toBe(true); // …but more interest
  });
});

describe('SavingsCalculator', () => {
  const base: SavingsInput = { initial: d(1000), monthly: d(100), annualRate: d(5), months: 120, compounding: 'monthly', timing: 'end' };

  it('matches the closed-form future value (all compounding/timing combinations)', () => {
    for (const compounding of ['monthly', 'quarterly', 'annually'] as const) {
      for (const timing of ['end', 'start'] as const) {
        const input = { ...base, compounding, timing };
        const r = val(calculateSavings(input));
        expect(r.finalBalance.minus(futureValueClosedForm(input)).abs().lt('1e-30')).toBe(true);
      }
    }
  });

  it('reference value: 1 000 + 100/month at 5 % for 10 years ≈ 17 175.24', () => {
    const r = val(calculateSavings(base));
    expect(r.finalBalance.toFixed(2)).toBe('17175.24');
    expect(r.totalDeposited.toString()).toBe('13000');
    expect(r.totalInterest.toFixed(2)).toBe('4175.24');
    expect(r.years).toHaveLength(10);
    expect(r.years[9]?.balance.toFixed(2)).toBe('17175.24');
  });

  it('annual compounding gives exactly r per year on a lump sum', () => {
    expect(val(calculateSavings({ ...base, monthly: d(0), months: 12, compounding: 'annually' })).finalBalance.toFixed(10)).toBe('1050.0000000000');
    expect(equivalentMonthlyRate(d(12), 'monthly').toString()).toBe('0.01');
  });

  it('zero rate = deposits only; partial final year is reported', () => {
    const r = val(calculateSavings({ ...base, annualRate: d(0), months: 18 }));
    expect(r.finalBalance.toString()).toBe('2800');
    expect(r.years.map((y) => y.year)).toEqual([1, 2]);
  });

  it('validates input', () => {
    expect(calculateSavings({ ...base, months: 0 }).ok).toBe(false);
    expect(calculateSavings({ ...base, initial: d(-1) }).ok).toBe(false);
    expect(calculateSavings({ ...base, annualRate: d(101) }).ok).toBe(false);
  });
});

describe('UnitConverter', () => {
  const c = (v: number | string, cat: Parameters<typeof convert>[1], from: string, to: string) => val(convert(d(v), cat, from, to));

  it('exact definitions', () => {
    expect(c(1, 'length', 'in', 'cm').toString()).toBe('2.54');
    expect(c(1, 'length', 'mi', 'km').toString()).toBe('1.609344');
    expect(c(1, 'mass', 'lb', 'g').toString()).toBe('453.59237');
    expect(c(1, 'volume', 'gal', 'l').toString()).toBe('3.785411784');
    expect(c(1, 'area', 'ac', 'm2').toString()).toBe('4046.8564224');
    expect(c(1, 'data', 'gib', 'mib').toString()).toBe('1024');
    expect(c(1, 'data', 'gb', 'mb').toString()).toBe('1000');
    expect(c(1, 'data', 'b', 'bit').toString()).toBe('8');
    expect(c(1, 'energy', 'kwh', 'kj').toString()).toBe('3600');
    expect(c(1, 'energy', 'kcal', 'kj').toString()).toBe('4.184');
    expect(c(1, 'time', 'd', 'h').toString()).toBe('24');
    expect(c(1, 'time', 'yr', 'd').toString()).toBe('365.2425');
  });

  it('speeds stay exact through fractional factors', () => {
    expect(c(36, 'speed', 'kmh', 'ms').toString()).toBe('10');
    expect(c(3.6, 'speed', 'kmh', 'ms').toString()).toBe('1');
    expect(c(1, 'speed', 'kn', 'kmh').toString()).toBe('1.852');
    expect(c(100, 'speed', 'kmh', 'mph').toFixed(4)).toBe('62.1371');
  });

  it('temperature', () => {
    expect(c(100, 'temperature', 'c', 'f').toString()).toBe('212');
    expect(c(-40, 'temperature', 'f', 'c').toString()).toBe('-40');
    expect(c(0, 'temperature', 'k', 'c').toString()).toBe('-273.15');
    expect(c(98.6, 'temperature', 'f', 'c').toString()).toBe('37');
    expect(convert(d(-300), 'temperature', 'c', 'k').ok).toBe(false);
  });

  it('round-trips every unit pair without drift', () => {
    for (const cat of UNIT_CATEGORIES) {
      for (const a of UNITS[cat]) {
        for (const b of UNITS[cat]) {
          const there = val(convert(d('123.456'), cat, a.id, b.id));
          const back = val(convert(there, cat, b.id, a.id));
          expect(back.toSignificantDigits(30).toString()).toBe('123.456');
        }
      }
    }
  });

  it('refuses negative physical quantities but allows negative temperatures', () => {
    expect(convert(d(-1), 'length', 'm', 'ft').ok).toBe(false);
    expect(convert(d(-10), 'temperature', 'c', 'f').ok).toBe(true);
  });

  it('convertAll lists every unit of the category', () => {
    expect(val(convertAll(d(1), 'length', 'm'))).toHaveLength(UNITS.length.length);
  });
});
