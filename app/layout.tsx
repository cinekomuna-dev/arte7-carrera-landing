import type { Metadata } from 'next';
import Analytics from '@/components/Analytics';
import './globals.css';

const FB_DOMAIN_VERIFICATION = process.env.META_DOMAIN_VERIFICATION_TOKEN;

export const metadata: Metadata = {
  metadataBase: new URL('https://carrera.proyectoarte7.net'),
  title: 'CARRERA DE CINE — ARTE7 ESCUELA DE CINE · CDMX',
  description: 'Carrera de Cine en CDMX. 3 años, 7 semestres, formación práctica. Tu ópera prima financiada por Arte7. Coyoacán, Mexico City.',
  openGraph: {
    title: 'Carrera de Cine — Arte7 Escuela de Cine',
    description: '3 años, 7 semestres, formación práctica. Tu ópera prima financiada por Arte7.',
    url: 'https://carrera.proyectoarte7.net',
    siteName: 'Arte7 Escuela de Cine',
    locale: 'es_MX',
    type: 'website',
  },
  verification: FB_DOMAIN_VERIFICATION
    ? {
        other: {
          'facebook-domain-verification': [FB_DOMAIN_VERIFICATION],
        },
      }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
