'use client';

import { useSession } from 'next-auth/react';

const roleConfig: Record<string, { label: string; className: string }> = {
  OWNER: {
    label: 'Inhaber',
    className: 'bg-violet-100 text-violet-700 ring-violet-600/20',
  },
  ADMIN: {
    label: 'Administrator',
    className: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  },
  INSTRUCTOR: {
    label: 'Fahrlehrer',
    className: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  },
};

export default function AppHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  const role = user?.role ? roleConfig[user.role] : null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">
            Fahrschul-Verwaltung
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {role && (
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${role.className}`}
            >
              {role.label}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>
    </header>
  );
}
