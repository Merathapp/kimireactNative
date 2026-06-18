import { InheritanceEngine, Estate, Heirs } from '../utils/InheritanceEngine';
import { MadhabType } from '../constants/FiqhDatabase';

function runEngine(madhab: MadhabType, heirs: Heirs): any {
  const estate: Estate = { total: 120000, funeral: 0, debts: 0, will: 0 };
  const engine = new InheritanceEngine(madhab, estate, heirs);
  return engine.calculate();
}

function getShare(result: any, key: string): number {
  const share = result.shares?.find((s: any) => s.key === key);
  return share ? share.fraction.toDecimal() : 0;
}

function expectShare(result: any, key: string, expected: number) {
  const actual = getShare(result, key);
  expect(Math.abs(actual - expected)).toBeLessThan(0.001);
}

describe('InheritanceEngine', () => {
  describe('Basic Cases', () => {
    test('زوجة وابن', () => {
      const r = runEngine('shafii', { wife: 1, son: 1 });
      expect(r.success).toBe(true);
      expectShare(r, 'wife', 1/8);
      expectShare(r, 'son', 7/8);
    });

    test('زوج وبنت', () => {
      const r = runEngine('shafii', { husband: 1, daughter: 1 });
      expect(r.success).toBe(true);
      expect(r.raddApplied).toBe(true);
      expectShare(r, 'husband', 1/4);
      expectShare(r, 'daughter', 3/4);
    });

    test('زوج وابن وبنت', () => {
      const r = runEngine('shafii', { husband: 1, son: 1, daughter: 1 });
      expectShare(r, 'husband', 1/4);
      expectShare(r, 'son', 1/2);
      expectShare(r, 'daughter', 1/4);
    });

    test('أب وأم وابن', () => {
      const r = runEngine('shafii', { father: 1, mother: 1, son: 1 });
      expectShare(r, 'father', 1/6);
      expectShare(r, 'mother', 1/6);
      expectShare(r, 'son', 2/3);
    });

    test('أب وأم فقط', () => {
      const r = runEngine('shafii', { father: 1, mother: 1 });
      expectShare(r, 'father', 2/3);
      expectShare(r, 'mother', 1/3);
    });

    test('ابن وبنتان', () => {
      const r = runEngine('shafii', { son: 1, daughter: 2 });
      expectShare(r, 'son', 1/2);
      expectShare(r, 'daughter', 1/2);
    });
  });

  describe('Al-Umariyyah', () => {
    test('العُمَريَّة الأولى: زوج + أب + أم', () => {
      const r = runEngine('shafii', { husband: 1, father: 1, mother: 1 });
      expectShare(r, 'husband', 1/2);
      expectShare(r, 'mother', 1/6);
      expectShare(r, 'father', 1/3);
    });

    test('العُمَريَّة الثانية: زوجة + أب + أم', () => {
      const r = runEngine('shafii', { wife: 1, father: 1, mother: 1 });
      expectShare(r, 'wife', 1/4);
      expectShare(r, 'mother', 1/4);
      expectShare(r, 'father', 1/2);
    });
  });

  describe('Al-Awl', () => {
    test('زوج + أختان شقيقتان + أم (عول)', () => {
      const r = runEngine('shafii', { husband: 1, full_sister: 2, mother: 1 });
      expect(r.awlApplied).toBe(true);
      expectShare(r, 'husband', 3/8);
      expectShare(r, 'full_sister', 4/8);
      expectShare(r, 'mother', 1/8);
    });
  });

  describe('Al-Radd', () => {
    test('أم + بنت (رد)', () => {
      const r = runEngine('shafii', { mother: 1, daughter: 1 });
      expect(r.raddApplied).toBe(true);
      expectShare(r, 'mother', 1/4);
      expectShare(r, 'daughter', 3/4);
    });

    test('بنتان فقط (رد)', () => {
      const r = runEngine('shafii', { daughter: 2 });
      expect(r.raddApplied).toBe(true);
      expectShare(r, 'daughter', 1);
    });

    test('أم + أب فقط (رد)', () => {
      const r = runEngine('shafii', { mother: 1, father: 1 });
      expectShare(r, 'father', 2/3);
      expectShare(r, 'mother', 1/3);
    });
  });

  describe('Hijab', () => {
    test('ابن يحجب الإخوة', () => {
      const r = runEngine('shafii', { son: 1, full_brother: 2, full_sister: 1 });
      expectShare(r, 'son', 1);
      expect(r.shares!.length).toBe(1);
    });

    test('أب يحجب الجد', () => {
      const r = runEngine('shafii', { father: 1, grandfather: 1, son: 1 });
      expectShare(r, 'father', 1/6);
      expectShare(r, 'son', 5/6);
    });

    test('أم تحجب الجدات', () => {
      const r = runEngine('shafii', { mother: 1, grandmother_mother: 1, grandmother_father: 1, son: 1 });
      expectShare(r, 'mother', 1/6);
      expectShare(r, 'son', 5/6);
    });

    test('بنت + بنت ابن (السدس تكملة + رد)', () => {
      const r = runEngine('shafii', { daughter: 1, granddaughter: 1 });
      expect(r.raddApplied).toBe(true);
      expectShare(r, 'daughter', 3/4);
      expectShare(r, 'granddaughter', 1/4);
    });
  });

  describe('Asaba with Ghayr', () => {
    test('بنت + أخت شقيقة (عصبة مع الغير)', () => {
      const r = runEngine('shafii', { daughter: 1, full_sister: 1 });
      expectShare(r, 'daughter', 1/2);
      expectShare(r, 'full_sister', 1/2);
    });

    test('بنتان + أخت شقيقة', () => {
      const r = runEngine('shafii', { daughter: 2, full_sister: 1 });
      expectShare(r, 'daughter', 2/3);
      expectShare(r, 'full_sister', 1/3);
    });
  });

  describe('Al-Musharraka', () => {
    test('المشتركة: زوج + أم + أخوين لأم + أخ شقيق', () => {
      const r = runEngine('shafii', { husband: 1, mother: 1, maternal_brother: 2, full_brother: 1 });
      expectShare(r, 'husband', 1/2);
      expectShare(r, 'mother', 1/6);
      const siblingShare = getShare(r, 'shared_siblings');
      expect(Math.abs(siblingShare - 1/3)).toBeLessThan(0.001);
    });
  });

  describe('Al-Akdariyyah', () => {
    test('الأكدرية: زوج + أم + جد + أخت شقيقة (الشافعي - الجد يحجب)', () => {
      const r = runEngine('shafii', { husband: 1, mother: 1, grandfather: 1, full_sister: 1 });
      expectShare(r, 'husband', 1/2);
      expectShare(r, 'mother', 1/3);
      expectShare(r, 'grandfather', 1/6);
    });

    test('الأكدرية: زوج + أم + جد + أخت شقيقة (المالكي - المقاسمة)', () => {
      const r = runEngine('maliki', { husband: 1, mother: 1, grandfather: 1, full_sister: 1 });
      expectShare(r, 'husband', 9/27);
      expectShare(r, 'mother', 6/27);
      expectShare(r, 'grandfather', 8/27);
      expectShare(r, 'full_sister', 4/27);
    });
  });

  describe('Grandfather with Siblings', () => {
    test('جد + أخ شقيق (الشافعي - الجد يحجب)', () => {
      const r = runEngine('shafii', { grandfather: 1, full_brother: 1 });
      expectShare(r, 'grandfather', 1);
    });

    test('جد + أخ شقيق (المالكي - المقاسمة)', () => {
      const r = runEngine('maliki', { grandfather: 1, full_brother: 1 });
      expectShare(r, 'grandfather', 1/2);
      expectShare(r, 'full_brother', 1/2);
    });

    test('جد + 4 إخوة (المالكي - ثلث)', () => {
      const r = runEngine('maliki', { grandfather: 1, full_brother: 4 });
      expectShare(r, 'grandfather', 1/3);
      expectShare(r, 'full_brother', 2/3);
    });
  });

  describe('Blood Relatives', () => {
    test('خال فقط (الشافعي)', () => {
      const r = runEngine('shafii', { maternal_uncle: 1 });
      expect(r.success).toBe(true);
      expectShare(r, 'maternal_uncle', 1);
    });

    test('خال فقط (المالكي - لبيت المال)', () => {
      const r = runEngine('maliki', { maternal_uncle: 1 });
      expect(r.success).toBe(true);
      expectShare(r, 'treasury', 1);
    });
  });

  describe('Complex Cases', () => {
    test('زوجة + أبناء + بنات + أب + أم', () => {
      const r = runEngine('shafii', { wife: 1, son: 2, daughter: 2, father: 1, mother: 1 });
      expectShare(r, 'wife', 1/8);
      expectShare(r, 'father', 1/6);
      expectShare(r, 'mother', 1/6);
    });

    test('زوج + بنت + بنت ابن + أم (عول)', () => {
      const r = runEngine('shafii', { husband: 1, daughter: 1, granddaughter: 1, mother: 1 });
      expect(r.awlApplied).toBe(true);
      expectShare(r, 'husband', 3/13);
      expectShare(r, 'daughter', 6/13);
      expectShare(r, 'granddaughter', 2/13);
      expectShare(r, 'mother', 2/13);
    });
  });
});
