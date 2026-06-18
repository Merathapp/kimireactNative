import { Fraction } from '../utils/Fraction';

describe('Fraction', () => {
  test('creates fraction with numerator and denominator', () => {
    const f = new Fraction(1, 2);
    expect(f.num).toBe(1);
    expect(f.den).toBe(2);
  });

  test('reduces to lowest terms', () => {
    const f = new Fraction(2, 4);
    expect(f.num).toBe(1);
    expect(f.den).toBe(2);
  });

  test('handles zero', () => {
    const f = new Fraction(0, 5);
    expect(f.isZero()).toBe(true);
    expect(f.num).toBe(0);
    expect(f.den).toBe(1);
  });

  test('gcd', () => {
    expect(Fraction.gcd(12, 8)).toBe(4);
    expect(Fraction.gcd(7, 13)).toBe(1);
    expect(Fraction.gcd(0, 5)).toBe(5);
  });

  test('lcm', () => {
    expect(Fraction.lcm(2, 3)).toBe(6);
    expect(Fraction.lcm(4, 6)).toBe(12);
  });

  test('add fractions', () => {
    const a = new Fraction(1, 4);
    const b = new Fraction(1, 4);
    const sum = a.add(b);
    expect(sum.num).toBe(1);
    expect(sum.den).toBe(2);
  });

  test('add fraction and number', () => {
    const f = new Fraction(1, 2);
    const sum = f.add(1);
    expect(sum.toDecimal()).toBe(1.5);
  });

  test('subtract fractions', () => {
    const a = new Fraction(3, 4);
    const b = new Fraction(1, 4);
    const diff = a.subtract(b);
    expect(diff.num).toBe(1);
    expect(diff.den).toBe(2);
  });

  test('multiply fractions', () => {
    const a = new Fraction(1, 2);
    const b = new Fraction(2, 3);
    const product = a.multiply(b);
    expect(product.num).toBe(1);
    expect(product.den).toBe(3);
  });

  test('divide fractions', () => {
    const a = new Fraction(1, 2);
    const b = new Fraction(1, 4);
    const quotient = a.divide(b);
    expect(quotient.num).toBe(2);
    expect(quotient.den).toBe(1);
  });

  test('toDecimal', () => {
    const f = new Fraction(1, 4);
    expect(f.toDecimal()).toBe(0.25);
  });

  test('toString', () => {
    expect(new Fraction(1, 2).toString()).toBe('1/2');
    expect(new Fraction(0, 5).toString()).toBe('0');
    expect(new Fraction(3, 1).toString()).toBe('3');
  });

  test('toDisplay formatting', () => {
    expect(new Fraction(1, 2).toDisplay()).toBe('1/2');
    expect(new Fraction(0, 5).toDisplay()).toBe('0');
    expect(new Fraction(3, 1).toDisplay()).toBe('3');
  });

  test('equals', () => {
    expect(new Fraction(1, 2).equals(new Fraction(2, 4))).toBe(true);
    expect(new Fraction(1, 3).equals(new Fraction(1, 2))).toBe(false);
  });

  test('fromDecimal', () => {
    const f = Fraction.fromDecimal(0.5);
    expect(f.num).toBe(1);
    expect(f.den).toBe(2);
  });

  test('compareTo', () => {
    expect(new Fraction(1, 2).compareTo(new Fraction(1, 4))).toBeGreaterThan(0);
    expect(new Fraction(1, 4).compareTo(new Fraction(1, 2))).toBeLessThan(0);
    expect(new Fraction(1, 2).compareTo(new Fraction(1, 2))).toBe(0);
  });

  test('clone', () => {
    const a = new Fraction(1, 3);
    const b = a.clone();
    expect(b.num).toBe(1);
    expect(b.den).toBe(3);
    expect(b).not.toBe(a);
  });
});
