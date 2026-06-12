import type { Metadata } from 'next';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Pricing – RentNode',
  description: 'Explore RentNode pricing plans and subscription options.',
};

export default function PricingPage() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>
      <p className="mb-4">Select the plan that fits your rental business.</p>
      {/* Add actual pricing cards or components here */}
    </section>
  );
}

