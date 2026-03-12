import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CARRERA DE CINE — ARTE7 ESCUELA DE CINE · CDMX',
  description: 'Carrera de Cine en CDMX. 3 años, 7 semestres, formación práctica. Tu ópera prima financiada por Arte7. Coyoacán, Mexico City.',
  openGraph: {
    title: 'Carrera de Cine — Arte7 Escuela de Cine',
    description: '3 años, 7 semestres, formación práctica. Tu ópera prima financiada por Arte7.',
    url: 'https://carrera.arte7.net',
    siteName: 'Arte7 Escuela de Cine',
    locale: 'es_MX',
    type: 'website',
  },
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
      <body>{children}</body>
    </html>
  );
}
