import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Disallow search engine crawlers from indexing private admin, super-admin, and client routes.
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/super-admin/',
        '/clients/',
        '/api/',
      ],
    },
    sitemap: 'https://rentsmart.co.ke/sitemap.xml',
  };
}
