/**
 * Fraction Class - Enhanced Fraction Arithmetic System
 * Matches the HTML version logic 100%
 */
export class Fraction {
  num: number;
  den: number;

  constructor(numerator: number, denominator: number = 1) {
    if (typeof numerator !== 'number' || typeof denominator !== 'number') {
      throw new Error('البسط والمقام يجب أن يكونا أرقاماً');
    }
    if (denominator === 0) {
      throw new Error('المقام لا يمكن أن يكون صفراً');
    }
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
      throw new Error('القيم يجب أن تكون أرقاماً منتهية');
    }

    // Normalization: ensure denominator is always positive
    const sign = denominator < 0 ? -1 : 1;
    numerator = Math.round(numerator * sign);
    denominator = Math.abs(Math.round(denominator));

    const g = Fraction.gcd(Math.abs(numerator), denominator);
    this.num = numerator / g;
    this.den = denominator / g;

    // Protection against overflow
    if (Math.abs(this.num) > 1e12 || this.den > 1e12) {
      const decimal = this.num / this.den;
      this.num = Math.round(decimal * 1e9);
      this.den = 1e9;
      const g2 = Fraction.gcd(Math.abs(this.num), this.den);
      this.num /= g2;
      this.den /= g2;
    }
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b > 0) {
      [a, b] = [b, a % b];
    }
    return a || 1;
  }

  static lcm(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    if (a === 0 || b === 0) return 0;
    return (a * b) / Fraction.gcd(a, b);
  }

  static lcmArray(arr: number[]): number {
    if (!arr || arr.length === 0) return 1;
    const filtered = arr.filter(n => n > 0);
    if (filtered.length === 0) return 1;
    return filtered.reduce((a, b) => Fraction.lcm(a, b), filtered[0]);
  }

  static fromDecimal(decimal: number, maxDenominator: number = 10000): Fraction {
    if (decimal === 0) return new Fraction(0);

    const sign = decimal < 0 ? -1 : 1;
    decimal = Math.abs(decimal);

    let bestNum = 1, bestDen = 1;
    let minError = Math.abs(decimal - 1);

    for (let den = 1; den <= maxDenominator; den++) {
      const num = Math.round(decimal * den);
      const error = Math.abs(decimal - num / den);
      if (error < minError) {
        minError = error;
        bestNum = num;
        bestDen = den;
        if (error < 1e-10) break;
      }
    }

    return new Fraction(sign * bestNum, bestDen);
  }

  add(other: Fraction | number): Fraction {
    if (!(other instanceof Fraction)) other = new Fraction(other);
    return new Fraction(
      this.num * other.den + other.num * this.den,
      this.den * other.den
    );
  }

  subtract(other: Fraction | number): Fraction {
    if (!(other instanceof Fraction)) other = new Fraction(other);
    return new Fraction(
      this.num * other.den - other.num * this.den,
      this.den * other.den
    );
  }

  multiply(other: Fraction | number): Fraction {
    if (!(other instanceof Fraction)) other = new Fraction(other);
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  divide(other: Fraction | number): Fraction {
    if (!(other instanceof Fraction)) other = new Fraction(other);
    if (other.num === 0) throw new Error('القسمة على صفر');
    return new Fraction(this.num * other.den, this.den * other.num);
  }

  toDecimal(): number {
    return this.num / this.den;
  }

  toString(): string {
    if (this.num === 0) return '0';
    if (this.den === 1) return String(this.num);
    return `${this.num}/${this.den}`;
  }

  toArabic(): string {
    const toArabicNum = (n: number) => String(Math.abs(n)).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

    if (this.num === 0) return '٠';
    const sign = this.num < 0 ? '-' : '';
    if (this.den === 1) return sign + toArabicNum(this.num);

    // Common fractions in inheritance
    const common: Record<string, string> = {
      '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
      '1/6': '⅙', '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞',
      '1/12': '¹⁄₁₂', '5/12': '⁵⁄₁₂', '7/12': '⁷⁄₁₂', '11/12': '¹¹⁄₁₂'
    };

    const key = `${Math.abs(this.num)}/${this.den}`;
    if (common[key]) return sign + common[key];

    return sign + toArabicNum(Math.abs(this.num)) + '/' + toArabicNum(this.den);
  }

  isZero(): boolean { return this.num === 0; }
  isPositive(): boolean { return this.num > 0; }
  isNegative(): boolean { return this.num < 0; }

  equals(other: Fraction | number): boolean {
    if (!(other instanceof Fraction)) other = new Fraction(other);
    return this.num === other.num && this.den === other.den;
  }

  compareTo(other: Fraction | number): number {
    if (!(other instanceof Fraction)) other = new Fraction(other);
    return this.num * other.den - other.num * this.den;
  }

  lessThan(other: Fraction | number): boolean { return this.compareTo(other) < 0; }
  greaterThan(other: Fraction | number): boolean { return this.compareTo(other) > 0; }
  lessThanOrEqual(other: Fraction | number): boolean { return this.compareTo(other) <= 0; }
  greaterThanOrEqual(other: Fraction | number): boolean { return this.compareTo(other) >= 0; }

  clone(): Fraction { return new Fraction(this.num, this.den); }

  static ZERO = new Fraction(0);
  static ONE = new Fraction(1);
  static HALF = new Fraction(1, 2);
  static THIRD = new Fraction(1, 3);
  static QUARTER = new Fraction(1, 4);
  static SIXTH = new Fraction(1, 6);
  static EIGHTH = new Fraction(1, 8);
  static TWO_THIRDS = new Fraction(2, 3);
}
