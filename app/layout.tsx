import type { Metadata } from 'next';
import './globals.css';
import { ConfirmProvider } from '@/components/ConfirmDialog';

export const metadata: Metadata = {
  title: 'Anime Seasonal Tracker',
  description: 'Track your seasonal anime watch list with Thai broadcasting schedules.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen font-sans">
        <ConfirmProvider>{children}</ConfirmProvider>
      </body>
    </html>
  );
}
