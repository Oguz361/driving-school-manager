'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import AppHeader from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/app-sidebar';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
  IconMenu2,
  IconX,
  IconLayoutDashboard,
  IconCalendar,
  IconCar,
  IconUsers,
  IconActivity,
  IconSteeringWheel,
  IconLogout,
  IconSchool,
  IconChartBar,
  IconReceipt,
  IconInfoCircle
} from '@tabler/icons-react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/management');
    }
  }, [isAuthenticated, isLoading, router]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    // Log the logout activity
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout activity log error:', error);
    }

    await signOut({ callbackUrl: '/management' });
  };

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <IconLayoutDashboard className="h-5 w-5" />,
      adminOnly: false,
    },
    {
      label: 'Kalender',
      href: '/kalender',
      icon: <IconCalendar className="h-5 w-5" />,
    },
    {
      label: 'Schüler',
      href: '/schueler',
      icon: <IconSchool className="h-5 w-5" />,
      adminOnly: false,
    },
    {
      label: 'Fahrzeuge',
      href: '/fahrzeuge',
      icon: <IconCar className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: 'Benutzer',
      href: '/benutzer',
      icon: <IconUsers className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: 'Aktivitäten',
      href: '/aktivitaeten',
      icon: <IconActivity className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: 'Finanzen',
      href: '/finanzen',
      icon: <IconReceipt className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      label: 'Statistiken',
      href: '/statistiken',
      icon: <IconChartBar className="h-5 w-5" />,
      adminOnly: false,
    },
    {
      label: 'Info',
      href: '/info',
      icon: <IconInfoCircle className="h-5 w-5" />,
      adminOnly: false,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN' || user?.role === 'OWNER'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - only visible on desktop */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Hamburger */}
        <header className="md:hidden bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-md text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              aria-label="Menü öffnen"
            >
              <IconMenu2 className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <IconSteeringWheel className="h-6 w-6 text-neutral-800 dark:text-neutral-200" />
              <span className="font-bold text-neutral-900 dark:text-neutral-100">Meine Fahrschule</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Drawer */}
        <div
          className={cn(
            "md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-neutral-100 dark:bg-neutral-800 shadow-xl transform transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <IconSteeringWheel className="h-7 w-7 text-neutral-800 dark:text-neutral-200" />
                <span className="font-bold text-xl text-neutral-900 dark:text-neutral-100">Meine Fahrschule</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                aria-label="Menü schließen"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {user?.firstName} {user?.lastName}
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <div className="space-y-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <IconLogout className="h-5 w-5" />
                  Abmelden
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <AppHeader />
        </div>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
