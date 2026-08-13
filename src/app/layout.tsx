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
  title: 'Taquería Jefe de Jefes | Alambres y Tacos en Oaxaca',
  description:
    'El mejor menú de alambres, tacos al pastor, tasajo, sincronizadas y quesadillas. Servicio a domicilio de 7am a 12 de la noche. Llama al 951 147 60 75.',
  keywords: ['alambres', 'tacos', 'jefe de jefes', 'taquería oaxaca', 'tasajo', 'sincronizada', 'pastor'],
  openGraph: {
    title: 'Taquería Jefe de Jefes',
    description: 'Alambres y tacos a domicilio. Pide en línea o por voz.',
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
