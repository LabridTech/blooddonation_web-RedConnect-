'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { autoLogin } from '../redux/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import {
  Heart, Activity, LogIn, MessageSquare, Users,
  ShieldAlert, Award, Droplet, Zap, ChevronRight,
  HeartPulse, Building2, UserCheck
} from 'lucide-react';

const features = [
  {
    icon: <Droplet size={22} />,
    iconBg: 'rgba(255,59,87,0.15)',
    iconColor: 'var(--primary)',
    title: 'Real-Time Matching',
    desc: 'Instantly connects patients with compatible donors based on blood type and location.',
  },
  {
    icon: <Zap size={22} />,
    iconBg: 'rgba(245,158,11,0.15)',
    iconColor: 'var(--warning)',
    title: 'Urgent Alerts',
    desc: 'Critical requests trigger immediate notifications to nearby available donors.',
  },
  {
    icon: <Building2 size={22} />,
    iconBg: 'rgba(59,130,246,0.15)',
    iconColor: 'var(--accent)',
    title: 'Blood Bank Network',
    desc: 'Partnered banks manage inventory and verify donations in real-time.',
  },
  {
    icon: <UserCheck size={22} />,
    iconBg: 'rgba(16,185,129,0.15)',
    iconColor: 'var(--success)',
    title: 'Verified Donors',
    desc: 'All donors go through eligibility checks to ensure safe blood supplies.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | null }>({
    show: false, msg: '', type: null,
  });

  const triggerToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: null }), 4000);
  };

  const redirectUser = (role: string) => {
    if (role === 'user' || role === 'patient' || role === 'donor') router.push('/user');
    else if (role === 'bank') router.push('/bank');
    else triggerToast('Invalid role.', 'error');
  };

  const handleAutoLogin = () => {
    dispatch(autoLogin())
      .unwrap()
      .then(({ user }) => {
        triggerToast(`Welcome back, ${user.name}!`, 'success');
        setTimeout(() => redirectUser(user.role), 1400);
      })
      .catch((err) => {
        triggerToast(err || 'No active session found.', 'error');
      });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !user) {
      dispatch(autoLogin())
        .unwrap()
        .then(({ user }) => redirectUser(user.role))
        .catch(() => {});
    } else if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background Orbs */}
      <div className="glow-orb glow-orb-red" style={{ width: 500, height: 500, top: '-10%', left: '-8%' }} />
      <div className="glow-orb glow-orb-blue" style={{ width: 600, height: 600, bottom: '-15%', right: '-10%' }} />
      <div className="glow-orb glow-orb-red" style={{ width: 300, height: 300, bottom: '20%', left: '40%', opacity: 0.5 }} />

      {/* Toast */}
      {toast.show && (
        <div className="toast fade-in" style={{
          borderColor: toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,59,87,0.3)',
        }}>
          {toast.type === 'success'
            ? <HeartPulse size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
            : <ShieldAlert size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          }
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}

      {/* ── Top Nav ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 48px)',
        height: 'var(--header-height)',
        position: 'relative',
        zIndex: 10,
        borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(7,9,15,0.7)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="heartbeat-animation" style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            border: '1px solid rgba(255,59,87,0.25)',
            display: 'grid', placeItems: 'center'
          }}>
            <Heart size={18} fill="var(--primary)" color="var(--primary)" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
            Red<span className="gradient-text-red">Connect</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleAutoLogin}
            disabled={loading}
            className="btn-premium btn-premium-secondary"
            style={{ fontSize: 13, padding: '8px 16px', minHeight: 38 }}
          >
            <Activity size={15} />
            <span className="hide-mobile">Resume Session</span>
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            className="btn-premium btn-premium-primary"
            style={{ fontSize: 13, padding: '8px 18px', minHeight: 38 }}
          >
            <LogIn size={15} />
            Sign In
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(40px, 8vw, 96px) clamp(16px, 4vw, 48px) 48px',
        position: 'relative',
        zIndex: 5,
      }}>

        {/* Eyebrow Pill */}
        <div className="badge badge-red fade-in" style={{ marginBottom: 24, padding: '6px 14px', fontSize: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
          Real-time Blood Donation Network
        </div>

        {/* Headline */}
        <h1
          className="fade-in text-glow"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 7vw, 72px)',
            fontWeight: 900,
            textAlign: 'center',
            maxWidth: 760,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            animationDelay: '0.05s',
          }}
        >
          Every Drop{' '}
          <span className="gradient-text-red">Saves</span>{' '}
          a Life
        </h1>

        <p
          className="fade-in"
          style={{
            textAlign: 'center',
            maxWidth: 520,
            fontSize: 'clamp(15px, 2.2vw, 18px)',
            color: 'var(--text-secondary)',
            marginTop: 20,
            lineHeight: 1.7,
            animationDelay: '0.12s',
          }}
        >
          Connect donors, patients, and blood banks in real-time. Fast, secure, and life-changing.
        </p>

        {/* CTA Buttons */}
        <div
          className="fade-in"
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 36,
            flexWrap: 'wrap',
            justifyContent: 'center',
            animationDelay: '0.2s',
          }}
        >
          <button
            onClick={() => router.push('/auth/login')}
            className="btn-premium btn-premium-primary pulse-glow-button"
            style={{ padding: '14px 28px', fontSize: 15, borderRadius: 12 }}
          >
            <Heart size={18} fill="currentColor" />
            Get Started Free
            <ChevronRight size={16} />
          </button>
          <button
            onClick={handleAutoLogin}
            disabled={loading}
            className="btn-premium btn-premium-secondary"
            style={{ padding: '14px 28px', fontSize: 15, borderRadius: 12 }}
          >
            {loading
              ? <span className="shimmer-loading" style={{ display: 'inline-block', width: 110, height: 16, borderRadius: 4 }} />
              : <><Activity size={18} />Resume Session</>
            }
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div
          className="fade-in"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(8px, 2vw, 24px)',
            marginTop: 56,
            width: '100%',
            maxWidth: 600,
            animationDelay: '0.28s',
          }}
        >
          {[
            { icon: <Users size={18} />, value: '1,480+', label: 'Donors', color: 'var(--primary)' },
            { icon: <Award size={18} />, value: '3,240+', label: 'Donations', color: 'var(--success)' },
            { icon: <Building2 size={18} />, value: '50+', label: 'Blood Banks', color: 'var(--accent)' },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-panel"
              style={{ padding: 'clamp(14px, 2.5vw, 22px)', textAlign: 'center' }}
            >
              <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 3.5vw, 28px)',
                fontWeight: 800,
                color: s.color,
                letterSpacing: '-0.03em',
              }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Feature Cards ── */}
        <div
          className="fade-in"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'clamp(12px, 2vw, 20px)',
            marginTop: 56,
            width: '100%',
            maxWidth: 900,
            animationDelay: '0.36s',
          }}
        >
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div
                className="feature-icon"
                style={{ background: f.iconBg, color: f.iconColor }}
              >
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback link */}
        <button
          onClick={() => router.push('/feedback')}
          className="btn-premium btn-premium-ghost fade-in"
          style={{ marginTop: 40, gap: 6, animationDelay: '0.44s' }}
        >
          <MessageSquare size={15} />
          Share Feedback
        </button>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '16px 24px',
        fontSize: 12,
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-glass)',
        position: 'relative',
        zIndex: 5,
      }}>
        © 2026 RedConnect Platform · All Rights Reserved
      </footer>
    </div>
  );
}
