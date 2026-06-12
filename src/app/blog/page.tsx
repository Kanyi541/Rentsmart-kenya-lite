import type { Metadata } from 'next';
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: 'RentNode Blog – Insights on Rental Management in Kenya',
  description: 'Read the latest articles, guides, and case studies about RentNode, property management, and M-Pesa rent collection.',
  keywords: ['RentNode blog', 'rental management Kenya', 'property management guide', 'M-Pesa rent'],
};

export default function BlogPage() {
  return (
    <section className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Blog</h1>
      <div className="space-y-4 mb-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      {/* JSON‑LD for AI search */}
      <script type="application/ld+json" suppressHydrationWarning>
        {`{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "RentNode Blog",
  "url": "https://rentnode.vercel.app/blog",
  "description": "Insights on rental management, landlord tools, and M-Pesa integration in Kenya."
}`}
      </script>
    </section>
  );
}
