export type CountryCode = 'KE' | 'UG' | 'TZ' | 'NG' | 'Other';

/**
 * Simple price lookup based on country code.
 * In a real app you would integrate a geolocation service to map IP -> country.
 */
export const getPriceByCountry = (country: CountryCode): { amount: number; currency: string } => {
  const pricingMap: Record<CountryCode, { amount: number; currency: string }> = {
    KE: { amount: 500, currency: 'KES' }, // Kenya
    UG: { amount: 600, currency: 'UGX' }, // Uganda
    TZ: { amount: 550, currency: 'TZS' }, // Tanzania
    NG: { amount: 2000, currency: 'NGN' }, // Nigeria
    Other: { amount: 500, currency: 'KES' }, // Default to Kenya
  };
  return pricingMap[country] ?? pricingMap['Other'];
};

/**
 * Mock function to derive a country code from a request IP.
 * Replace with a real geolocation lookup (e.g., MaxMind, ipinfo) in production.
 */
export const getCountryFromIP = (ip: string | undefined): CountryCode => {
  // Very naive placeholder: if IP starts with known Kenyan range, return KE.
  if (!ip) return 'Other';
  if (ip.startsWith('196.') || ip.startsWith('197.')) return 'KE'; // example Kenyan ranges
  if (ip.startsWith('102.')) return 'UG'; // example Ugandan
  if (ip.startsWith('197.')) return 'TZ'; // example Tanzanian
  if (ip.startsWith('41.')) return 'NG'; // example Nigerian
  return 'Other';
};
