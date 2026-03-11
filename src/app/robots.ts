import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Manifest {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://stop-drop-roll.com/sitemap.xml', // Update this when you have a real domain
  };
}
