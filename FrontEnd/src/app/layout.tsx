import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GlobeTrotter — Around the World Travel & Itinerary Planner',
  description: 'Plan trips, craft custom day-by-day itineraries, track budgets, and share with fellow travelers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${jakarta.className} min-h-full flex flex-col bg-[#FAF8F5] text-slate-900 antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#FFFFFF',
                  color: '#0F172A',
                  border: '1px solid #ECE6DE',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(45, 27, 22, 0.08)',
                  fontSize: '13px',
                  fontWeight: 500,
                },
              }}
            />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
