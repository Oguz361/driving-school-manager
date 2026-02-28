'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
  description?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
    adminOnly: true,
    description: 'Übersicht und Statistiken',
  },
  {
    label: 'Kalender',
    path: '/kalender',
    icon: '📅',
    description: 'Termine und Abwesenheiten',
  },
  {
    label: 'Termine',
    path: '/termine',
    icon: '🚗',
    description: 'Fahrstunden verwalten',
  },
  {
    label: 'Fahrzeuge',
    path: '/fahrzeuge',
    icon: '🚙',
    adminOnly: true,
    description: 'Fahrzeug-Verwaltung',
  },
  {
    label: 'Benutzer',
    path: '/benutzer',
    icon: '👤',
    adminOnly: true,
    description: 'Fahrlehrer-Verwaltung',
  },
  {
    label: 'Aktivitäten',
    path: '/aktivitaeten',
    icon: '📋',
    adminOnly: true,
    description: 'Audit Log',
  },
];

export default function Sidebar() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN' || user?.role === 'OWNER'
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                'w-full flex items-start space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1 text-left">
                <div>{item.label}</div>
                {item.description && (
                  <div className={cn(
                    "text-xs mt-0.5 transition-opacity",
                    isActive
                      ? "text-blue-600 opacity-100"
                      : "text-gray-500 opacity-0 group-hover:opacity-100"
                  )}>
                    {item.description}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Info Box */}
      <div className="p-4 border-t border-gray-200">
        {user?.role === 'INSTRUCTOR' ? (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Tipp:</strong> Im Kalender kannst du Urlaub und Krankheit eintragen.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Angemeldet als:</strong><br />
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
