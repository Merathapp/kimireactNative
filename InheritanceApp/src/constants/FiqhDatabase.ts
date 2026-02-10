/**
 * Fiqh Database - Comprehensive Islamic Inheritance Rules
 * Matches the HTML version logic 100%
 */

export type MadhabType = 'shafii' | 'hanafi' | 'maliki' | 'hanbali';

export interface MadhabConfig {
  id: MadhabType;
  name: string;
  icon: string;
  color: string;
  description: string;
  rules: {
    grandfatherWithSiblings: 'blocks' | 'shares';
    raddToSpouse: boolean;
    bloodRelativesEnabled: boolean;
    musharrakaEnabled: boolean;
    akdariyyaEnabled: boolean;
  };
}

export const FIQH_DATABASE = {
  madhabs: {
    shafii: {
      id: 'shafii',
      name: 'الشافعي',
      icon: '🟢',
      color: '#10b981',
      description: 'الرد على أصحاب الفروض عدا الزوجين. الجد يحجب الإخوة مطلقاً. المشتركة معتبرة.',
      rules: {
        grandfatherWithSiblings: 'blocks',
        raddToSpouse: false,
        bloodRelativesEnabled: true,
        musharrakaEnabled: true,
        akdariyyaEnabled: true
      }
    } as MadhabConfig,
    hanafi: {
      id: 'hanafi',
      name: 'الحنفي',
      icon: '🔴',
      color: '#ef4444',
      description: 'الرد على الزوجين عند عدم وجود غيرهم. الجد يحجب الإخوة. لا مشتركة.',
      rules: {
        grandfatherWithSiblings: 'blocks',
        raddToSpouse: true,
        bloodRelativesEnabled: true,
        musharrakaEnabled: false,
        akdariyyaEnabled: true
      }
    } as MadhabConfig,
    maliki: {
      id: 'maliki',
      name: 'المالكي',
      icon: '🟣',
      color: '#8b5cf6',
      description: 'الجد يُقاسم الإخوة. لا رد على الزوجين. الباقي لبيت المال. المشتركة معتبرة.',
      rules: {
        grandfatherWithSiblings: 'shares',
        raddToSpouse: false,
        bloodRelativesEnabled: false,
        musharrakaEnabled: true,
        akdariyyaEnabled: true
      }
    } as MadhabConfig,
    hanbali: {
      id: 'hanbali',
      name: 'الحنبلي',
      icon: '🔵',
      color: '#3b82f6',
      description: 'الجد يُقاسم الإخوة. يُرد على الزوجين عند الحاجة. لا مشتركة.',
      rules: {
        grandfatherWithSiblings: 'shares',
        raddToSpouse: true,
        bloodRelativesEnabled: true,
        musharrakaEnabled: false,
        akdariyyaEnabled: true
      }
    } as MadhabConfig
  },

  heirNames: {
    husband: 'الزوج',
    wife: 'الزوجة',
    wives: 'الزوجات',
    father: 'الأب',
    mother: 'الأم',
    grandfather: 'الجد',
    grandmother: 'الجدة',
    grandmother_mother: 'الجدة لأم',
    grandmother_father: 'الجدة لأب',
    grandmothers: 'الجدات',
    son: 'الابن',
    sons: 'الأبناء',
    daughter: 'البنت',
    daughters: 'البنات',
    grandson: 'ابن الابن',
    grandsons: 'أبناء الابن',
    granddaughter: 'بنت الابن',
    granddaughters: 'بنات الابن',
    full_brother: 'الأخ الشقيق',
    full_brothers: 'الإخوة الأشقاء',
    full_sister: 'الأخت الشقيقة',
    full_sisters: 'الأخوات الشقيقات',
    paternal_brother: 'الأخ لأب',
    paternal_brothers: 'الإخوة لأب',
    paternal_sister: 'الأخت لأب',
    paternal_sisters: 'الأخوات لأب',
    maternal_brother: 'الأخ لأم',
    maternal_sister: 'الأخت لأم',
    maternal_siblings: 'الإخوة لأم',
    full_nephew: 'ابن الأخ الشقيق',
    paternal_nephew: 'ابن الأخ لأب',
    full_uncle: 'العم الشقيق',
    paternal_uncle: 'العم لأب',
    full_cousin: 'ابن العم الشقيق',
    paternal_cousin: 'ابن العم لأب',
    maternal_uncle: 'الخال',
    maternal_aunt: 'الخالة',
    paternal_aunt: 'العمة',
    daughter_son: 'ابن البنت',
    daughter_daughter: 'بنت البنت',
    sister_children: 'أولاد الأخت',
    treasury: 'بيت المال'
  } as Record<string, string>,

  bloodRelativesOrder: [
    { key: 'daughter_son', class: 1, name: 'ابن البنت' },
    { key: 'daughter_daughter', class: 1, name: 'بنت البنت' },
    { key: 'sister_children', class: 2, name: 'أولاد الأخت' },
    { key: 'maternal_uncle', class: 3, name: 'الخال' },
    { key: 'maternal_aunt', class: 3, name: 'الخالة' },
    { key: 'paternal_aunt', class: 4, name: 'العمة' }
  ],

  heirCategories: {
    spouses: ['husband', 'wife'],
    parents: ['father', 'mother', 'grandfather', 'grandmother_mother', 'grandmother_father'],
    children: ['son', 'daughter', 'grandson', 'granddaughter'],
    siblings: ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'],
    extended: ['full_nephew', 'paternal_nephew', 'full_uncle', 'paternal_uncle', 'full_cousin', 'paternal_cousin'],
    bloodRelatives: ['daughter_son', 'daughter_daughter', 'sister_children', 'maternal_uncle', 'maternal_aunt', 'paternal_aunt']
  },

  heirDescriptions: {
    husband: '½ بدون فرع، ¼ مع فرع وارث',
    wife: '¼ بدون فرع، ⅛ مع فرع (يشتركن)',
    father: '⅙ + تعصيب أو تعصيب فقط',
    mother: '⅙ أو ⅓ أو ثلث الباقي',
    grandfather: 'أبو الأب وإن علا',
    grandmother_mother: '⅙ عند عدم الأم',
    grandmother_father: '⅙ عند عدم الأم والأب',
    son: 'عصبة بالنفس',
    daughter: '½ أو ⅔ أو عصبة بالغير',
    grandson: 'عصبة وإن نزل',
    granddaughter: '⅙ تكملة أو ⅔',
    full_brother: 'عصبة بالنفس',
    full_sister: '½ أو ⅔ أو عصبة',
    paternal_brother: 'عصبة',
    paternal_sister: '⅙ تكملة أو عصبة',
    maternal_brother: '⅙ أو ⅓ بالتساوي',
    maternal_sister: '⅙ أو ⅓ بالتساوي',
    full_nephew: 'عصبة',
    paternal_nephew: 'عصبة',
    full_uncle: 'عصبة',
    paternal_uncle: 'عصبة',
    full_cousin: 'عصبة',
    paternal_cousin: 'عصبة',
    daughter_son: 'ذو رحم - صنف 1',
    daughter_daughter: 'ذو رحم - صنف 1',
    sister_children: 'ذو رحم - صنف 2',
    maternal_uncle: 'ذو رحم - صنف 3',
    maternal_aunt: 'ذو رحم - صنف 3',
    paternal_aunt: 'ذو رحم - صنف 4'
  } as Record<string, string>,

  heirConstraints: {
    husband: { max: 1 },
    wife: { max: 4 },
    father: { max: 1 },
    mother: { max: 1 },
    grandfather: { max: 1 },
    grandmother_mother: { max: 1 },
    grandmother_father: { max: 1 }
  } as Record<string, { max: number }>
};

export const getMadhabConfig = (madhab: MadhabType): MadhabConfig => {
  return FIQH_DATABASE.madhabs[madhab];
};

export const getHeirName = (key: string): string => {
  return FIQH_DATABASE.heirNames[key] || key;
};

export const getHeirDescription = (key: string): string => {
  return FIQH_DATABASE.heirDescriptions[key] || '';
};
