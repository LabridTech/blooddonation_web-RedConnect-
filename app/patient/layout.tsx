'use client';

import RoleShell from '../../components/RoleShell';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell role="patient">{children}</RoleShell>;
}
