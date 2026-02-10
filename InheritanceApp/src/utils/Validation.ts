import { Estate, Heirs } from './InheritanceEngine';

/**
 * Validation Result Interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate Estate Data
 * Matches HTML validation logic 100%
 */
export const validateEstate = (estate: Estate): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Total estate must be positive
  if (estate.total <= 0) {
    errors.push('قيمة التركة يجب أن تكون أكبر من صفر');
  }

  // Negative values not allowed
  if (estate.funeral < 0 || estate.debts < 0 || estate.will < 0) {
    errors.push('القيم السلبية غير مسموحة');
  }

  // Funeral costs cannot exceed total
  if (estate.funeral > estate.total) {
    errors.push('تكاليف التجهيز لا يمكن أن تتجاوز إجمالي التركة');
  }

  // Debts cannot exceed remaining after funeral
  const afterFuneral = estate.total - estate.funeral;
  if (estate.debts > afterFuneral) {
    errors.push('الديون لا يمكن أن تتجاوز الباقي بعد تكاليف التجهيز');
  }

  // Will cannot exceed 1/3 of remaining
  const remaining = afterFuneral - estate.debts;
  if (remaining > 0 && estate.will > remaining / 3) {
    warnings.push(`الوصية (${estate.will.toLocaleString()}) تتجاوز الثلث (${(remaining / 3).toLocaleString()})`);
  }

  // Net estate must be positive
  const netEstate = remaining - estate.will;
  if (netEstate <= 0) {
    errors.push('صافي التركة يجب أن يكون أكبر من صفر بعد جميع الخصومات');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate Heirs Data
 * Matches HTML validation logic 100%
 */
export const validateHeirs = (heirs: Heirs): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if at least one heir exists
  const totalHeirs = Object.values(heirs).reduce((sum, count) => sum + count, 0);
  if (totalHeirs === 0) {
    errors.push('يجب إدخال وارث واحد على الأقل');
  }

  // Husband and wife cannot coexist
  if ((heirs.husband || 0) > 0 && (heirs.wife || 0) > 0) {
    errors.push('لا يمكن وجود زوج وزوجة معاً للميت الواحد');
  }

  // Check maximum constraints
  const constraints: Record<string, number> = {
    husband: 1,
    wife: 4,
    father: 1,
    mother: 1,
    grandfather: 1,
    grandmother_mother: 1,
    grandmother_father: 1
  };

  for (const [key, max] of Object.entries(constraints)) {
    if ((heirs[key] || 0) > max) {
      warnings.push(`${key} يجب ألا يتجاوز ${max}`);
    }
  }

  // Check for unusual combinations
  if ((heirs.son || 0) > 0 && (heirs.grandson || 0) > 0) {
    warnings.push('ابن الابن محجوب بالابن (سيتم حجبه تلقائياً)');
  }

  if ((heirs.father || 0) > 0 && (heirs.grandfather || 0) > 0) {
    warnings.push('الجد محجوب بالأب (سيتم حجبه تلقائياً)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate All Inputs
 */
export const validateAll = (estate: Estate, heirs: Heirs): ValidationResult => {
  const estateValidation = validateEstate(estate);
  const heirsValidation = validateHeirs(heirs);

  return {
    isValid: estateValidation.isValid && heirsValidation.isValid,
    errors: [...estateValidation.errors, ...heirsValidation.errors],
    warnings: [...estateValidation.warnings, ...heirsValidation.warnings]
  };
};

/**
 * Format Error Message
 */
export const formatErrorMessage = (errors: string[]): string => {
  if (errors.length === 0) return '';
  return 'أخطاء في البيانات:\n' + errors.map(e => '• ' + e).join('\n');
};

/**
 * Format Warning Message
 */
export const formatWarningMessage = (warnings: string[]): string => {
  if (warnings.length === 0) return '';
  return 'تحذيرات:\n' + warnings.map(w => '• ' + w).join('\n');
};
