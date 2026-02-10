import { Fraction } from './Fraction';
import { HeirShare } from './HeirShare';
import { FIQH_DATABASE, MadhabType, getMadhabConfig } from '../constants/FiqhDatabase';

/**
 * Estate Interface
 */
export interface Estate {
  total: number;
  funeral: number;
  debts: number;
  will: number;
}

/**
 * Heirs Interface
 */
export interface Heirs {
  [key: string]: number;
}

/**
 * Blocked Heir Interface
 */
export interface BlockedHeir {
  heir: string;
  by: string;
  reason: string;
}

/**
 * Special Case Interface
 */
export interface SpecialCase {
  type: string;
  name: string;
  description: string;
}

/**
 * Calculation Step Interface
 */
export interface CalculationStep {
  title: string;
  description: string;
  details?: any;
  timestamp: number;
}

/**
 * Calculation Result Interface
 */
export interface CalculationResult {
  success: boolean;
  errors?: string[];
  madhab: MadhabType;
  madhhabName: string;
  madhhabIcon?: string;
  estate?: Estate;
  netEstate?: number;
  asl?: number;
  finalBase?: number;
  awlApplied?: boolean;
  awlRatio?: Fraction | null;
  raddApplied?: boolean;
  bloodRelativesApplied?: boolean;
  shares?: HeirShare[];
  specialCases?: SpecialCase[];
  blockedHeirs?: BlockedHeir[];
  madhhabNotes?: string[];
  warnings?: string[];
  steps?: CalculationStep[];
  confidence?: number;
}

/**
 * InheritanceEngine Class - Main Calculation Engine
 * Matches the HTML version logic 100%
 */
export class InheritanceEngine {
  madhab: MadhabType;
  config: ReturnType<typeof getMadhabConfig>;
  estate: Estate;
  heirs: Heirs;
  state: {
    steps: CalculationStep[];
    specialCases: SpecialCase[];
    blockedHeirs: BlockedHeir[];
    madhhabNotes: string[];
    warnings: string[];
    errors: string[];
  };
  results: {
    netEstate: number;
    shares: HeirShare[];
    asl: number;
    finalBase: number;
    awlRatio: Fraction | null;
    awlApplied: boolean;
    raddApplied: boolean;
    bloodRelativesApplied: boolean;
    confidence: number;
  };

  constructor(madhab: MadhabType, estate: Estate, heirs: Heirs) {
    this.madhab = madhab;
    this.config = getMadhabConfig(madhab);

    if (!this.config) {
      throw new Error(`المذهب غير معروف: ${madhab}`);
    }

    this.estate = this.validateEstate(estate);
    this.heirs = this.normalizeHeirs(heirs);

    this.state = {
      steps: [],
      specialCases: [],
      blockedHeirs: [],
      madhhabNotes: [],
      warnings: [],
      errors: []
    };

    this.results = {
      netEstate: 0,
      shares: [],
      asl: 1,
      finalBase: 1,
      awlRatio: null,
      awlApplied: false,
      raddApplied: false,
      bloodRelativesApplied: false,
      confidence: 1.0
    };
  }

  // ========== Estate Validation ==========
  validateEstate(estate: Estate): Estate {
    const total = Math.max(0, parseFloat(String(estate.total)) || 0);

    if (total <= 0) {
      this.state.errors.push('قيمة التركة يجب أن تكون أكبر من صفر');
    }

    const funeral = Math.max(0, Math.min(parseFloat(String(estate.funeral)) || 0, total));
    const debts = Math.max(0, Math.min(parseFloat(String(estate.debts)) || 0, total - funeral));
    const remaining = total - funeral - debts;
    const maxWill = remaining / 3;
    let will = Math.max(0, parseFloat(String(estate.will)) || 0);

    if (will > maxWill && remaining > 0) {
      this.state.warnings.push(
        `الوصية (${will.toLocaleString()}) تتجاوز الثلث. تم تعديلها إلى ${maxWill.toLocaleString()}`
      );
      will = maxWill;
    }

    return { total, funeral, debts, will };
  }

  // ========== Normalize Heirs ==========
  normalizeHeirs(heirs: Heirs): Heirs {
    const normalized: Heirs = {};

    for (const [key, value] of Object.entries(heirs)) {
      let val = Math.max(0, Math.floor(parseInt(String(value)) || 0));

      if (FIQH_DATABASE.heirConstraints[key]?.max) {
        val = Math.min(val, FIQH_DATABASE.heirConstraints[key].max);
      }

      normalized[key] = val;
    }

    // Check conflicts
    if (normalized.husband > 0 && normalized.wife > 0) {
      this.state.errors.push('لا يمكن وجود زوج وزوجة معاً للميت الواحد');
      normalized.wife = 0;
    }

    return normalized;
  }

  // ========== Add Step ==========
  addStep(title: string, description: string, details: any = null): void {
    this.state.steps.push({
      title,
      description,
      details,
      timestamp: Date.now()
    });
  }

  // ========== Existence Checks ==========
  hasDescendants(): boolean {
    const h = this.heirs;
    return (h.son || 0) + (h.daughter || 0) + (h.grandson || 0) + (h.granddaughter || 0) > 0;
  }

  hasMaleDescendants(): boolean {
    return (this.heirs.son || 0) + (this.heirs.grandson || 0) > 0;
  }

  hasFemaleDescendants(): boolean {
    return (this.heirs.daughter || 0) + (this.heirs.granddaughter || 0) > 0;
  }

  hasChildren(): boolean {
    return (this.heirs.son || 0) + (this.heirs.daughter || 0) > 0;
  }

  hasSons(): boolean {
    return (this.heirs.son || 0) > 0;
  }

  getFullSiblingsCount(): number {
    return (this.heirs.full_brother || 0) + (this.heirs.full_sister || 0);
  }

  getPaternalSiblingsCount(): number {
    return (this.heirs.paternal_brother || 0) + (this.heirs.paternal_sister || 0);
  }

  getMaternalSiblingsCount(): number {
    return (this.heirs.maternal_brother || 0) + (this.heirs.maternal_sister || 0);
  }

  getAllSiblingsCount(): number {
    return this.getFullSiblingsCount() + this.getPaternalSiblingsCount() + this.getMaternalSiblingsCount();
  }

  getFullAndPaternalSiblingsCount(): number {
    return this.getFullSiblingsCount() + this.getPaternalSiblingsCount();
  }

  hasMaleAscendant(): boolean {
    return (this.heirs.father || 0) > 0 || (this.heirs.grandfather || 0) > 0;
  }

  hasSpouse(): boolean {
    return (this.heirs.husband || 0) > 0 || (this.heirs.wife || 0) > 0;
  }

  // ========== Special Cases ==========

  // Al-Umariyyah: Husband/Wife + Father + Mother only
  isUmariyyah(): boolean {
    const h = this.heirs;
    const hasSpouse = (h.husband || 0) > 0 || (h.wife || 0) > 0;
    const hasFatherMother = (h.father || 0) > 0 && (h.mother || 0) > 0;
    const noDescendants = !this.hasDescendants();
    const noSiblings = this.getAllSiblingsCount() === 0;
    const noGrandfather = (h.grandfather || 0) === 0;

    return hasSpouse && hasFatherMother && noDescendants && noSiblings && noGrandfather;
  }

  // Al-Musharraka (Al-Hamariyyah): Husband + Mother/Grandmother + Maternal Siblings (2+) + Full Siblings
  isMusharraka(): boolean {
    if (!this.config.rules.musharrakaEnabled) return false;

    const h = this.heirs;
    const hasHusband = (h.husband || 0) > 0;
    const hasMotherOrGrandmother = (h.mother || 0) > 0 || (h.grandmother_mother || 0) > 0;
    const maternalSiblings = this.getMaternalSiblingsCount();
    const hasFullSiblings = this.getFullSiblingsCount() > 0;
    const noDescendants = !this.hasDescendants();
    const noFatherOrGrandfather = (h.father || 0) === 0 && (h.grandfather || 0) === 0;

    return hasHusband && hasMotherOrGrandmother && maternalSiblings >= 2 &&
           hasFullSiblings && noDescendants && noFatherOrGrandfather;
  }

  // Al-Akdariyyah: Husband + Mother + Grandfather + Full Sister (no descendants or father)
  isAkdariyya(): boolean {
    const h = this.heirs;
    return (h.husband || 0) > 0 &&
           (h.mother || 0) > 0 &&
           (h.grandfather || 0) > 0 &&
           (h.full_sister || 0) > 0 &&
           !this.hasDescendants() &&
           (h.father || 0) === 0 &&
           (h.full_brother || 0) === 0;
  }

  // ========== Apply Hijab (Blocking) ==========
  applyHijab(): void {
    this.addStep('تطبيق الحجب', 'فحص قواعد الحجب الفقهية');
    const blocked: BlockedHeir[] = [];
    const h = this.heirs;
    const rules = this.config.rules;

    // 1. Father blocks Grandfather
    if (h.father > 0 && h.grandfather > 0) {
      blocked.push({
        heir: 'grandfather',
        by: 'father',
        reason: 'الجد محجوب بالأب حجب حرمان'
      });
      h.grandfather = 0;
    }

    // 2. Mother blocks Grandmothers
    if (h.mother > 0) {
      if (h.grandmother_mother > 0) {
        blocked.push({
          heir: 'grandmother_mother',
          by: 'mother',
          reason: 'الجدة لأم محجوبة بالأم'
        });
        h.grandmother_mother = 0;
      }
      if (h.grandmother_father > 0) {
        blocked.push({
          heir: 'grandmother_father',
          by: 'mother',
          reason: 'الجدة لأب محجوبة بالأم'
        });
        h.grandmother_father = 0;
      }
    }

    // 3. Father blocks Grandmother (father's side)
    if (h.father > 0 && h.grandmother_father > 0) {
      blocked.push({
        heir: 'grandmother_father',
        by: 'father',
        reason: 'الجدة لأب محجوبة بالأب'
      });
      h.grandmother_father = 0;
    }

    // 4. Son blocks Grandson and Granddaughter
    if (h.son > 0) {
      if (h.grandson > 0) {
        blocked.push({
          heir: 'grandson',
          by: 'son',
          reason: 'ابن الابن محجوب بالابن الأقرب'
        });
        h.grandson = 0;
      }
      if (h.granddaughter > 0) {
        blocked.push({
          heir: 'granddaughter',
          by: 'son',
          reason: 'بنت الابن محجوبة بالابن'
        });
        h.granddaughter = 0;
      }
    }

    // 5. Granddaughter blocked by two or more daughters (without grandson)
    if (h.daughter >= 2 && h.granddaughter > 0 && (h.grandson || 0) === 0) {
      blocked.push({
        heir: 'granddaughter',
        by: 'daughter',
        reason: 'بنت الابن محجوبة ببنتين فأكثر لاستيفاء الثلثين ولا معصب لها'
      });
      h.granddaughter = 0;
    }

    // 6. Siblings blocked by male descendant or father
    const blockedByMaleFuruOrFather = h.son > 0 || h.grandson > 0 || h.father > 0;

    if (blockedByMaleFuruOrFather) {
      const siblingsToBlock = ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister'];
      siblingsToBlock.forEach(heir => {
        if (h[heir] > 0) {
          const blocker = h.father > 0 ? 'الأب' : 'الابن/ابن الابن';
          blocked.push({
            heir,
            by: blocker,
            reason: `${FIQH_DATABASE.heirNames[heir]} محجوب بـ${blocker}`
          });
          h[heir] = 0;
        }
      });
    }

    // 7. Grandfather blocks siblings in Shafii and Hanafi
    if (h.grandfather > 0 && rules.grandfatherWithSiblings === 'blocks') {
      const siblingsToBlock = ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister'];
      siblingsToBlock.forEach(heir => {
        if (h[heir] > 0) {
          blocked.push({
            heir,
            by: 'grandfather',
            reason: `${FIQH_DATABASE.heirNames[heir]} محجوب بالجد (${this.config.name})`
          });
          h[heir] = 0;
        }
      });
      this.state.madhhabNotes.push(`في المذهب ${this.config.name}: الجد يحجب الإخوة الأشقاء ولأب حجب حرمان`);
    }

    // 8. Maternal siblings blocked by descendants or male ascendant
    if (this.hasDescendants() || this.hasMaleAscendant()) {
      ['maternal_brother', 'maternal_sister'].forEach(heir => {
        if (h[heir] > 0) {
          const blocker = this.hasDescendants() ? 'الفرع الوارث' : 'الأصل الذكر';
          blocked.push({
            heir,
            by: blocker,
            reason: `${FIQH_DATABASE.heirNames[heir]} محجوب بـ${blocker}`
          });
          h[heir] = 0;
        }
      });
    }

    // 9. Paternal brother blocked by full brother
    if (h.full_brother > 0 && h.paternal_brother > 0) {
      blocked.push({
        heir: 'paternal_brother',
        by: 'full_brother',
        reason: 'الأخ لأب محجوب بالأخ الشقيق لقوة القرابة'
      });
      h.paternal_brother = 0;
    }

    // 10. Paternal sister blocked by two full sisters (without paternal brother)
    if (h.full_sister >= 2 && h.paternal_sister > 0 && (h.paternal_brother || 0) === 0) {
      if (!this.hasFemaleDescendants()) {
        blocked.push({
          heir: 'paternal_sister',
          by: 'full_sister',
          reason: 'الأخت لأب محجوبة بأختين شقيقتين فأكثر لاستيفاء الثلثين ولا معصب لها'
        });
        h.paternal_sister = 0;
      }
    }

    // 11. Distant asaba blocked by closer asaba
    const hasCloserAsaba = h.full_brother > 0 || h.paternal_brother > 0 ||
                           (h.grandfather > 0 && rules.grandfatherWithSiblings === 'shares');

    if (hasCloserAsaba || h.father > 0 || this.hasMaleDescendants()) {
      const distantAsaba = ['full_nephew', 'paternal_nephew', 'full_uncle', 'paternal_uncle', 'full_cousin', 'paternal_cousin'];
      distantAsaba.forEach(heir => {
        if (h[heir] > 0) {
          blocked.push({
            heir,
            by: 'عاصب أقرب',
            reason: `${FIQH_DATABASE.heirNames[heir]} محجوب بعاصب أقرب منه`
          });
          h[heir] = 0;
        }
      });
    }

    // Ordering distant asaba among themselves
    if (h.full_nephew > 0) {
      ['paternal_nephew', 'full_uncle', 'paternal_uncle', 'full_cousin', 'paternal_cousin'].forEach(heir => {
        if (h[heir] > 0) {
          blocked.push({ heir, by: 'full_nephew', reason: `محجوب بابن الأخ الشقيق` });
          h[heir] = 0;
        }
      });
    } else if (h.paternal_nephew > 0) {
      ['full_uncle', 'paternal_uncle', 'full_cousin', 'paternal_cousin'].forEach(heir => {
        if (h[heir] > 0) {
          blocked.push({ heir, by: 'paternal_nephew', reason: `محجوب بابن الأخ لأب` });
          h[heir] = 0;
        }
      });
    } else if (h.full_uncle > 0) {
      ['paternal_uncle', 'full_cousin', 'paternal_cousin'].forEach(heir => {
        if (h[heir] > 0) {
          blocked.push({ heir, by: 'full_uncle', reason: `محجوب بالعم الشقيق` });
          h[heir] = 0;
        }
      });
    } else if (h.paternal_uncle > 0) {
      ['full_cousin', 'paternal_cousin'].forEach(heir => {
        if (h[heir] > 0) {
          blocked.push({ heir, by: 'paternal_uncle', reason: `محجوب بالعم لأب` });
          h[heir] = 0;
        }
      });
    } else if (h.full_cousin > 0) {
      if (h.paternal_cousin > 0) {
        blocked.push({ heir: 'paternal_cousin', by: 'full_cousin', reason: `محجوب بابن العم الشقيق` });
        h.paternal_cousin = 0;
      }
    }

    this.state.blockedHeirs = blocked;

    if (blocked.length > 0) {
      this.addStep('نتيجة الحجب', `تم حجب ${blocked.length} وارث/ورثة`, blocked);
    } else {
      this.addStep('نتيجة الحجب', 'لا يوجد ورثة محجوبون');
    }
  }

  // ========== Compute Fixed Shares ==========
  computeFixedShares(): HeirShare[] {
    this.addStep('حساب الفروض', 'تحديد أصحاب الفروض وفروضهم');
    const shares: HeirShare[] = [];
    const h = this.heirs;
    const hasDesc = this.hasDescendants();

    // ===== Handle Special Cases First =====

    // 1. Al-Musharraka (Al-Hamariyyah)
    if (this.isMusharraka()) {
      return this.computeMusharraka();
    }

    // 2. Al-Akdariyyah
    if (this.isAkdariyya()) {
      return this.computeAkdariyya();
    }

    // 3. Al-Umariyyah
    const isUmariyyah = this.isUmariyyah();
    if (isUmariyyah) {
      this.state.specialCases.push({
        type: 'umariyyah',
        name: 'العُمَريَّة',
        description: 'الأم تأخذ ثلث الباقي بعد نصيب الزوج/الزوجة، والأب يأخذ الباقي'
      });
    }

    // ===== Husband =====
    if (h.husband > 0) {
      const frac = hasDesc ? Fraction.QUARTER : Fraction.HALF;
      shares.push(new HeirShare({
        key: 'husband',
        name: 'الزوج',
        type: 'فرض',
        fraction: frac,
        count: 1,
        reason: hasDesc ? '¼ لوجود الفرع الوارث' : '½ لعدم وجود فرع وارث'
      }));
    }

    // ===== Wife/Wives =====
    if (h.wife > 0) {
      const frac = hasDesc ? Fraction.EIGHTH : Fraction.QUARTER;
      shares.push(new HeirShare({
        key: 'wife',
        name: h.wife > 1 ? 'الزوجات' : 'الزوجة',
        type: 'فرض',
        fraction: frac,
        count: h.wife,
        reason: hasDesc ?
          `⅛ يشتركن فيه لوجود الفرع الوارث` :
          `¼ يشتركن فيه لعدم وجود فرع وارث`
      }));
    }

    // ===== Mother =====
    if (h.mother > 0) {
      let frac: Fraction, reason: string;

      if (isUmariyyah) {
        if (h.husband > 0) {
          frac = Fraction.SIXTH;
          reason = 'ثلث الباقي بعد نصيب الزوج (العُمَريَّة الأولى)';
        } else {
          frac = Fraction.QUARTER;
          reason = 'ثلث الباقي بعد نصيب الزوجة (العُمَريَّة الثانية)';
        }
      } else if (hasDesc) {
        frac = Fraction.SIXTH;
        reason = '⅙ لوجود الفرع الوارث';
      } else if (this.getAllSiblingsCount() >= 2) {
        frac = Fraction.SIXTH;
        reason = '⅙ لوجود جمع من الإخوة (اثنين فأكثر)';
      } else {
        frac = Fraction.THIRD;
        reason = '⅓ لعدم وجود فرع وارث ولا جمع من الإخوة';
      }

      shares.push(new HeirShare({
        key: 'mother',
        name: 'الأم',
        type: 'فرض',
        fraction: frac,
        count: 1,
        reason
      }));
    }

    // ===== Father =====
    if (h.father > 0) {
      if (this.hasMaleDescendants()) {
        shares.push(new HeirShare({
          key: 'father',
          name: 'الأب',
          type: 'فرض',
          fraction: Fraction.SIXTH,
          count: 1,
          reason: '⅙ فرضاً لوجود الفرع الوارث الذكر'
        }));
      } else if (this.hasFemaleDescendants()) {
        shares.push(new HeirShare({
          key: 'father',
          name: 'الأب',
          type: 'فرض + تعصيب',
          fraction: Fraction.SIXTH,
          count: 1,
          reason: '⅙ فرضاً + الباقي تعصيباً لوجود فرع وارث أنثى فقط'
        }));
      }
    }

    // ===== Grandfather =====
    if (h.grandfather > 0 && h.father === 0) {
      const siblingsExist = this.getFullAndPaternalSiblingsCount() > 0;
      const rules = this.config.rules;

      if (this.hasMaleDescendants()) {
        shares.push(new HeirShare({
          key: 'grandfather',
          name: 'الجد',
          type: 'فرض',
          fraction: Fraction.SIXTH,
          count: 1,
          reason: '⅙ فرضاً لوجود الفرع الوارث الذكر'
        }));
      } else if (this.hasFemaleDescendants()) {
        shares.push(new HeirShare({
          key: 'grandfather',
          name: 'الجد',
          type: 'فرض + تعصيب',
          fraction: Fraction.SIXTH,
          count: 1,
          reason: '⅙ فرضاً + الباقي تعصيباً لوجود فرع وارث أنثى فقط'
        }));
      } else if (siblingsExist && rules.grandfatherWithSiblings === 'shares') {
        this.state.madhhabNotes.push(
          `في المذهب ${this.config.name}: الجد يُقاسم الإخوة الأشقاء ولأب، ويختار الأفضل له من: المقاسمة أو ثلث المال أو السدس`
        );
      }
    }

    // ===== Grandmothers =====
    const grandmothersCount = (h.grandmother_mother || 0) + (h.grandmother_father || 0);
    if (grandmothersCount > 0) {
      const names: string[] = [];
      if (h.grandmother_mother > 0) names.push('الجدة لأم');
      if (h.grandmother_father > 0) names.push('الجدة لأب');

      shares.push(new HeirShare({
        key: 'grandmothers',
        name: grandmothersCount > 1 ? 'الجدات' : names[0],
        type: 'فرض',
        fraction: Fraction.SIXTH,
        count: grandmothersCount,
        reason: grandmothersCount > 1 ? '⅙ يشتركن فيه' : '⅙'
      }));
    }

    // ===== Daughters =====
    if (h.daughter > 0 && h.son === 0) {
      const frac = h.daughter === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
      shares.push(new HeirShare({
        key: 'daughter',
        name: h.daughter > 1 ? 'البنات' : 'البنت',
        type: 'فرض',
        fraction: frac,
        count: h.daughter,
        reason: h.daughter === 1 ?
          '½ للبنت الواحدة' : '⅔ للبنتين فأكثر'
      }));
    }

    // ===== Granddaughters =====
    if (h.granddaughter > 0 && h.grandson === 0 && h.son === 0) {
      if (h.daughter === 0) {
        const frac = h.granddaughter === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
        shares.push(new HeirShare({
          key: 'granddaughter',
          name: h.granddaughter > 1 ? 'بنات الابن' : 'بنت الابن',
          type: 'فرض',
          fraction: frac,
          count: h.granddaughter,
          reason: h.granddaughter === 1 ? '½ لبنت الابن الواحدة' : '⅔ لبنات الابن'
        }));
      } else if (h.daughter === 1) {
        shares.push(new HeirShare({
          key: 'granddaughter',
          name: h.granddaughter > 1 ? 'بنات الابن' : 'بنت الابن',
          type: 'فرض',
          fraction: Fraction.SIXTH,
          count: h.granddaughter,
          reason: '⅙ تكملة للثلثين مع البنت الواحدة'
        }));
      }
    }

    // ===== Full Sisters =====
    if (h.full_sister > 0 && h.full_brother === 0) {
      const isAsabaWithGhayr = this.hasFemaleDescendants();

      if (!isAsabaWithGhayr && !hasDesc && !this.hasMaleAscendant()) {
        const frac = h.full_sister === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
        shares.push(new HeirShare({
          key: 'full_sister',
          name: h.full_sister > 1 ? 'الأخوات الشقيقات' : 'الأخت الشقيقة',
          type: 'فرض',
          fraction: frac,
          count: h.full_sister,
          reason: h.full_sister === 1 ? '½ للأخت الشقيقة الواحدة' : '⅔ للأخوات الشقيقات'
        }));
      }
    }

    // ===== Paternal Sisters =====
    if (h.paternal_sister > 0 && h.paternal_brother === 0 && h.full_brother === 0) {
      const isAsabaWithGhayr = this.hasFemaleDescendants() && h.full_sister === 0;

      if (!isAsabaWithGhayr && !hasDesc && !this.hasMaleAscendant()) {
        if (h.full_sister === 0) {
          const frac = h.paternal_sister === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
          shares.push(new HeirShare({
            key: 'paternal_sister',
            name: h.paternal_sister > 1 ? 'الأخوات لأب' : 'الأخت لأب',
            type: 'فرض',
            fraction: frac,
            count: h.paternal_sister,
            reason: h.paternal_sister === 1 ? '½ للأخت لأب الواحدة' : '⅔ للأخوات لأب'
          }));
        } else if (h.full_sister === 1) {
          shares.push(new HeirShare({
            key: 'paternal_sister',
            name: h.paternal_sister > 1 ? 'الأخوات لأب' : 'الأخت لأب',
            type: 'فرض',
            fraction: Fraction.SIXTH,
            count: h.paternal_sister,
            reason: '⅙ تكملة للثلثين مع الأخت الشقيقة'
          }));
        }
      }
    }

    // ===== Maternal Siblings =====
    const maternalCount = this.getMaternalSiblingsCount();
    if (maternalCount > 0 && !hasDesc && !this.hasMaleAscendant()) {
      const frac = maternalCount === 1 ? Fraction.SIXTH : Fraction.THIRD;
      shares.push(new HeirShare({
        key: 'maternal_siblings',
        name: 'الإخوة لأم',
        type: 'فرض',
        fraction: frac,
        count: maternalCount,
        reason: maternalCount === 1 ?
          '⅙ للواحد من الإخوة لأم' :
          '⅓ يشتركون فيه بالتساوي (ذكرهم كأنثاهم)'
      }));
    }

    return shares;
  }

  // ========== Al-Musharraka (Al-Hamariyyah) ==========
  computeMusharraka(): HeirShare[] {
    this.state.specialCases.push({
      type: 'musharraka',
      name: 'المسألة المشتركة (الحمارية)',
      description: 'الإخوة الأشقاء يشتركون مع الإخوة لأم في الثلث بالتساوي'
    });

    this.addStep('المسألة المشتركة', 'تطبيق قاعدة المشتركة: الإخوة الأشقاء يشاركون الإخوة لأم');

    const h = this.heirs;
    const shares: HeirShare[] = [];

    // Husband: Half
    shares.push(new HeirShare({
      key: 'husband',
      name: 'الزوج',
      type: 'فرض',
      fraction: Fraction.HALF,
      count: 1,
      reason: '½ لعدم وجود فرع وارث'
    }));

    // Mother or Grandmother: Sixth
    if (h.mother > 0) {
      shares.push(new HeirShare({
        key: 'mother',
        name: 'الأم',
        type: 'فرض',
        fraction: Fraction.SIXTH,
        count: 1,
        reason: '⅙ لوجود جمع من الإخوة'
      }));
    } else if (h.grandmother_mother > 0) {
      shares.push(new HeirShare({
        key: 'grandmother_mother',
        name: 'الجدة لأم',
        type: 'فرض',
        fraction: Fraction.SIXTH,
        count: 1,
        reason: '⅙'
      }));
    }

    // Maternal siblings + Full siblings: Third equally
    const maternalCount = this.getMaternalSiblingsCount();
    const fullCount = this.getFullSiblingsCount();
    const totalSiblings = maternalCount + fullCount;

    shares.push(new HeirShare({
      key: 'shared_siblings',
      name: 'الإخوة لأم والأشقاء (مشتركة)',
      type: 'فرض',
      fraction: Fraction.THIRD,
      count: totalSiblings,
      reason: '⅓ يشتركون فيه بالتساوي (المسألة المشتركة)'
    }));

    return shares;
  }

  // ========== Al-Akdariyyah ==========
  computeAkdariyya(): HeirShare[] {
    this.state.specialCases.push({
      type: 'akdariyya',
      name: 'الأكدرية (الغرّاء)',
      description: 'مسألة فريدة يُفرض للأخت مع الجد ثم يُجمع نصيباهما ويُقسم بينهما للذكر مثل حظ الأنثيين'
    });

    this.addStep('الأكدرية', 'تطبيق قاعدة الأكدرية الخاصة');

    const shares: HeirShare[] = [];

    // Husband: Half (3/6)
    shares.push(new HeirShare({
      key: 'husband',
      name: 'الزوج',
      type: 'فرض',
      fraction: Fraction.HALF,
      count: 1,
      reason: '½ = 3/6'
    }));

    // Mother: Third (2/6)
    shares.push(new HeirShare({
      key: 'mother',
      name: 'الأم',
      type: 'فرض',
      fraction: Fraction.THIRD,
      count: 1,
      reason: '⅓ = 2/6'
    }));

    // Akdariyyah from 27:
    // Husband: 9, Mother: 6, Grandfather: 8, Sister: 4

    shares.push(new HeirShare({
      key: 'grandfather',
      name: 'الجد',
      type: 'فرض + تعصيب',
      fraction: new Fraction(8, 27),
      count: 1,
      reason: 'الأكدرية: ⅙ + حصته من المقاسمة مع الأخت'
    }));

    shares.push(new HeirShare({
      key: 'full_sister',
      name: 'الأخت الشقيقة',
      type: 'فرض + تعصيب',
      fraction: new Fraction(4, 27),
      count: 1,
      reason: 'الأكدرية: ½ ثم المقاسمة مع الجد'
    }));

    // Adjust fractions after awl
    shares[0].fraction = new Fraction(9, 27); // Husband
    shares[1].fraction = new Fraction(6, 27); // Mother

    this.results.awlApplied = true;
    this.results.asl = 6;
    this.results.finalBase = 27;

    return shares;
  }

  // ========== Compute Asaba (Residuaries) ==========
  computeAsaba(fixedShares: HeirShare[], remainder: Fraction): HeirShare[] {
    this.addStep('حساب العصبات', 'تحديد العصبة بالنفس وبالغير ومع الغير');
    const asabaShares: HeirShare[] = [];
    const h = this.heirs;
    const rules = this.config.rules;

    if (remainder.num <= 0) {
      this.addStep('العصبات', 'لا باقي للعصبات (المسألة عادلة أو عائلة)');
      return asabaShares;
    }

    let asabaFound = false;
    const asabaList: { key: string; name: string; weight: number; addToExisting?: boolean }[] = [];

    // ===== 1. Son (asaba by self) =====
    if (h.son > 0) {
      asabaFound = true;
      for (let i = 0; i < h.son; i++) {
        asabaList.push({ key: 'son', name: 'الابن', weight: 2 });
      }
      for (let i = 0; i < (h.daughter || 0); i++) {
        asabaList.push({ key: 'daughter', name: 'البنت', weight: 1 });
      }
    }

    // ===== 2. Grandson (asaba by self) =====
    else if (h.grandson > 0) {
      asabaFound = true;
      for (let i = 0; i < h.grandson; i++) {
        asabaList.push({ key: 'grandson', name: 'ابن الابن', weight: 2 });
      }
      for (let i = 0; i < (h.granddaughter || 0); i++) {
        asabaList.push({ key: 'granddaughter', name: 'بنت الابن', weight: 1 });
      }
    }

    // ===== 3. Father (asaba by self) =====
    else if (h.father > 0 && !this.hasMaleDescendants()) {
      asabaFound = true;
      const fatherShare = fixedShares.find(s => s.key === 'father');
      if (fatherShare) {
        asabaList.push({ key: 'father', name: 'الأب', weight: 1, addToExisting: true });
      } else {
        asabaList.push({ key: 'father', name: 'الأب', weight: 1 });
      }
    }

    // ===== 4. Grandfather with siblings (sharing in Maliki and Hanbali) =====
    else if (h.grandfather > 0 && h.father === 0) {
      const siblingsCount = this.getFullAndPaternalSiblingsCount();

      if (siblingsCount > 0 && rules.grandfatherWithSiblings === 'shares') {
        asabaFound = true;
        this.state.specialCases.push({
          type: 'grandfather_with_siblings',
          name: 'الجد مع الإخوة',
          description: `الجد يُقاسم الإخوة في المذهب ${this.config.name}`
        });

        const totalHeads = 2 + (h.full_brother || 0) * 2 + (h.full_sister || 0) +
                          (h.paternal_brother || 0) * 2 + (h.paternal_sister || 0);
        const grandfatherByMuqasama = new Fraction(2, totalHeads);
        const grandfatherByThird = Fraction.THIRD;

        let bestOption = grandfatherByMuqasama;
        let bestReason = 'المقاسمة';

        if (grandfatherByThird.greaterThan(bestOption)) {
          bestOption = grandfatherByThird;
          bestReason = 'ثلث جميع المال';
        }

        asabaList.push({ key: 'grandfather', name: 'الجد', weight: 2 });

        for (let i = 0; i < (h.full_brother || 0); i++) {
          asabaList.push({ key: 'full_brother', name: 'الأخ الشقيق', weight: 2 });
        }
        for (let i = 0; i < (h.full_sister || 0); i++) {
          asabaList.push({ key: 'full_sister', name: 'الأخت الشقيقة', weight: 1 });
        }
        for (let i = 0; i < (h.paternal_brother || 0); i++) {
          asabaList.push({ key: 'paternal_brother', name: 'الأخ لأب', weight: 2 });
        }
        for (let i = 0; i < (h.paternal_sister || 0); i++) {
          asabaList.push({ key: 'paternal_sister', name: 'الأخت لأب', weight: 1 });
        }

      } else if (!this.hasMaleDescendants()) {
        asabaFound = true;
        const grandfatherShare = fixedShares.find(s => s.key === 'grandfather');
        if (grandfatherShare) {
          asabaList.push({ key: 'grandfather', name: 'الجد', weight: 1, addToExisting: true });
        } else {
          asabaList.push({ key: 'grandfather', name: 'الجد', weight: 1 });
        }
      }
    }

    // ===== 5. Full Brother (asaba by self) =====
    else if (h.full_brother > 0) {
      asabaFound = true;
      for (let i = 0; i < h.full_brother; i++) {
        asabaList.push({ key: 'full_brother', name: 'الأخ الشقيق', weight: 2 });
      }
      for (let i = 0; i < (h.full_sister || 0); i++) {
        asabaList.push({ key: 'full_sister', name: 'الأخت الشقيقة', weight: 1 });
      }
    }

    // ===== 6. Full Sister asaba with ghayr =====
    else if (h.full_sister > 0 && this.hasFemaleDescendants()) {
      asabaFound = true;
      this.state.specialCases.push({
        type: 'sister_with_daughters',
        name: 'عصبة مع الغير',
        description: 'الأخت الشقيقة صارت عصبة مع البنت/بنت الابن'
      });

      const sisterIndex = fixedShares.findIndex(s => s.key === 'full_sister');
      if (sisterIndex !== -1) {
        fixedShares.splice(sisterIndex, 1);
      }

      for (let i = 0; i < h.full_sister; i++) {
        asabaList.push({ key: 'full_sister', name: 'الأخت الشقيقة', weight: 1 });
      }

      if (h.paternal_brother > 0 || h.paternal_sister > 0) {
        this.state.blockedHeirs.push({
          heir: 'paternal_siblings',
          by: 'full_sister',
          reason: 'الإخوة لأب محجوبون بالأخت الشقيقة العصبة مع الغير'
        });
        h.paternal_brother = 0;
        h.paternal_sister = 0;
      }
    }

    // ===== 7. Paternal Brother (asaba by self) =====
    else if (h.paternal_brother > 0) {
      asabaFound = true;
      for (let i = 0; i < h.paternal_brother; i++) {
        asabaList.push({ key: 'paternal_brother', name: 'الأخ لأب', weight: 2 });
      }
      for (let i = 0; i < (h.paternal_sister || 0); i++) {
        asabaList.push({ key: 'paternal_sister', name: 'الأخت لأب', weight: 1 });
      }
    }

    // ===== 8. Paternal Sister asaba with ghayr =====
    else if (h.paternal_sister > 0 && this.hasFemaleDescendants() && h.full_sister === 0) {
      asabaFound = true;
      this.state.specialCases.push({
        type: 'paternal_sister_with_daughters',
        name: 'عصبة مع الغير',
        description: 'الأخت لأب صارت عصبة مع البنت/بنت الابن'
      });

      const sisterIndex = fixedShares.findIndex(s => s.key === 'paternal_sister');
      if (sisterIndex !== -1) {
        fixedShares.splice(sisterIndex, 1);
      }

      for (let i = 0; i < h.paternal_sister; i++) {
        asabaList.push({ key: 'paternal_sister', name: 'الأخت لأب', weight: 1 });
      }
    }

    // ===== 9. Distant asaba =====
    else if (h.full_nephew > 0) {
      asabaFound = true;
      for (let i = 0; i < h.full_nephew; i++) {
        asabaList.push({ key: 'full_nephew', name: 'ابن الأخ الشقيق', weight: 1 });
      }
    }
    else if (h.paternal_nephew > 0) {
      asabaFound = true;
      for (let i = 0; i < h.paternal_nephew; i++) {
        asabaList.push({ key: 'paternal_nephew', name: 'ابن الأخ لأب', weight: 1 });
      }
    }
    else if (h.full_uncle > 0) {
      asabaFound = true;
      for (let i = 0; i < h.full_uncle; i++) {
        asabaList.push({ key: 'full_uncle', name: 'العم الشقيق', weight: 1 });
      }
    }
    else if (h.paternal_uncle > 0) {
      asabaFound = true;
      for (let i = 0; i < h.paternal_uncle; i++) {
        asabaList.push({ key: 'paternal_uncle', name: 'العم لأب', weight: 1 });
      }
    }
    else if (h.full_cousin > 0) {
      asabaFound = true;
      for (let i = 0; i < h.full_cousin; i++) {
        asabaList.push({ key: 'full_cousin', name: 'ابن العم الشقيق', weight: 1 });
      }
    }
    else if (h.paternal_cousin > 0) {
      asabaFound = true;
      for (let i = 0; i < h.paternal_cousin; i++) {
        asabaList.push({ key: 'paternal_cousin', name: 'ابن العم لأب', weight: 1 });
      }
    }

    // Distribute remainder to asaba
    if (asabaList.length > 0) {
      const totalWeight = asabaList.reduce((sum, a) => sum + a.weight, 0);

      const grouped: Record<string, { name: string; weight: number; count: number; addToExisting?: boolean }> = {};
      asabaList.forEach(a => {
        if (!grouped[a.key]) {
          grouped[a.key] = {
            name: a.name,
            weight: 0,
            count: 0,
            addToExisting: a.addToExisting
          };
        }
        grouped[a.key].weight += a.weight;
        grouped[a.key].count++;
      });

      for (const [key, data] of Object.entries(grouped)) {
        const shareFrac = remainder.multiply(new Fraction(data.weight, totalWeight));

        if (data.addToExisting) {
          const existing = fixedShares.find(s => s.key === key);
          if (existing) {
            existing.addFraction(shareFrac);
            existing.type = 'فرض + تعصيب';
            existing.reason += ' + الباقي تعصيباً';
          }
        } else {
          asabaShares.push(new HeirShare({
            key,
            name: data.name,
            type: 'عصبة',
            fraction: shareFrac,
            count: data.count,
            reason: `الباقي تعصيباً (${data.weight}/${totalWeight})`
          }));
        }
      }
    }

    return asabaShares;
  }

  // ========== Apply Awl (Increase) ==========
  applyAwl(shares: HeirShare[]): HeirShare[] {
    if (shares.length === 0) {
      this.results.asl = 1;
      this.results.finalBase = 1;
      return shares;
    }

    const denominators = shares
      .filter(s => s.fraction && !s.fraction.isZero())
      .map(s => s.fraction.den);

    if (denominators.length === 0) {
      this.results.asl = 1;
      this.results.finalBase = 1;
      return shares;
    }

    const asl = Fraction.lcmArray(denominators);
    this.results.asl = asl;

    let totalShares = 0;
    const shareDetails = shares.map(share => {
      if (!share.fraction || share.fraction.isZero()) {
        return { share, rawShares: 0 };
      }
      const rawShares = share.fraction.num * (asl / share.fraction.den);
      totalShares += rawShares;
      return { share, rawShares };
    });

    if (totalShares > asl) {
      this.results.awlApplied = true;
      this.results.finalBase = totalShares;
      this.results.awlRatio = new Fraction(asl, totalShares);

      this.state.specialCases.push({
        type: 'awl',
        name: 'العَوْل',
        description: `عالت المسألة من ${asl} إلى ${totalShares}`
      });

      this.addStep('العَوْل',
        `مجموع السهام (${totalShares}) أكبر من أصل المسألة (${asl})، فعالت إلى ${totalShares}`
      );

      return shareDetails.map(({ share, rawShares }) => {
        share.originalFraction = share.fraction.clone();
        share.fraction = new Fraction(rawShares, totalShares);
        share.shares = rawShares;
        return share;
      });
    } else {
      this.results.finalBase = asl;
      return shareDetails.map(({ share, rawShares }) => {
        share.shares = rawShares;
        return share;
      });
    }
  }

  // ========== Apply Radd (Return) ==========
  applyRadd(shares: HeirShare[], remainder: Fraction): HeirShare[] {
    if (remainder.num <= 0) return shares;

    const rules = this.config.rules;

    let eligibleForRadd = shares.filter(s => {
      if (s.type.includes('عصبة')) return false;
      if (s.key === 'husband' || s.key === 'wife') {
        return false;
      }
      return true;
    });

    if (eligibleForRadd.length === 0) {
      if (rules.raddToSpouse) {
        const spouse = shares.find(s => s.key === 'husband' || s.key === 'wife');
        if (spouse && shares.length === 1) {
          this.state.madhhabNotes.push(
            `في المذهب ${this.config.name}: يُرد على الزوج/الزوجة عند عدم وجود وارث آخر`
          );
          eligibleForRadd = [spouse];
        }
      }
    }

    if (eligibleForRadd.length === 0) {
      return shares;
    }

    this.results.raddApplied = true;
    this.state.specialCases.push({
      type: 'radd',
      name: 'الرَّد',
      description: 'توزيع الفائض على أصحاب الفروض بنسبة فروضهم'
    });

    this.addStep('الرَّد', 'توزيع الباقي على أصحاب الفروض بنسبة فروضهم');

    let totalEligibleFrac = new Fraction(0);
    eligibleForRadd.forEach(s => {
      totalEligibleFrac = totalEligibleFrac.add(s.fraction);
    });

    if (totalEligibleFrac.isZero()) return shares;

    return shares.map(share => {
      if (eligibleForRadd.includes(share)) {
        const raddPortion = remainder.multiply(share.fraction).divide(totalEligibleFrac);
        share.addFraction(raddPortion);
        if (!share.type.includes('رد')) {
          share.type = share.type + ' + رد';
        }
      }
      return share;
    });
  }

  // ========== Distribute to Blood Relatives ==========
  distributeToBloodRelatives(shares: HeirShare[], remainder: Fraction): { shares: HeirShare[]; bloodRelatives: HeirShare[] } {
    if (!this.config.rules.bloodRelativesEnabled) {
      if (remainder.isPositive() && this.madhab === 'maliki') {
        shares.push(new HeirShare({
          key: 'treasury',
          name: 'بيت المال',
          type: 'باقي',
          fraction: remainder,
          count: 1,
          reason: 'الباقي لبيت المال (المذهب المالكي)'
        }));
        this.state.madhhabNotes.push('في المذهب المالكي: لا يرث ذوو الأرحام، والباقي لبيت المال');
      }
      return { shares, bloodRelatives: [] };
    }

    if (remainder.num <= 0) {
      return { shares, bloodRelatives: [] };
    }

    const h = this.heirs;
    const bloodRelatives: HeirShare[] = [];

    const classes: Record<number, { key: string; count: number; name: string }[]> = {
      1: [],
      2: [],
      3: [],
      4: []
    };

    if ((h.daughter_son || 0) > 0) {
      classes[1].push({ key: 'daughter_son', count: h.daughter_son, name: 'ابن البنت' });
    }
    if ((h.daughter_daughter || 0) > 0) {
      classes[1].push({ key: 'daughter_daughter', count: h.daughter_daughter, name: 'بنت البنت' });
    }
    if ((h.sister_children || 0) > 0) {
      classes[2].push({ key: 'sister_children', count: h.sister_children, name: 'أولاد الأخت' });
    }
    if ((h.maternal_uncle || 0) > 0) {
      classes[3].push({ key: 'maternal_uncle', count: h.maternal_uncle, name: 'الخال' });
    }
    if ((h.maternal_aunt || 0) > 0) {
      classes[3].push({ key: 'maternal_aunt', count: h.maternal_aunt, name: 'الخالة' });
    }
    if ((h.paternal_aunt || 0) > 0) {
      classes[4].push({ key: 'paternal_aunt', count: h.paternal_aunt, name: 'العمة' });
    }

    let inheritingClass: { key: string; count: number; name: string }[] | null = null;
    for (let i = 1; i <= 4; i++) {
      if (classes[i].length > 0) {
        inheritingClass = classes[i];
        break;
      }
    }

    if (!inheritingClass || inheritingClass.length === 0) {
      return { shares, bloodRelatives: [] };
    }

    this.results.bloodRelativesApplied = true;
    this.state.specialCases.push({
      type: 'blood_relatives',
      name: 'ذوو الأرحام',
      description: 'توريث ذوي الأرحام لعدم وجود عصبة'
    });

    this.addStep('ذوو الأرحام', 'توزيع الباقي على ذوي الأرحام');

    const totalCount = inheritingClass.reduce((sum, r) => sum + r.count, 0);

    inheritingClass.forEach(rel => {
      const shareFrac = remainder.multiply(new Fraction(rel.count, totalCount));
      bloodRelatives.push(new HeirShare({
        key: rel.key,
        name: rel.name,
        type: 'ذو رحم',
        fraction: shareFrac,
        count: rel.count,
        reason: 'ذو رحم - الباقي بعد أصحاب الفروض'
      }));
    });

    return { shares, bloodRelatives };
  }

  // ========== Fair Rounding ==========
  fairRounding(shares: HeirShare[], netEstate: number): void {
    shares.forEach(s => s.calculateAmount(netEstate));

    let total = shares.reduce((sum, s) => sum + s.amount, 0);

    const diff = netEstate - total;
    if (Math.abs(diff) >= 0.01 && shares.length > 0) {
      const sorted = [...shares].sort((a, b) => b.amount - a.amount);
      const cents = Math.abs(Math.round(diff * 100));
      const sign = diff > 0 ? 1 : -1;

      for (let i = 0; i < cents && i < sorted.length * 10; i++) {
        const idx = i % sorted.length;
        sorted[idx].amount = Math.round((sorted[idx].amount + sign * 0.01) * 100) / 100;
      }

      shares.forEach(s => {
        s.amountPerPerson = s.amount / s.count;
      });
    }
  }

  // ========== Main Calculation ==========
  calculate(): CalculationResult {
    try {
      if (this.state.errors.length > 0) {
        return {
          success: false,
          errors: this.state.errors,
          madhab: this.madhab,
          madhhabName: this.config.name
        };
      }

      const { total, funeral, debts, will } = this.estate;
      const netEstate = total - funeral - debts - will;
      this.results.netEstate = netEstate;

      if (netEstate <= 0) {
        return {
          success: false,
          errors: ['صافي التركة صفر أو سالب بعد خصم التكاليف والديون والوصية'],
          madhab: this.madhab,
          madhhabName: this.config.name
        };
      }

      this.addStep('صافي التركة',
        `${total.toLocaleString()} - ${funeral.toLocaleString()} (تجهيز) - ${debts.toLocaleString()} (ديون) - ${will.toLocaleString()} (وصية) = ${netEstate.toLocaleString()}`
      );

      this.applyHijab();

      let fixedShares = this.computeFixedShares();

      fixedShares = this.applyAwl(fixedShares);

      let totalFixed = new Fraction(0);
      fixedShares.forEach(s => {
        totalFixed = totalFixed.add(s.fraction);
      });
      let remainder = new Fraction(1).subtract(totalFixed);

      const asabaShares = this.computeAsaba(fixedShares, remainder);

      let allShares = [...fixedShares];
      asabaShares.forEach(asaba => {
        const existing = allShares.find(s => s.key === asaba.key);
        if (existing) {
          existing.addFraction(asaba.fraction);
          if (!existing.type.includes('تعصيب')) {
            existing.type = existing.type + ' + تعصيب';
          }
        } else {
          allShares.push(asaba);
        }
      });

      let totalAllocated = new Fraction(0);
      allShares.forEach(s => {
        totalAllocated = totalAllocated.add(s.fraction);
      });
      remainder = new Fraction(1).subtract(totalAllocated);

      if (remainder.isPositive() && asabaShares.length === 0) {
        allShares = this.applyRadd(allShares, remainder);

        totalAllocated = new Fraction(0);
        allShares.forEach(s => {
          totalAllocated = totalAllocated.add(s.fraction);
        });
        remainder = new Fraction(1).subtract(totalAllocated);
      }

      if (remainder.isPositive()) {
        const { shares: updatedShares, bloodRelatives } = this.distributeToBloodRelatives(allShares, remainder);
        allShares = updatedShares;
        if (bloodRelatives.length > 0) {
          allShares = [...allShares, ...bloodRelatives];
        }
      }

      this.fairRounding(allShares, netEstate);

      this.calculateConfidence(allShares);

      this.results.shares = allShares.filter(s => !s.fraction.isZero());

      return {
        success: true,
        madhab: this.madhab,
        madhhabName: this.config.name,
        madhhabIcon: this.config.icon,
        estate: this.estate,
        netEstate: this.results.netEstate,
        asl: this.results.asl,
        finalBase: this.results.finalBase,
        awlApplied: this.results.awlApplied,
        awlRatio: this.results.awlRatio,
        raddApplied: this.results.raddApplied,
        bloodRelativesApplied: this.results.bloodRelativesApplied,
        shares: this.results.shares,
        specialCases: this.state.specialCases,
        blockedHeirs: this.state.blockedHeirs,
        madhhabNotes: this.state.madhhabNotes,
        warnings: this.state.warnings,
        steps: this.state.steps,
        confidence: this.results.confidence
      };

    } catch (error: any) {
      console.error('خطأ في حساب الميراث:', error);
      return {
        success: false,
        errors: [`خطأ في الحساب: ${error.message}`],
        madhab: this.madhab,
        madhhabName: this.config.name
      };
    }
  }

  calculateConfidence(shares: HeirShare[]): void {
    let confidence = 1.0;

    if (this.results.awlApplied) confidence *= 0.98;
    if (this.results.raddApplied) confidence *= 0.97;
    if (this.results.bloodRelativesApplied) confidence *= 0.95;
    if (this.state.specialCases.length > 2) confidence *= 0.96;

    const total = shares.reduce((sum, s) => sum + s.fraction.toDecimal(), 0);
    if (Math.abs(1 - total) > 0.001) {
      confidence *= 0.90;
      this.state.warnings.push(`مجموع الحصص (${(total * 100).toFixed(2)}%) لا يساوي 100% بالضبط`);
    }

    this.results.confidence = Math.max(0.80, confidence);
  }
}
