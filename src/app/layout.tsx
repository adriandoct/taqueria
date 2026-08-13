import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Cart } from '@/components/Cart';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Taquería El Rincón Auténtico | Tacos Mexicanos',
  description:
    'Los mejores tacos de la ciudad. Pide desde nuestro menú digital o con tu voz. Pastor, Birria, Suadero, Carnitas y más.',
  keywords: ['tacos', 'taquería', 'comida mexicana', 'tacos al pastor', 'birria'],
  openGraph: {
    title: 'Taquería El Rincón Auténtico',
    description: 'Los mejores tacos de la ciudad. Pide en línea.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${outfit.variable} ${inter.variable}`}>
      <body className="bg-[#0D0A07] antialiased">
        <Navbar />
        <Cart />
        {children}
      </body>
    </html>
  );
}
