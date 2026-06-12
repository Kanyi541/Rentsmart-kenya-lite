import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'RentNode Guides – Quick Help Center',
  description: 'Brief overview of RentNode guides covering account setup, M‑Pesa integration, daily operations, and troubleshooting.',
  keywords: ['rent management guide','landlord tutorials','M-Pesa rent collection']
};

export default function GuidesPage() {
  return (
    <section className="prose mx-auto max-w-3xl py-12">
      <h1>Guides & Help Center</h1>
      <p>RentNode provides short, step‑by‑step guides to help landlords get started, connect M‑Pesa, manage daily rent tasks, and troubleshoot common issues.</p>
      <ul>
        <li><Link href="/guides/getting-started">Getting Started</Link></li>
        <li><Link href="/guides/m-pesa-setup">M‑Pesa Setup</Link></li>
        <li><Link href="/guides/daily-use">Daily Use</Link></li>
        <li><Link href="/guides/troubleshooting">Troubleshooting</Link></li>
      </ul>
      <div className="text-center mt-8">
        <Button asChild className="px-6 py-2 text-lg font-bold">
          <Link href="/demo">Start Free Demo</Link>
        </Button>
      </div>
      <script type="application/ld+json" suppressHydrationWarning>{`{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "RentNode Guides",
  "description": "Brief overview of RentNode help guides.",
  "url": "https://rentnode.vercel.app/guides",
  "keywords": "rent management guide, landlord tutorials, M-Pesa rent collection"
}`}</script>
    </section>
  );
}
