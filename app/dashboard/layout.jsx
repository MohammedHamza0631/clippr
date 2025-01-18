'use client';

import RequireAuth from '@/components/require-auth';

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      {children}
    </RequireAuth>
  );
}
