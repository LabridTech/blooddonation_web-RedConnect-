'use client';

import RoleShell from '../../components/RoleShell';

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="donor">{children}</RoleShell>;
}
