'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, FileText, HeartPulse, Home, LogOut,
  Menu, PlusCircle, User, X, ChevronRight,
  Users
} from 'lucide-react';
import { logoutUser } from '../redux/authSlice';
import { AppDispatch, RootState } from '../redux/store';

type Role = 'donor' | 'patient';
type AccountRole = 'bank' | 'user' | 'donor' | 'patient';

const roleNav: Record<Role, { href: string; label: string; icon: React.ReactNode; short: string }[]> = {
  donor: [
    { href: '/user', label: 'Dashboard', short: 'Home', icon: <Home size={20} /> },
    { href: '/user/blood-appeal', label: 'New Appeal', short: 'Appeal', icon: <PlusCircle size={20} /> },
    { href: '/user/appeals', label: 'Blood Appeals', short: 'Appeals', icon: <FileText size={20} /> },
    { href: '/user/notifications', label: 'Notifications', short: 'Alerts', icon: <Bell size={20} /> },
    { href: '/user/donors', label: 'Donor List', short: 'Donors', icon: <Users size={20} /> },
    { href: '/feedback', label: 'Feedback', short: 'Rate', icon: <HeartPulse size={20} /> },
  ],
  patient: [
    { href: '/patient', label: 'Dashboard', short: 'Home', icon: <Home size={20} /> },
    { href: '/patient/blood-appeal', label: 'New Appeal', short: 'Appeal', icon: <PlusCircle size={20} /> },
    { href: '/feedback', label: 'Feedback', short: 'Rate', icon: <HeartPulse size={20} /> },
  ],
};

const getPortalHref = (activeRole?: AccountRole) => {
  if (activeRole === 'bank') return '/bank';
  return '/user';
};

const isAllowedRole = (activeRole: AccountRole | undefined, shellRole: Role) => {
  if (!activeRole) return true;
  if (shellRole === 'donor') return activeRole === 'user' || activeRole === 'donor' || activeRole === 'patient';
  return activeRole === shellRole;
};

export default function RoleShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const activeRole = user?.role ?? (storedUser ? JSON.parse(storedUser).role : undefined);

    if (!token) { router.push('/auth/login'); return; }
    if (!isAllowedRole(activeRole, role)) {
      router.push(getPortalHref(activeRole));
      return;
    }
    setCheckingAuth(false);
  }, [router, role, user]);

  // Close menu when route changes
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = () => {
    dispatch(logoutUser()).unwrap().then(() => router.push('/'));
  };

  const navItems = roleNav[role === 'patient' ? 'patient' : 'donor'];

  /* ── Loading skeleton ── */
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: 'var(--bg-deep)',
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="heartbeat-animation" style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--primary-glow)',
            border: '1px solid rgba(255,59,87,0.25)',
            display: 'grid', placeItems: 'center',
          }}>
            <HeartPulse size={26} color="var(--primary)" />
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Verifying credentials…</span>
        </div>
      </div>
    );
  }

  /* ── User initials avatar ── */
  const initials = (user?.name ?? role[0].toUpperCase())
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarBg = 'linear-gradient(135deg, #ff3b57, #b91c3c)';
  const portalLabel = role === 'patient' ? 'Patient' : 'User';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column' }}>

      {/* ══════════════════════════════
          TOP HEADER
         ══════════════════════════════ */}
      <header className="app-header">
        {/* Brand */}
        <Link href={role === 'patient' ? '/patient' : '/user'} className="header-brand" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--primary-glow)',
            border: '1px solid rgba(255,59,87,0.25)',
            display: 'grid', placeItems: 'center',
          }}>
            <HeartPulse size={16} color="var(--primary)" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>
            {portalLabel}
            <span style={{ color: 'var(--primary)' }}> Portal</span>
          </span>
          <div className="brand-dot" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav" style={{ flex: 1, justifyContent: 'center' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${isActive ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right: Avatar + Logout */}
        <div className="desktop-nav" style={{ gap: 10 }}>
          {user?.name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                className="avatar avatar-sm"
                style={{ background: avatarBg, fontSize: 12, fontWeight: 700 }}
              >
                {initials}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn-premium btn-premium-secondary btn-icon"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn-premium btn-premium-secondary mobile-menu-btn btn-icon"
          style={{ display: 'none' }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* ══════════════════════════════
          MOBILE DROPDOWN MENU
         ══════════════════════════════ */}
      {menuOpen && (
        <div className="mobile-dropdown">
          {/* User info */}
          {user?.name && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 4,
              border: '1px solid var(--border-glass)',
            }}>
              <div className="avatar avatar-sm" style={{ background: avatarBg, fontSize: 12, fontWeight: 700 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{portalLabel}</div>
              </div>
            </div>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(255,59,87,0.2)' : 'transparent'}`,
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'var(--transition-fast)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {item.icon}
                  {item.label}
                </span>
                <ChevronRight size={15} style={{ opacity: 0.4 }} />
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 16px', width: '100%',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--primary)',
              background: 'rgba(255,59,87,0.07)',
              border: '1px solid rgba(255,59,87,0.15)',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              marginTop: 4,
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      )}

      {/* ══════════════════════════════
          MAIN CONTENT
         ══════════════════════════════ */}
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'clamp(20px, 3vw, 36px) clamp(16px, 3vw, 32px)',
        paddingBottom: 'calc(var(--mobile-nav-height) + 24px)', // space for bottom nav on mobile
      }}>
        {children}
      </main>

      {/* ══════════════════════════════
          MOBILE BOTTOM NAV
         ══════════════════════════════ */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="mobile-nav-icon">
                {item.icon}
              </span>
              {item.short}
            </Link>
          );
        })}

        {/* Logout in bottom nav */}
        <button
          onClick={handleLogout}
          className="mobile-nav-item"
          style={{ border: 'none', background: 'none', cursor: 'pointer', flex: 1 }}
        >
          <span className="mobile-nav-icon">
            <LogOut size={20} />
          </span>
          Out
        </button>
      </nav>
    </div>
  );
}
