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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-game">{children}</body>
    </html>
  );
}
