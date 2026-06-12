export const defaultMetadata = {
  title: 'RentNode - Smart Rent Management for Landlords in Kenya',
  description: 'Manage tenants, rent payments, and property records with automated reminders and M-Pesa integration.',
  keywords: ['rent management Kenya', 'landlord software', 'M-Pesa rent system']
};

/**
 * Merge page‑specific overrides with the default metadata.
 * Overrides can contain any of the fields defined in `defaultMetadata`.
 */
export const mergeMetadata = (overrides: Partial<typeof defaultMetadata>) => {
  return { ...defaultMetadata, ...overrides };
};

/**
 * Generate a JSON‑LD script string for a SoftwareApplication schema.
 * Pass a `priceInfo` object to include pricing details.
 */
export const generateJsonLd = (priceInfo?: { amount: number; currency: string }) => {
  const base = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RentNode',
    applicationCategory: 'RealEstateApp',
    operatingSystem: 'Web',
    description: 'Smart rent management system for landlords in Kenya.',
  } as any;
  if (priceInfo) {
    base.offers = {
      '@type': 'Offer',
      price: priceInfo.amount.toString(),
      priceCurrency: priceInfo.currency,
    };
  }
  return JSON.stringify(base, null, 2);
};
