'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { 
  Hospital, LayoutDashboard, PlusCircle, Search, FileText, 
  MessageSquare, LogOut, Loader2, Menu, X, Droplet, User, Archive 
} from 'lucide-react';
import Link from 'next/link';

export default function BankLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Client-side authentication validation
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    } else if (user && user.role !== 'bank') {
      // Redirect out if they are a donor or patient
      if (user.role === 'donor') router.push('/donor');
      else if (user.role === 'patient') router.push('/patient');
    } else {
      setCheckingAuth(false);
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        router.push("/");
      });
  };

  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <Loader2 size={36} color="var(--primary)" className="heartbeat-animation" />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Verifying credentials...</span>
      </div>
    );
  }

  const menuItems = [
    { href: '/bank', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/bank/add-blood', label: 'Add Blood', icon: <PlusCircle size={18} /> },
    { href: '/bank/inventory', label: 'Inventory', icon: <Archive size={18} /> },
    { href: '/bank/donors', label: 'Find Donors', icon: <Search size={18} /> },
    { href: '/bank/appeals', label: 'Blood Appeals', icon: <FileText size={18} /> },
    { href: '/bank/profile', label: 'Profile', icon: <User size={18} /> },
    { href: '/feedback', label: 'Give Feedback', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="glass-panel" style={{
        width: '260px',
        position: 'fixed',
        top: '16px',
        bottom: '16px',
        left: '16px',
        display: 'none',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 50,
        borderRadius: 'var(--radius-md)'
      }} id="desktop-sidebar">
        {/* Sidebar Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary-glow)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 59, 87, 0.2)'
          }}>
            <Hospital size={20} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', color: '#fff', lineHeight: 1 }}>RedConnect</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Blood Bank</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {menuItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-glow)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-active)' : 'transparent'}`,
                  transition: 'var(--transition-smooth)'
                }}
                className={isActive ? '' : 'glass-panel-interactive'}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--primary)',
                fontSize: '14px'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.city}, {user.country}
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="btn-premium btn-premium-secondary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '8px' }}
          >
            <LogOut size={14} style={{ color: 'var(--primary)' }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MAIN APP CONTENT VIEWPORT ─── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '0',
        transition: 'var(--transition-smooth)'
      }} id="main-content-area">
        
        {/* MOBILE TOP NAVBAR */}
        <header className="glass-panel" style={{
          height: '64px',
          margin: '16px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          borderRadius: 'var(--radius-sm)',
          zIndex: 40
        }} id="mobile-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '4px'
              }}
              id="mobile-menu-btn"
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplet size={18} color="var(--primary)" fill="var(--primary)" />
              <span style={{ fontSize: '15px', fontWeight: 700 }}>RedConnect Bank</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* MOBILE SIDE PANEL DRAWER */}
        {mobileMenuOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div className="glass-panel" style={{
              width: '280px',
              height: '100%',
              borderRadius: '0',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              animation: 'float 4s infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>Navigation</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {menuItems.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        background: isActive ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                        textDecoration: 'none'
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <button 
                onClick={handleLogout}
                className="btn-premium btn-premium-secondary"
                style={{ width: '100%', padding: '12px' }}
              >
                <LogOut size={16} style={{ color: 'var(--primary)' }} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Core Main content box */}
        <main style={{
          flex: 1,
          padding: '16px 24px 40px',
          overflowY: 'auto'
        }}>
          {children}
        </main>
      </div>

      {/* Responsive adjustments CSS */}
      <style>{`
        @media (min-width: 1024px) {
          #desktop-sidebar {
            display: flex !important;
          }
          #main-content-area {
            padding-left: 292px !important;
          }
          #mobile-navbar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
