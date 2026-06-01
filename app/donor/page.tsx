'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, Calendar, CheckCircle, Droplet, HeartPlus,
  Loader2, MapPin, Phone, ChevronRight, Sparkles,
  Activity, TrendingUp, Clock,
  Users
} from 'lucide-react';
import { fetchBloodAppeals } from '../../redux/bloodAppealSlice';
import { updateAvailable, updateLastDonation, updateTotalDonations, fetchDonorsByCity, User } from '../../redux/authSlice';
import { AppDispatch, RootState } from '../../redux/store';

const similarity = (a = '', b = '') => {
  const l = a.toLowerCase().trim();
  const r = b.toLowerCase().trim();
  if (!l || !r) return 0;
  if (l === r) return 1;
  return l.includes(r) || r.includes(l) ? 0.8 : 0;
};

const urgencyConfig: Record<string, { color: string; bg: string; border: string }> = {
  Critical: { color: 'var(--primary)', bg: 'rgba(255,59,87,0.1)', border: 'rgba(255,59,87,0.25)' },
  Urgent: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  Normal: { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
};

const formatAvailabilityWindow = (person?: Pick<User, 'availabilityStart' | 'availabilityEnd'>) => {
  if (!person?.availabilityStart && !person?.availabilityEnd) return 'Any time';
  if (person.availabilityStart && person.availabilityEnd) return `${person.availabilityStart} - ${person.availabilityEnd}`;
  if (person.availabilityStart) return `From ${person.availabilityStart}`;
  return `Until ${person.availabilityEnd}`;
};

export default function DonorDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: authLoading, sameCityDonors } = useSelector((state: RootState) => state.auth);
  const { appeals, loading } = useSelector((state: RootState) => state.bloodAppeal);
  const [availabilityStart, setAvailabilityStart] = useState('');
  const [availabilityEnd, setAvailabilityEnd] = useState('');

  useEffect(() => { dispatch(fetchBloodAppeals()); }, [dispatch]);

  // 🔽 NEW: Fetch donors in the same city
  useEffect(() => {
    if (user?.city) {
      dispatch(fetchDonorsByCity());
    }
  }, [dispatch, user?.city]);

  useEffect(() => {
    setAvailabilityStart(user?.availabilityStart || '');
    setAvailabilityEnd(user?.availabilityEnd || '');
  }, [user?.availabilityStart, user?.availabilityEnd]);

  const nearbyAppeals = useMemo(() => {
    if (!user) return [];
    return appeals
      .filter((a: any) => a.userEmail !== user.email && a.status !== 'Completed')
      .filter((a: any) => similarity(a.city, user.city) >= 0.65 || !a.city || !user.city)
      .map((a: any, i: number) => ({ ...a, distance: `${(i + 2) * 2}.${i % 3 === 0 ? '4' : '8'} km` }));
  }, [appeals, user]);

  const recordDonation = () => {
    if (!user?.email) return;
    const formattedDate = new Date()
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace(/,/g, '');
    dispatch(updateTotalDonations({ totalDonations: (user.totalDonations || 0) + 1 }));
    dispatch(updateLastDonation({ lastDonation: formattedDate }));
  };

  const toggleAvailability = () => {
    if (!user?.email) return;
    dispatch(updateAvailable({ available: !user.available }));
  };

  const saveAvailabilityTiming = () => {
    if (!user?.email) return;
    dispatch(updateAvailable({
      available: Boolean(user.available),
      availabilityStart,
      availabilityEnd,
    })).then(() => {
      dispatch(fetchDonorsByCity());
    });
  };

  if (authLoading || !user) {
    return (
      <div className="glass-panel loading-state">
        <Loader2 size={20} className="heartbeat-animation" style={{ color: 'var(--primary)' }} />
        Loading your dashboard…
      </div>
    );
  }

  const donationLevel =
    (user.totalDonations || 0) >= 10 ? 'Gold' :
      (user.totalDonations || 0) >= 5 ? 'Silver' :
        (user.totalDonations || 0) >= 1 ? 'Bronze' : 'New';

  const levelColors: Record<string, string> = {
    Gold: '#fbbf24', Silver: '#94a3b8', Bronze: '#cd7f32', New: 'var(--text-muted)',
  };

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
            {user.name || 'Donor'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span
              className="badge"
              style={{
                background: `${levelColors[donationLevel]}18`,
                color: levelColors[donationLevel],
                border: `1px solid ${levelColors[donationLevel]}40`,
              }}
            >
              <Sparkles size={11} />
              {donationLevel} Donor
            </span>
            <span
              className="badge"
              style={{
                background: user.available ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                color: user.available ? 'var(--success)' : 'var(--text-muted)',
                border: `1px solid ${user.available ? 'rgba(16,185,129,0.25)' : 'rgba(100,116,139,0.2)'}`,
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'currentColor', display: 'inline-block',
              }} />
              {user.available ? 'Available' : 'Unavailable'}
            </span>
            <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <Clock size={11} />
              {formatAvailabilityWindow(user)}
            </span>
          </div>
        </div>

        <Link
          href="/user/notifications"
          className="btn-premium btn-premium-secondary"
          style={{ flexShrink: 0 }}
        >
          <Bell size={17} />
          Notifications
        </Link>
      </section>

      {/* ── Stat Cards ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 14,
      }}>
        <StatCard
          icon={<Droplet size={20} fill="currentColor" />}
          iconBg="rgba(255,59,87,0.15)"
          iconColor="var(--primary)"
          label="Total Donations"
          value={String(user.totalDonations || 0)}
        />
        <StatCard
          icon={<Calendar size={20} />}
          iconBg="rgba(59,130,246,0.15)"
          iconColor="var(--accent)"
          label="Last Donation"
          value={user.lastDonation ? String(user.lastDonation).slice(0, 11) : 'N/A'}
          small
        />
        <StatCard
          icon={<HeartPlus size={20} />}
          iconBg="rgba(16,185,129,0.15)"
          iconColor="var(--success)"
          label="Blood Type"
          value={user.bloodType || '—'}
        />
      </section>

      {/* ── Availability + Record Card ── */}
      <section className="glass-panel" style={{ padding: 'clamp(18px, 3vw, 28px)' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Donor Status</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Set your availability and the time window when blood banks can contact you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
          <label className="form-group">
            <span className="form-label">Available From</span>
            <input
              type="time"
              className="form-input-field"
              value={availabilityStart}
              onChange={(event) => setAvailabilityStart(event.target.value)}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Available Until</span>
            <input
              type="time"
              className="form-input-field"
              value={availabilityEnd}
              onChange={(event) => setAvailabilityEnd(event.target.value)}
            />
          </label>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          {/* Availability toggle button */}
          <button
            onClick={toggleAvailability}
            className={`btn-premium ${user.available ? 'btn-premium-success' : 'btn-premium-secondary'}`}
            style={{ flex: '1 1 160px' }}
          >
            <CheckCircle size={17} />
            {user.available ? 'Mark Unavailable' : 'Mark Available'}
          </button>

          <button
            onClick={saveAvailabilityTiming}
            className="btn-premium btn-premium-secondary"
            style={{ flex: '1 1 160px' }}
          >
            <Clock size={17} />
            Save Timing
          </button>

          {/* Record donation button */}
          <button
            onClick={recordDonation}
            className="btn-premium btn-premium-primary"
            style={{ flex: '1 1 160px' }}
          >
            <HeartPlus size={17} />
            Record Donation
          </button>
        </div>

        {/* Progress bar */}
        {(user.totalDonations || 0) > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <TrendingUp size={13} />
                Progress to {donationLevel === 'Gold' ? 'Elite' : donationLevel === 'Silver' ? 'Gold' : donationLevel === 'Bronze' ? 'Silver' : 'Bronze'}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                {user.totalDonations || 0} / {donationLevel === 'New' ? 1 : donationLevel === 'Bronze' ? 5 : 10}
              </span>
            </div>
            <div style={{
              height: 6, borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                borderRadius: 999,
                background: `linear-gradient(90deg, var(--primary), var(--primary-dark))`,
                width: `${Math.min(100, ((user.totalDonations || 0) / (donationLevel === 'New' ? 1 : donationLevel === 'Bronze' ? 5 : 10)) * 100)}%`,
                transition: 'width 0.6s ease',
                boxShadow: '0 0 8px rgba(255,59,87,0.4)',
              }} />
            </div>
          </div>
        )}
      </section>

      {/* 🔽 NEW SECTION: Donors in your city */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Users size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Donors in {user.city}
            </h2>
            <p className="section-subtitle">Connect with fellow donors nearby</p>
          </div>
          <Link href="/user/donors" className="section-action">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {!sameCityDonors || sameCityDonors.length === 0 ? (
          <div className="glass-panel empty-state">
            <Users size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No other donors found in your city yet.</p>
            <p style={{ fontSize: 13 }}>Invite friends to join and grow your local donor network.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {sameCityDonors.map((donor) => (
              <DonorTile key={donor.uid} donor={donor} />
            ))}
          </div>
        )}

      </section>

      {/* ── Nearby Blood Requests ── */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">Nearby Requests</h2>
            <p className="section-subtitle">Blood appeals in your area</p>
          </div>
          <Link href="/user/appeals" className="section-action">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {loading && (
          <div className="glass-panel loading-state">
            <Loader2 size={18} className="heartbeat-animation" style={{ color: 'var(--primary)' }} />
            Fetching nearby requests…
          </div>
        )}

        {!loading && nearbyAppeals.length === 0 && (
          <div className="glass-panel empty-state">
            <div className="empty-state-icon">
              <MapPin size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No nearby requests</p>
            <p style={{ fontSize: 13 }}>We&apos;ll notify you when someone needs blood in your area.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!loading && nearbyAppeals.slice(0, 3).map((appeal: any, index: number) => (
            <AppealCard key={appeal.id || index} appeal={appeal} />
          ))}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {[
            { href: '/user/blood-appeal', icon: <HeartPlus size={18} />, label: 'New Appeal' },
            { href: '/user/appeals', icon: <Activity size={18} />, label: 'All Appeals' },
            { href: '/user/notifications', icon: <Bell size={18} />, label: 'My Alerts' },
            { href: '/feedback', icon: <HeartPlus size={18} />, label: 'Give Feedback' },
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

/* ── Sub-components ── */

function StatCard({
  icon, iconBg, iconColor, label, value, small = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className={`stat-value${small ? ' stat-value-sm' : ''}`} style={small ? { fontSize: 18 } : {}}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function AppealCard({ appeal }: { appeal: any }) {
  const cfg = urgencyConfig[appeal.urgency] ?? urgencyConfig.Normal;

  return (
    <article className="appeal-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        {/* Blood type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,59,87,0.12)',
            border: '1px solid rgba(255,59,87,0.2)',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}>
            <Droplet size={20} fill="var(--primary)" color="var(--primary)" />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
              {appeal.bloodType}
            </span>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 1 }}>
              {appeal.units} units needed
            </p>
          </div>
        </div>

        {/* Urgency badge */}
        <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
          {appeal.urgency}
        </span>
      </div>

      {/* Address */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          {appeal.patientName || 'Patient'}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {appeal.address || 'Location not provided'}
        </p>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
          <MapPin size={14} />
          {appeal.distance || appeal.city || 'Nearby'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
          <Clock size={14} />
          Just now
        </span>
        {appeal.contactNumber && (
          <a
            href={`tel:${appeal.contactNumber}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600,
            }}
          >
            <Phone size={14} />
            {appeal.contactNumber}
          </a>
        )}
      </div>
    </article>
  );
}


/* ── NEW SUB-COMPONENT: DonorTile ── */
function DonorTile({ donor }: { donor: User }) {
  const levelColors: Record<string, string> = {
    Gold: '#fbbf24', Silver: '#94a3b8', Bronze: '#cd7f32', New: 'var(--text-muted)',
  };
  const donationLevel =
    (donor.totalDonations || 0) >= 10 ? 'Gold' :
      (donor.totalDonations || 0) >= 5 ? 'Silver' :
        (donor.totalDonations || 0) >= 1 ? 'Bronze' : 'New';

  return (
    <div className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', transition: 'transform 0.2s ease', cursor: 'default' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,59,87,0.1)', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
        {donor.name?.charAt(0).toUpperCase() || '?'}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text)' }}>{donor.name || 'Anonymous'}</h3>
      <span className="badge" style={{ background: `${levelColors[donationLevel]}18`, color: levelColors[donationLevel], border: `1px solid ${levelColors[donationLevel]}40`, fontSize: 11, padding: '2px 8px' }}>
        {donor.bloodType || 'N/A'} • {donationLevel}
      </span>
      <span style={{ fontSize: 12, color: donor.available ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
        {donor.available ? 'Available' : 'Unavailable'}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Clock size={12} />
        {formatAvailabilityWindow(donor)}
      </span>
    </div>
  );
}
