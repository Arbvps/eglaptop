// Arabic localization utilities and constants

export const arabicLocale = {
  // Navigation labels
  navigation: {
    overview: "نظرة عامة",
    performance: "لوحة الأداء",
    addSale: "إضافة عملية بيع",
    reports: "التقارير",
    exportData: "تصدير البيانات",
    tasks: "المهام",
    teamPerformance: "أداء الفريق",
    students: "الطلاب",
    employeeManagement: "إدارة الموظفين",
    messages: "الرسائل",
    settings: "الإعدادات",
    systemManagement: "إدارة النظام",
    myAccount: "حسابي الشخصي",
  },

  // Common actions
  actions: {
    logout: "خروج",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    cancel: "إلغاء",
    add: "إضافة",
    update: "تحديث",
    search: "بحث",
    filter: "تصفية",
    export: "تصدير",
    import: "استيراد",
  },

  // Messages and feedback
  messages: {
    noAccess: "ليس لديك صلاحية للوصول",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    success: "تم بنجاح",
    accountDisabled: "تم تعطيل حسابك",
  },

  // Date and time formatting
  dateTime: {
    today: "اليوم",
    yesterday: "أمس",
    tomorrow: "غداً",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
    thisYear: "هذا العام",
  },

  // Numbers - Arabic-Indic numerals
  arabicNumerals: "٠١٢٣٤٥٦٧٨٩",
  
  // Pluralization helper
  plural: (count: number, singular: string, plural: string) => {
    return count === 1 ? singular : plural;
  },
};

// Format number with Arabic-Indic numerals
export function formatArabicNumber(num: number | string): string {
  const str = String(num);
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return str.replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
}

// Format date in Arabic
export function formatArabicDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("ar-SA", options);
}

// Format time in Arabic
export function formatArabicTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return date.toLocaleTimeString("ar-SA", options);
}

// Convert English numerals to Arabic
export function englishToArabicNumerals(text: string): string {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return text.replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
}

// Convert Arabic numerals to English
export function arabicToEnglishNumerals(text: string): string {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  let result = text;
  for (let i = 0; i < arabicDigits.length; i++) {
    result = result.replace(new RegExp(arabicDigits[i], "g"), String(i));
  }
  return result;
}

// Format currency in Arabic
export function formatArabicCurrency(amount: number, currency = "SAR"): string {
  const formatted = new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency,
  }).format(amount);
  return formatted;
}
