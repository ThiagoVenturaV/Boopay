import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boopay — Atendimento Inteligente & Checkout Conversacional',
  description:
    'Compre direto no chat com atendimento inteligente, kits personalizados e finalização segura em poucos passos com confirmação explícita.',
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
