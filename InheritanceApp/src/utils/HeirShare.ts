import { Fraction } from './Fraction';
import { FIQH_DATABASE } from '../constants/FiqhDatabase';

/**
 * HeirShare Class - Represents a single heir's share
 * Matches the HTML version logic 100%
 */
export class HeirShare {
  key: string;
  name: string;
  type: string;
  count: number;
  fraction: Fraction;
  originalFraction: Fraction;
  reason: string;
  blocked: boolean;
  blockedBy: string | null;
  amount: number;
  amountPerPerson: number;
  shares: number;

  constructor(options: {
    key: string;
    name?: string;
    type?: string;
    count?: number;
    fraction?: Fraction | number;
    reason?: string;
    blocked?: boolean;
    blockedBy?: string | null;
  }) {
    this.key = options.key;
    this.name = options.name || FIQH_DATABASE.heirNames[options.key] || options.key;
    this.type = options.type || 'فرض';
    this.count = options.count || 1;
    this.fraction = options.fraction instanceof Fraction ? options.fraction : new Fraction(0);
    this.originalFraction = this.fraction.clone();
    this.reason = options.reason || '';
    this.blocked = options.blocked || false;
    this.blockedBy = options.blockedBy || null;
    this.amount = 0;
    this.amountPerPerson = 0;
    this.shares = 0;
  }

  setFraction(fraction: Fraction | number): void {
    this.fraction = fraction instanceof Fraction ? fraction : new Fraction(fraction);
  }

  addFraction(fraction: Fraction | number): void {
    this.fraction = this.fraction.add(fraction);
  }

  calculateAmount(netEstate: number): void {
    this.amount = netEstate * this.fraction.toDecimal();
    this.amountPerPerson = this.count > 0 ? this.amount / this.count : 0;
  }

  getPerPerson(): Fraction {
    if (this.count <= 0) return new Fraction(0);
    return new Fraction(this.fraction.num, this.fraction.den * this.count);
  }
}
