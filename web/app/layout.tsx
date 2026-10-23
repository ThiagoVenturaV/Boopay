import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boopay — Checkout Conversacional & Catálogo Pronto para IA (GEO)',
  description:
    'Transforme conversas com IA em compras concluídas. Catálogo otimizado para agentes (GEO) + Checkout Invisível no próprio chat com confirmação explícita.',
  icons: {
    icon: '/brand/boo-eyes.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
