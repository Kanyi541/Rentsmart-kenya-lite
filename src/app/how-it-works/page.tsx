import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How RentNode Works – Simple 4‑Step Rental Management',
  description: 'Learn how RentNode helps landlords create accounts, add properties, collect rent via M‑Pesa, and track everything in one dashboard.',
  keywords: ['rent management workflow', 'how rent collection works', 'M‑Pesa rent SaaS', 'RentNode tutorial']
};

export default function HowItWorksPage() {
  return (
    <section className="prose mx-auto max-w-4xl py-12 px-4">
      <h1>How RentNode Works</h1>
      <p>RentNode guides landlords through a simple four‑step flow that turns a chaotic rent‑collection process into a smooth, automated system.</p>

      {/* Step 1 */}
      <h2>1️⃣ Create an Account</h2>
      <p>Sign up in seconds with an email or phone number. Verify the OTP, set a strong password, and you’re ready to start.</p>

      {/* Step 2 */}
      <h2>2️⃣ Add Properties & Tenants</h2>
      <ul>
        <li><strong>Add a property</strong> – Fill address, unit count, and default rent amount.</li>
        <li><strong>Add tenants</strong> – Assign each tenant to a unit, set lease terms, and store contact details.</li>
        <li><strong>Configure rent schedule</strong> – Choose monthly, weekly, or custom dates.</li>
      </ul>

      {/* Step 3 */}
      <h2>3️⃣ Collect Rent</h2>
      <p>Tenants pay via M‑Pesa, credit‑card, or cash. When a payment is received, RentNode records it instantly, marks the invoice as <em>Paid</em>, and sends a receipt.</p>

      {/* Step 4 */}
      <h2>4️⃣ Track Everything</h2>
      <ul>
        <li>Dashboard shows paid/unpaid status at a glance.</li>
        <li>Automatic reminders are sent to overdue tenants.</li>
        <li>Export reports for accounting or tax filing.</li>
      </ul>

      {/* Trust Section */}
      <h2>Why Trust RentNode?</h2>
      <ul>
        <li>Secure payments – end‑to‑end encryption and PCI‑compliant processing.</li>
        <li>Data protection – GDPR‑style encryption for tenant records.</li>
        <li>Reliable M‑Pesa integration – proven webhook stability with Safaricom.</li>
      </ul>

      {/* CTA */}
      <div className="text-center mt-12">
        <Button asChild className="px-8 py-3 text-lg font-bold">
          <Link href="/demo">Start Free Demo</Link>
        </Button>
      </div>

      {/* JSON‑LD for AI search */}
      <script type="application/ld+json" suppressHydrationWarning>{`{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "How RentNode Works",
  "description": "Step‑by‑step explanation of the RentNode workflow for landlords.",
  "url": "https://rentnode.vercel.app/how-it-works",
  "keywords": "rent management workflow, landlord SaaS, M‑Pesa rent collection"
}`}</script>
    </section>
  );
}
