'use client';

import RoleShell from '../../components/RoleShell';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="donor">{children}</RoleShell>;
}
