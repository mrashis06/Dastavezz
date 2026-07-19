import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dastavezz — AI Document Workspace',
    short_name: 'Dastavezz',
    description: 'Smart Documents. Better Impact. Write, format, and export professional documents with AI assistance.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0C',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/brand/dastavezz-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
