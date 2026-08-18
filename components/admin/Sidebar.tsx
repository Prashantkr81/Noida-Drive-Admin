'use client';

import {
  LayoutDashboard,
  Users,
  Car,
  CalendarDays,
  BadgeIndianRupee,
  ClipboardList,
  MessageSquare,
  Bell,
  LogOut,
} from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { logoutAdmin } from '@/services/firebase/auth';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    label: 'Cars',
    href: '/dashboard/cars',
    icon: Car,
  },
  {
    label: 'Rental Requests',
    href: '/dashboard/bookings',
    icon: CalendarDays,
  },
  {
    label: 'Quotes',
    href: '/dashboard/quotes',
    icon: BadgeIndianRupee,
  },
  {
    label: 'Sell Submissions',
    href: '/dashboard/sell-submissions',
    icon: ClipboardList,
  },
  {
    label: 'Consultations',
    href: '/dashboard/consultations',
    icon: MessageSquare,
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutAdmin();

      router.replace('/login');
    } catch (error) {
      console.error(
        'ADMIN LOGOUT ERROR:',
        error,
      );
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950">
      {/* Brand */}

      <div className="border-b border-slate-800 px-6 py-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Noida Drive
        </p>

        <h1 className="mt-1 text-xl font-bold text-white">
          Admin Panel
        </h1>
      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(
                  item.href,
                );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon size={18} />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}

      <div className="border-t border-slate-800 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-950/40 hover:text-red-400"
        >
          <LogOut size={18} />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}