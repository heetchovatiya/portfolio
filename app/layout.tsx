import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Professional Portfolio - Full Stack Developer & Designer',
  description: 'Crafting digital experiences through innovative web development, UI/UX design, and data analytics. Explore my portfolio of stunning projects.',
  keywords: 'web developer, full stack developer, UI/UX designer, data analyst, portfolio, React, Next.js, TypeScript',
  authors: [{ name: 'Portfolio Developer' }],
  openGraph: {
    title: 'Professional Portfolio - Full Stack Developer & Designer',
    description: 'Crafting digital experiences through innovative web development and design',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}