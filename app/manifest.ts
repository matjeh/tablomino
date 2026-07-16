import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tablomino',
    short_name: 'Tablomino',
    description:
      "Apprends les tables d'addition, soustraction, multiplication et division en jouant.",
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f6f8ff',
    theme_color: '#6ee7b7',
    lang: 'fr',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
