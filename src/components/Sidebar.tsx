'use client';

import { Menu, X, Home, PlusCircle, BarChart3, Calendar, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface Props {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/log-trade', label: 'Log Trade', icon: PlusCircle },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/strategies', label: 'Strategies', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-metallic-silver/20 text-metallic-silver lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-metallic-bg/80 backdrop-blur-md border-r border-metallic-dark/50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-metallic-dark/50">
          <h2 className="text-lg font-bold text-metallic-silver">VeroTrade</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-full hover:bg-metallic-dark/20 lg:hidden"
          >
            <X className="w-5 h-5 text-metallic-silver" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`glass flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname.startsWith(href)
                  ? 'bg-primary/20 text-primary border-primary/50'
                  : 'text-metallic-light hover:bg-metallic-dark/20 hover:text-primary'
              }`}
              onClick={() => setOpen(false)}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          <button
            onClick={onLogout}
            className="glass w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
