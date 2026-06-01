'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../redux/authSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import {
  Mail, Lock, LogIn, ArrowLeft, Loader2, Heart,
  HeartPulse, Droplet, ShieldCheck, Eye, EyeOff
} from 'lucide-react';

const highlights = [
  { icon: <Droplet size={16} fill="currentColor" />, text: 'Match donors by blood type & location' },
  { icon: <HeartPulse size={16} />, text: 'Real-time critical alerts to nearby donors' },
  { icon: <ShieldCheck size={16} />, text: 'Verified, safe and secure donor network' },
];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const redirectUser = (role: string) => {
    if (role === 'bank') router.push('/bank');
    else if (role === 'user' || role === 'donor' || role === 'patient') router.push('/user');
  };

  useEffect(() => {
    if (user) redirectUser(user.role);
  }, [user]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((res) => redirectUser(res.user.role))
      .catch(() => {});
  };

  const displayError = validationError || error;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div className="glow-orb glow-orb-red" style={{ width: 500, height: 500, top: '-5%', left: '-5%' }} />
      <div className="glow-orb glow-orb-blue" style={{ width: 400, height: 400, bottom: '-10%', right: '-5%' }} />

      {/* ── LEFT BRANDING PANEL (desktop only) ── */}
      <div
        className="hide-mobile"
        style={{
          width: '42%',
          minHeight: '100vh',
          background: 'linear-gradient(155deg, rgba(255,59,87,0.12) 0%, rgba(10,13,22,0.95) 60%)',
          borderRight: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 52px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
          <div className="heartbeat-animation" style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--primary-glow)',
            border: '1px solid rgba(255,59,87,0.3)',
            display: 'grid', placeItems: 'center'
          }}>
            <Heart size={22} fill="var(--primary)" color="var(--primary)" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
            Red<span className="gradient-text-red">Connect</span>
          </span>
        </div>

        <h2 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
          Save lives,<br />one drop at a time.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
          A real-time platform connecting patients in need with compatible donors and trusted blood banks.
        </p>

        {/* Feature highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {highlights.map((h) => (
            <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'var(--primary-glow)',
                border: '1px solid rgba(255,59,87,0.2)',
                display: 'grid', placeItems: 'center',
                color: 'var(--primary)', flexShrink: 0,
              }}>
                {h.icon}
              </div>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{h.text}</span>
            </div>
          ))}
        </div>

        {/* Decorative blood-drop graphic */}
        <div className="float-animation" style={{
          position: 'absolute', bottom: 60, right: -20, opacity: 0.07,
        }}>
          <Droplet size={160} fill="var(--primary)" color="var(--primary)" />
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 48px)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Back link */}
        <div style={{ width: '100%', maxWidth: 420, marginBottom: 28 }}>
          <button
            onClick={() => router.push('/')}
            className="btn-premium btn-premium-ghost"
            style={{ padding: '6px 0', fontSize: 13 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <ArrowLeft size={15} />
            Back to Home
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
          {/* Mobile Logo */}
          <div className="hide-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--primary-glow)',
              border: '1px solid rgba(255,59,87,0.25)',
              display: 'grid', placeItems: 'center',
            }}>
              <Heart size={18} fill="var(--primary)" color="var(--primary)" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
              Red<span className="gradient-text-red">Connect</span>
            </span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Sign in to access your portal
            </p>
          </div>

          {/* Error */}
          {displayError && (
            <div className="fade-in" style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10,
              color: '#f87171',
              fontSize: 13,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <ShieldCheck size={15} style={{ flexShrink: 0 }} />
              {displayError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="btn-premium btn-premium-primary"
              style={{ width: '100%', padding: '14px', borderRadius: 12, marginTop: 4, fontSize: 15 }}
            >
              {loading ? (
                <><Loader2 size={18} style={{ animation: 'spinSlow 1s linear infinite' }} />Signing In...</>
              ) : (
                <><LogIn size={18} />Sign In</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1px solid var(--border-glass)',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/auth/register')}
              style={{
                background: 'none', border: 'none',
                color: 'var(--primary)', fontWeight: 700,
                cursor: 'pointer', fontSize: 'inherit',
              }}
            >
              Create one here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
