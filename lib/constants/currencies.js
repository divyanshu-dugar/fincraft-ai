/**
 * Curated list of major world currencies.
 * Each entry: { code, symbol, name, locale }
 * `locale` is used with Intl.NumberFormat for correct formatting.
 */
export const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar',           locale: 'en-US'  },
  { code: 'EUR', symbol: '€',  name: 'Euro',                locale: 'de-DE'  },
  { code: 'GBP', symbol: '£',  name: 'British Pound',       locale: 'en-GB'  },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',        locale: 'en-IN'  },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',        locale: 'ja-JP'  },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',        locale: 'zh-CN'  },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',   locale: 'en-AU'  },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',     locale: 'en-CA'  },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',         locale: 'de-CH'  },
  { code: 'HKD', symbol: 'HK$',name: 'Hong Kong Dollar',   locale: 'zh-HK'  },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',    locale: 'en-SG'  },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona',       locale: 'sv-SE'  },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone',     locale: 'nb-NO'  },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone',        locale: 'da-DK'  },
  { code: 'NZD', symbol: 'NZ$',name: 'New Zealand Dollar',  locale: 'en-NZ'  },
  { code: 'KRW', symbol: '₩',  name: 'South Korean Won',   locale: 'ko-KR'  },
  { code: 'MXN', symbol: 'MX$',name: 'Mexican Peso',        locale: 'es-MX'  },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real',      locale: 'pt-BR'  },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand',  locale: 'en-ZA'  },
  { code: 'AED', symbol: 'د.إ',name: 'UAE Dirham',          locale: 'ar-AE'  },
  { code: 'SAR', symbol: '﷼',  name: 'Saudi Riyal',         locale: 'ar-SA'  },
  { code: 'THB', symbol: '฿',  name: 'Thai Baht',           locale: 'th-TH'  },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit',   locale: 'ms-MY'  },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah',   locale: 'id-ID'  },
  { code: 'PHP', symbol: '₱',  name: 'Philippine Peso',     locale: 'en-PH'  },
  { code: 'PKR', symbol: '₨',  name: 'Pakistani Rupee',     locale: 'ur-PK'  },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound',      locale: 'ar-EG'  },
  { code: 'TRY', symbol: '₺',  name: 'Turkish Lira',        locale: 'tr-TR'  },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty',        locale: 'pl-PL'  },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna',        locale: 'cs-CZ'  },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint',    locale: 'hu-HU'  },
  { code: 'ILS', symbol: '₪',  name: 'Israeli Shekel',      locale: 'he-IL'  },
  { code: 'CLP', symbol: 'CL$',name: 'Chilean Peso',        locale: 'es-CL'  },
  { code: 'COP', symbol: 'CO$',name: 'Colombian Peso',      locale: 'es-CO'  },
  { code: 'NGN', symbol: '₦',  name: 'Nigerian Naira',      locale: 'en-NG'  },
  { code: 'KES', symbol: 'KSh',name: 'Kenyan Shilling',     locale: 'sw-KE'  },
  { code: 'GHS', symbol: 'GH₵',name: 'Ghanaian Cedi',       locale: 'en-GH'  },
  { code: 'BDT', symbol: '৳',  name: 'Bangladeshi Taka',    locale: 'bn-BD'  },
  { code: 'VND', symbol: '₫',  name: 'Vietnamese Dong',     locale: 'vi-VN'  },
  { code: 'TWD', symbol: 'NT$',name: 'Taiwan Dollar',       locale: 'zh-TW'  },
];

/** Look up a currency entry by code. Falls back to USD. */
export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/** Format an amount using the currency's native locale + Intl. */
export function formatWithCurrency(amount, code = 'USD') {
  const cur = getCurrency(code);
  return new Intl.NumberFormat(cur.locale, {
    style: 'currency',
    currency: cur.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}
