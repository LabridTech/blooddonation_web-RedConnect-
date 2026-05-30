'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar, Droplet, Loader2, PlusCircle,
  ChevronRight, HeartPulse, Clock, CheckCircle,
  AlertCircle, Activity, FileText
} from 'lucide-react';
import { fetchBloodAppeals } from '../../redux/bloodAppealSlice';
import { AppDispatch, RootState } from '../../redux/store';

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Active:    { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: <Activity size={12} /> },
  Completed: { color: 'var(--accent)',  bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)', icon: <CheckCircle size={12} /> },
  Pending:   { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: <Clock size={12} /> },
  Cancelled: { color: 'var(--text-muted)', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', icon: <AlertCircle size={12} /> },
};

export default function PatientDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { appeals, loading, error } = useSelector((state: RootState) => state.bloodAppeal);

  useEffect(() => { dispatch(fetchBloodAppeals()); }, [dispatch]);

  const userAppeals = appeals.filter((a: any) => a.userEmail === user?.email);
  const activeCount = userAppeals.filter((a: any) => a.status === 'Active' || !a.status).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="fade-in">

      {/* ── Welcome Header ── */}
      <section style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4, fontWeight: 500 }}>
            Welcome back 👋
          </p>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800 }}>
            {user?.name || 'Patient'}
          </h1>
          {activeCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span className="badge badge-green">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', animation: 'pulseDot 2s infinite' }} />
                {activeCount} Active Appeal{activeCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <Link
          href="/patient/blood-appeal"
          className="btn-premium btn-premium-primary pulse-glow-button"
          style={{ flexShrink: 0 }}
        >
          <PlusCircle size={17} />
          New Appeal
        </Link>
      </section>

      {/* ── Stats Row ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 14,
      }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,59,87,0.15)', color: 'var(--primary)' }}>
            <FileText size={20} />
          </div>
          <div className="stat-value">{userAppeals.length}</div>
          <div className="stat-label">Total Appeals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>
            <Activity size={20} />
          </div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Active Now</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent)' }}>
            <Droplet size={20} fill="currentColor" />
          </div>
          <div className="stat-value">{user?.bloodType || '—'}</div>
          <div className="stat-label">Blood Type</div>
        </div>
      </section>

      {/* ── Create Appeal CTA ── */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(255,59,87,0.12) 0%, rgba(255,59,87,0.04) 100%)',
        border: '1px solid rgba(255,59,87,0.2)',
        borderRadius: 'var(--radius-md)',
        padding: 'clamp(20px, 3vw, 32px)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,59,87,0.15)',
          border: '1px solid rgba(255,59,87,0.25)',
          display: 'grid', placeItems: 'center',
          flexShrink: 0,
        }}>
          <HeartPulse size={26} color="var(--primary)" className="heartbeat-animation" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Need Blood?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            Create a blood appeal and nearby verified donors and blood banks will respond in real-time.
          </p>
        </div>
        <Link
          href="/patient/blood-appeal"
          className="btn-premium btn-premium-primary"
          style={{ flexShrink: 0 }}
        >
          <PlusCircle size={17} />
          Create Appeal
          <ChevronRight size={15} />
        </Link>
      </section>

      {/* ── Your Appeals ── */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">Your Appeals</h2>
            <p className="section-subtitle">Blood requests you&apos;ve created</p>
          </div>
        </div>

        {loading && (
          <div className="glass-panel loading-state">
            <Loader2 size={18} className="heartbeat-animation" style={{ color: 'var(--primary)' }} />
            Loading your appeals…
          </div>
        )}

        {error && (
          <div style={{
            padding: '14px 18px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171',
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && userAppeals.length === 0 && (
          <div className="glass-panel empty-state">
            <div className="empty-state-icon">
              <FileText size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No appeals yet</p>
            <p style={{ fontSize: 13 }}>Create your first blood appeal to get connected with donors.</p>
            <Link
              href="/patient/blood-appeal"
              className="btn-premium btn-premium-primary"
              style={{ marginTop: 8 }}
            >
              <PlusCircle size={16} />
              Create First Appeal
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!loading && userAppeals.map((appeal: any, index: number) => {
            const status = appeal.status || 'Active';
            const cfg    = statusConfig[status] ?? statusConfig.Active;

            return (
              <article
                key={appeal.id || index}
                className="appeal-card"
                style={{ cursor: 'default' }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(255,59,87,0.12)',
                      border: '1px solid rgba(255,59,87,0.2)',
                      display: 'grid', placeItems: 'center',
                    }}>
                      <Droplet size={20} fill="var(--primary)" color="var(--primary)" />
                    </div>
                    <div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
                        {appeal.bloodType}
                      </span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 1 }}>
                        {appeal.units} units · {appeal.urgency || 'Normal'}
                      </p>
                    </div>
                  </div>

                  <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {cfg.icon}
                    {status}
                  </span>
                </div>

                {/* Address */}
                {appeal.address && (
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    📍 {appeal.address}
                    {appeal.city ? `, ${appeal.city}` : ''}
                  </p>
                )}

                {/* Meta */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Calendar size={13} />
                    {appeal.createdAt ? String(appeal.createdAt).slice(0, 10) : 'Recently'}
                  </span>
                  {appeal.contactNumber && (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      📞 {appeal.contactNumber}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {[
            { href: '/patient/blood-appeal', icon: <PlusCircle size={18} />, label: 'New Appeal' },
            { href: '/feedback',             icon: <HeartPulse size={18} />, label: 'Feedback' },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="btn-premium btn-premium-secondary"
              style={{ flexDirection: 'column', gap: 6, padding: '16px 12px', height: 'auto', borderRadius: 12 }}
            >
              <span style={{ color: 'var(--primary)' }}>{q.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
