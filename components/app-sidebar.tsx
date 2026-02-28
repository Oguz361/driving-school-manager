'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from '@/components/ui/sidebar';
import {
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
import { motion } from 'motion/react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

function AppSidebarContents() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  const { open, animate } = useSidebar();

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
      icon: <IconLayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      adminOnly: false,
    },
    {
      label: 'Kalender',
      href: '/kalender',
      icon: <IconCalendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: 'Schüler',
      href: '/schueler',
      icon: <IconSchool className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      adminOnly: false,
    },

    {
      label: 'Fahrzeuge',
      href: '/fahrzeuge',
      icon: <IconCar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      adminOnly: true,
    },
    {
      label: 'Benutzer',
      href: '/benutzer',
      icon: <IconUsers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      adminOnly: true,
    },
    {
      label: 'Statistiken',
      href: '/statistiken',
      icon: <IconChartBar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      adminOnly: false,
    },
    {
      label: 'Finanzen',
      href: '/finanzen',
      icon: <IconReceipt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      adminOnly: true,
    },
    {
      label: 'Aktivitäten',
      href: '/aktivitaeten',
      icon: <IconActivity className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      adminOnly: true,
    },
    {
      label: 'Info',
      href: '/info',
      icon: <IconInfoCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      adminOnly: false,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN' || user?.role === 'OWNER'
  );

  const links = filteredNavItems.map(item => ({
    label: item.label,
    href: item.href,
    icon: item.icon,
  }));

  return (
    <SidebarBody className="justify-between gap-10">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6 min-h-[32px]">
          <IconSteeringWheel className="text-neutral-800 dark:text-neutral-200 h-7 w-7 flex-shrink-0" />
          <motion.span
            className="font-bold text-xl text-neutral-800 dark:text-neutral-200 whitespace-nowrap"
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
          >
            Meine Fahrschule
          </motion.span>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex flex-col gap-2">
          {links.map((link, idx) => (
            <SidebarLink
              key={idx}
              link={link}
              className={cn(
                "px-2 rounded-lg transition-colors",
                pathname === link.href
                  ? "bg-neutral-200 dark:bg-neutral-700"
                  : "hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
              )}
            />
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer",
              "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
            )}
          >
            <div className="flex items-center justify-center w-6">
              <IconLogout className="h-5 w-5 flex-shrink-0" />
            </div>
            <motion.span
              className="text-sm whitespace-nowrap"
              animate={{
                display: animate ? (open ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
            >
              Abmelden
            </motion.span>
          </button>
        </div>
      </div>
    </SidebarBody>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <AppSidebarContents />
    </Sidebar>
  );
}
