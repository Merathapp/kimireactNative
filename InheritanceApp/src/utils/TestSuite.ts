import { InheritanceEngine, Estate, Heirs, MadhabType } from './InheritanceEngine';

/**
 * Test Case Interface
 */
export interface TestCase {
  name: string;
  heirs: Heirs;
  expected: Record<string, number>;
  description?: string;
  awl?: boolean;
  radd?: boolean;
  madhab?: MadhabType;
  specialCase?: string;
}

/**
 * Test Result Interface
 */
export interface TestResult {
  name: string;
  category: string;
  madhab: MadhabType;
  passed: boolean;
  error?: string;
  discrepancies?: string[];
}

/**
 * Test Suite Results Interface
 */
export interface TestSuiteResults {
  total: number;
  passed: number;
  failed: number;
  coverage: string;
  results: TestResult[];
}

/**
 * Test Suite Class - Comprehensive Testing System
 * Matches the HTML version logic 100%
 */
export class TestSuite {
  tests: Record<string, TestCase[]>;

  constructor() {
    this.tests = this.loadAllTests();
  }

  loadAllTests(): Record<string, TestCase[]> {
    return {
      // ===== Basic Cases =====
      basic: [
        {
          name: 'زوجة وابن',
          heirs: { wife: 1, son: 1 },
          expected: { wife: 1/8, son: 7/8 }
        },
        {
          name: 'زوج وبنت',
          heirs: { husband: 1, daughter: 1 },
          expected: { husband: 1/4, daughter: 1/2 }
        },
        {
          name: 'زوج وابن وبنت',
          heirs: { husband: 1, son: 1, daughter: 1 },
          expected: { 
            husband: 1/4, 
            son: 7/12,
            daughter: 7/24
          }
        },
        {
          name: 'أب وأم وابن',
          heirs: { father: 1, mother: 1, son: 1 },
          expected: { 
            father: 1/6, 
            mother: 1/6, 
            son: 2/3
          }
        },
        {
          name: 'زوجة وأب وأم وابن',
          heirs: { wife: 1, father: 1, mother: 1, son: 1 },
          expected: { 
            wife: 1/8, 
            father: 1/6, 
            mother: 1/6, 
            son: 13/24
          }
        },
        {
          name: 'أب وأم فقط',
          heirs: { father: 1, mother: 1 },
          expected: { father: 2/3, mother: 1/3 }
        },
        {
          name: 'ابن وبنتان',
          heirs: { son: 1, daughter: 2 },
          expected: { 
            son: 1/2, 
            daughter: 1/2 
          }
        }
      ],

      // ===== Al-Umariyyah =====
      umariyyah: [
        {
          name: 'العُمَريَّة الأولى: زوج + أب + أم',
          heirs: { husband: 1, father: 1, mother: 1 },
          expected: { husband: 1/2, mother: 1/6, father: 1/3 },
          description: 'الأم تأخذ ثلث الباقي = 1/6'
        },
        {
          name: 'العُمَريَّة الثانية: زوجة + أب + أم',
          heirs: { wife: 1, father: 1, mother: 1 },
          expected: { wife: 1/4, mother: 1/4, father: 1/2 },
          description: 'الأم تأخذ ثلث الباقي = 1/4'
        }
      ],

      // ===== Al-Awl =====
      awl: [
        {
          name: 'زوج + أختان شقيقتان + أم (عول من 6 إلى 8)',
          heirs: { husband: 1, full_sister: 2, mother: 1 },
          expected: { husband: 3/8, full_sister: 4/8, mother: 1/8 },
          awl: true
        },
        {
          name: 'زوج + أم + أختان لأم + أختان شقيقتان (عول من 6 إلى 10)',
          heirs: { husband: 1, mother: 1, maternal_brother: 2, full_sister: 2 },
          expected: { 
            husband: 3/10, 
            mother: 1/10, 
            maternal_brother: 2/10, 
            full_sister: 4/10 
          },
          awl: true
        }
      ],

      // ===== Al-Radd =====
      radd: [
        {
          name: 'أم + بنت (رد)',
          heirs: { mother: 1, daughter: 1 },
          expected: { mother: 1/5, daughter: 4/5 },
          radd: true
        },
        {
          name: 'بنتان فقط (رد)',
          heirs: { daughter: 2 },
          expected: { daughter: 1 },
          radd: true
        }
      ],

      // ===== Hijab =====
      hijab: [
        {
          name: 'ابن يحجب الإخوة',
          heirs: { son: 1, full_brother: 2, full_sister: 1 },
          expected: { son: 1 }
        },
        {
          name: 'أب يحجب الجد',
          heirs: { father: 1, grandfather: 1, son: 1 },
          expected: { father: 1/6, son: 5/6 }
        },
        {
          name: 'أم تحجب الجدات',
          heirs: { mother: 1, grandmother_mother: 1, grandmother_father: 1, son: 1 },
          expected: { mother: 1/6, son: 5/6 }
        },
        {
          name: 'بنتان تحجبان بنت الابن (بدون ابن ابن)',
          heirs: { daughter: 2, granddaughter: 1 },
          expected: { daughter: 1 }
        },
        {
          name: 'بنت + بنت ابن (السدس تكملة)',
          heirs: { daughter: 1, granddaughter: 1 },
          expected: { daughter: 1/2, granddaughter: 1/6 }
        }
      ],

      // ===== Asaba with Ghayr =====
      asabaWithGhayr: [
        {
          name: 'بنت + أخت شقيقة (عصبة مع الغير)',
          heirs: { daughter: 1, full_sister: 1 },
          expected: { daughter: 1/2, full_sister: 1/2 }
        },
        {
          name: 'بنتان + أخت شقيقة',
          heirs: { daughter: 2, full_sister: 1 },
          expected: { daughter: 2/3, full_sister: 1/3 }
        },
        {
          name: 'بنت ابن + أخت لأب (عصبة مع الغير)',
          heirs: { granddaughter: 1, paternal_sister: 1 },
          expected: { granddaughter: 1/2, paternal_sister: 1/2 }
        }
      ],

      // ===== Al-Musharraka =====
      musharraka: [
        {
          name: 'المشتركة: زوج + أم + أخوين لأم + أخ شقيق',
          heirs: { husband: 1, mother: 1, maternal_brother: 2, full_brother: 1 },
          expected: { 
            husband: 1/2, 
            mother: 1/6, 
            maternal_brother: 1/6, 
            full_brother: 1/6 
          },
          madhab: 'shafii',
          specialCase: 'musharraka'
        }
      ],

      // ===== Al-Akdariyyah =====
      akdariyya: [
        {
          name: 'الأكدرية: زوج + أم + جد + أخت شقيقة',
          heirs: { husband: 1, mother: 1, grandfather: 1, full_sister: 1 },
          expected: { 
            husband: 9/27, 
            mother: 6/27, 
            grandfather: 8/27, 
            full_sister: 4/27 
          },
          specialCase: 'akdariyya'
        }
      ],

      // ===== Grandfather with Siblings =====
      grandfatherWithSiblings: [
        {
          name: 'جد + أخ شقيق (الشافعي - الجد يحجب)',
          heirs: { grandfather: 1, full_brother: 1 },
          madhab: 'shafii',
          expected: { grandfather: 1 }
        },
        {
          name: 'جد + أخ شقيق (المالكي - المقاسمة)',
          heirs: { grandfather: 1, full_brother: 1 },
          madhab: 'maliki',
          expected: { grandfather: 1/2, full_brother: 1/2 }
        }
      ],

      // ===== Complex Cases =====
      complex: [
        {
          name: 'زوجة + أبناء + بنات + أب + أم',
          heirs: { wife: 1, son: 2, daughter: 2, father: 1, mother: 1 },
          expected: { 
            wife: 1/8, 
            father: 1/6, 
            mother: 1/6,
            son: 13/36,
            daughter: 13/72
          }
        },
        {
          name: 'زوج + بنت + بنت ابن + أم',
          heirs: { husband: 1, daughter: 1, granddaughter: 1, mother: 1 },
          expected: { 
            husband: 3/12, 
            daughter: 6/12, 
            granddaughter: 2/12, 
            mother: 1/12 
          },
          awl: true
        }
      ]
    };
  }

  async runAllTests(madhab: MadhabType = 'shafii'): Promise<TestSuiteResults> {
    const results: TestResult[] = [];
    let passed = 0, failed = 0;

    for (const [category, tests] of Object.entries(this.tests)) {
      for (const test of tests) {
        const testMadhab = test.madhab || madhab;
        const result = await this.runSingleTest(test, category, testMadhab);
        results.push(result);
        result.passed ? passed++ : failed++;
      }
    }

    return {
      total: passed + failed,
      passed,
      failed,
      coverage: ((passed / (passed + failed)) * 100).toFixed(1),
      results
    };
  }

  async runSingleTest(test: TestCase, category: string, madhab: MadhabType): Promise<TestResult> {
    try {
      const estate: Estate = { total: 120000, funeral: 0, debts: 0, will: 0 };
      const engine = new InheritanceEngine(madhab, estate, test.heirs);
      const result = engine.calculate();

      if (!result.success) {
        return {
          name: test.name,
          category,
          madhab,
          passed: false,
          error: result.errors?.join(', ') || 'فشل الحساب'
        };
      }

      // Check special cases
      if (test.awl && !result.awlApplied) {
        return {
          name: test.name,
          category,
          madhab,
          passed: false,
          error: 'كان يجب تطبيق العول'
        };
      }

      if (test.radd && !result.raddApplied) {
        return {
          name: test.name,
          category,
          madhab,
          passed: false,
          error: 'كان يجب تطبيق الرد'
        };
      }

      // Verify expected results
      let allPassed = true;
      const discrepancies: string[] = [];

      for (const [heirKey, expectedShare] of Object.entries(test.expected)) {
        const actualHeir = result.shares?.find(s =>
          s.key === heirKey ||
          s.key === heirKey + 's' ||
          s.key.includes(heirKey)
        );

        if (!actualHeir && expectedShare > 0.001) {
          allPassed = false;
          discrepancies.push(`${heirKey}: غير موجود (متوقع: ${(expectedShare * 100).toFixed(1)}%)`);
          continue;
        }

        if (actualHeir && expectedShare > 0) {
          const actualShare = actualHeir.fraction.toDecimal();
          const diff = Math.abs(actualShare - expectedShare);

          // 0.5% margin of error
          if (diff > 0.005) {
            allPassed = false;
            discrepancies.push(
              `${heirKey}: ${(actualShare * 100).toFixed(2)}% (متوقع: ${(expectedShare * 100).toFixed(2)}%)`
            );
          }
        }
      }

      return {
        name: test.name,
        category,
        madhab,
        passed: allPassed || Object.keys(test.expected).length === 0,
        discrepancies: discrepancies.length > 0 ? discrepancies : undefined
      };

    } catch (error: any) {
      return {
        name: test.name,
        category,
        madhab,
        passed: false,
        error: error.message
      };
    }
  }

  async runCategoryTests(category: string, madhab: MadhabType = 'shafii'): Promise<TestSuiteResults> {
    const tests = this.tests[category];
    if (!tests) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        coverage: '0.0',
        results: []
      };
    }

    const results: TestResult[] = [];
    let passed = 0, failed = 0;

    for (const test of tests) {
      const testMadhab = test.madhab || madhab;
      const result = await this.runSingleTest(test, category, testMadhab);
      results.push(result);
      result.passed ? passed++ : failed++;
    }

    return {
      total: passed + failed,
      passed,
      failed,
      coverage: ((passed / (passed + failed)) * 100).toFixed(1),
      results
    };
  }
}

// Export singleton instance
export const testSuite = new TestSuite();
