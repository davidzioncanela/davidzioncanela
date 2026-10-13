import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Super Zion Brothers',
  description: 'Jogo 2D estilo plataforma misturado com 3D - Super Zion Brothers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">{children}</body>
    </html>
  );
}
