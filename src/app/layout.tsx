'use client';

import './globals.css';          // <-- ADD THIS LINE
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      if (!data.session && !['/login', '/register'].includes(location.pathname)) {
        router.replace('/login');
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex h-full bg-gray-50 dark:bg-gray-900`}>
        {user && <Sidebar onLogout={handleLogout} />}
        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              VeroTrade
            </h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm rounded bg-primary text-white hover:bg-primary/90"
                >
                  Logout
                </button>
              )}
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
