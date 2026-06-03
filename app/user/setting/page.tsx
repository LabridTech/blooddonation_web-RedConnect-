'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutUser, updateAvailable } from '@/redux/authSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import {
  User, Droplet, Heart, Phone, MapPin, Mail, Calendar,
  LogOut, Save, Edit3, X, CheckCircle2, Shield,
  Award, Zap, ChevronLeft, Settings, Clock,
} from 'lucide-react';

export default function UserSettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [available, setAvailable] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    country: '',
    address: '',
    availabilityStart: '',
    availabilityEnd: '',
  });

  useEffect(() => {
    if (user && user.role !== 'bank') {
      setAvailable(Boolean(user.available));
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        address: user.address || '',
        availabilityStart: user.availabilityStart || '',
        availabilityEnd: user.availabilityEnd || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setStatusMsg(null);
    try {
      await dispatch(updateAvailable({ ...formData, available })).unwrap();
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to update profile' });
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/');
  };

  if (!user || user.role === 'bank') return null;

  const initials = (user.name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = user.role === 'donor' ? 'Blood Donor' : user.role === 'patient' ? 'Patient' : 'Member';

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--bg-deep)' }}>
      {/* Glow Orbs */}
      <div className="glow-orb glow-orb-red" style={{ width: 520, height: 520, top: '-12%', right: '-8%', opacity: 0.7 }} />
      <div className="glow-orb glow-orb-blue" style={{ width: 480, height: 480, bottom: '-12%', left: '-8%', opacity: 0.5 }} />

      <main style={{
        maxWidth: 740,
        margin: '0 auto',
        padding: 'clamp(28px, 5vw, 56px) clamp(16px, 4vw, 32px) 80px',
        position: 'relative',
        zIndex: 5,
      }}>

        {/* Back button */}
        <button
          onClick={() => router.push('/user')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
            marginBottom: 28, padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

        {/* Page heading */}
        <div className="fade-in" style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: 'var(--primary-light)',
            border: '1px solid rgba(255,59,87,0.2)',
            fontSize: 11, fontWeight: 700, color: 'var(--primary)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
            marginBottom: 14,
          }}>
            <Settings size={11} /> Account Settings
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            marginBottom: 6,
          }}>
            My <span className="gradient-text-red">Profile</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Manage your personal information, availability, and account settings.
          </p>
        </div>

        {/* Status toast */}
        {statusMsg && (
          <div className="fade-in" style={{
            marginBottom: 22, padding: '12px 18px', borderRadius: 12,
            border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(255,59,87,0.3)'}`,
            background: statusMsg.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(255,59,87,0.08)',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14, fontWeight: 500,
            color: statusMsg.type === 'success' ? 'var(--success)' : 'var(--primary)',
          }}>
            {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <Shield size={16} />}
            {statusMsg.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ── PROFILE CARD ── */}
          <div className="glass-panel fade-in" style={{ padding: 'clamp(20px, 4vw, 30px)', animationDelay: '0.05s' }}>

            {/* Avatar + Edit row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Avatar */}
                <div style={{
                  width: 58, height: 58, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--primary-dark), rgba(255,59,87,0.4))',
                  border: '2px solid rgba(255,59,87,0.3)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff',
                  boxShadow: 'var(--shadow-glow-red)',
                }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                    {user.name || 'User'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 20,
                      background: 'var(--primary-light)',
                      border: '1px solid rgba(255,59,87,0.2)',
                      fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {roleLabel}
                    </span>
                    {user.bloodType && (
                      <span style={{
                        padding: '2px 10px', borderRadius: 20,
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        fontSize: 11, fontWeight: 700, color: 'var(--success)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Droplet size={10} fill="currentColor" /> {user.bloodType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit / Cancel */}
              <button
                onClick={() => { setIsEditing(!isEditing); setStatusMsg(null); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 10,
                  background: isEditing ? 'rgba(255,255,255,0.05)' : 'var(--primary-light)',
                  border: `1px solid ${isEditing ? 'var(--border-subtle)' : 'rgba(255,59,87,0.25)'}`,
                  color: isEditing ? 'var(--text-secondary)' : 'var(--primary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {isEditing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Profile</>}
              </button>
            </div>

            {/* Read-only email */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glass)',
              marginBottom: 16,
            }}>
              <Mail size={14} color="var(--text-muted)" />
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Email (read-only)</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</p>
              </div>
            </div>

            {/* Editable fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 12 }}>
              {[
                { icon: <User size={13} />,   label: 'Full Name',    name: 'name',    type: 'text',  placeholder: 'Your full name' },
                { icon: <Phone size={13} />,  label: 'Phone',        name: 'phone',   type: 'tel',   placeholder: '+1 234 567 890' },
                { icon: <MapPin size={13} />, label: 'City',         name: 'city',    type: 'text',  placeholder: 'Your city' },
                { icon: <MapPin size={13} />, label: 'Country',      name: 'country', type: 'text',  placeholder: 'Your country' },
              ].map(field => (
                <div key={field.name}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
                  }}>
                    {field.icon} {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? field.placeholder : '—'}
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: isEditing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditing ? 'rgba(255,59,87,0.22)' : 'var(--border-glass)'}`,
                      borderRadius: 8, color: isEditing ? '#fff' : 'var(--text-secondary)',
                      fontSize: 13, outline: 'none',
                      transition: 'all 0.2s',
                      cursor: isEditing ? 'text' : 'default',
                    }}
                    onFocus={e => { if (isEditing) e.target.style.borderColor = 'var(--primary)'; }}
                    onBlur={e => { if (isEditing) e.target.style.borderColor = 'rgba(255,59,87,0.22)'; }}
                  />
                </div>
              ))}
            </div>

            {/* Address */}
            <div style={{ marginBottom: isEditing ? 16 : 0 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
              }}>
                <MapPin size={13} /> Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows={2}
                placeholder={isEditing ? 'Your full address' : '—'}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: isEditing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isEditing ? 'rgba(255,59,87,0.22)' : 'var(--border-glass)'}`,
                  borderRadius: 8, color: isEditing ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13, fontFamily: 'var(--font-sans)',
                  resize: 'vertical', outline: 'none', transition: 'all 0.2s',
                }}
              />
            </div>

            {/* Save button */}
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 20px',
                  background: 'var(--primary)', border: 'none', borderRadius: 12,
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.25s', opacity: loading ? 0.6 : 1,
                  boxShadow: 'var(--shadow-glow-red)',
                  fontFamily: 'var(--font-display)',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; }}
              >
                <Save size={16} />
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            )}
          </div>

          {/* ── STATS STRIP ── */}
          <div className="fade-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 14,
            animationDelay: '0.1s',
          }}>
            {[
              {
                icon: <Award size={20} />,
                value: user.totalDonations ?? 0,
                label: 'Total Donations',
                color: 'var(--primary)',
                bg: 'rgba(255,59,87,0.07)',
                border: 'rgba(255,59,87,0.15)',
              },
              {
                icon: <Calendar size={20} />,
                value: user.lastDonation
                  ? new Date(user.lastDonation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                  : 'Never',
                label: 'Last Donation',
                color: 'var(--accent)',
                bg: 'rgba(59,130,246,0.07)',
                border: 'rgba(59,130,246,0.15)',
              },
              {
                icon: <Zap size={20} />,
                value: available ? 'Available' : 'Offline',
                label: 'Donor Status',
                color: available ? 'var(--success)' : 'var(--text-muted)',
                bg: available ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.02)',
                border: available ? 'rgba(16,185,129,0.18)' : 'var(--border-glass)',
              },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '18px 18px',
                background: stat.bg,
                border: `1px solid ${stat.border}`,
                borderRadius: 14,
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ color: stat.color, marginBottom: 10 }}>{stat.icon}</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── AVAILABILITY ── */}
          <div className="glass-panel fade-in" style={{ padding: 'clamp(20px, 4vw, 28px)', animationDelay: '0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: 'var(--primary-glow)', border: '1px solid rgba(255,59,87,0.2)',
                display: 'grid', placeItems: 'center',
              }}>
                <Heart size={18} fill="var(--primary)" color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Donation Availability</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Let patients and banks know you&apos;re ready to donate.</p>
              </div>
            </div>

            {/* Toggle row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderRadius: 12, marginBottom: 16,
              background: available ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${available ? 'rgba(16,185,129,0.2)' : 'var(--border-glass)'}`,
              transition: 'all 0.3s ease',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Ready to Donate</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {available ? 'Visible to nearby patients and blood banks.' : 'Currently not accepting donation requests.'}
                </p>
              </div>
              <button
                onClick={() => setAvailable(!available)}
                aria-label="Toggle availability"
                style={{
                  position: 'relative', width: 48, height: 26, borderRadius: 9999, flexShrink: 0,
                  background: available ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${available ? 'rgba(255,59,87,0.4)' : 'rgba(255,255,255,0.12)'}`,
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  boxShadow: available ? 'var(--shadow-glow-red)' : 'none',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: available ? 24 : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>

            {/* Date range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Available From', name: 'availabilityStart', value: formData.availabilityStart },
                { label: 'Available Until', name: 'availabilityEnd',   value: formData.availabilityEnd  },
              ].map(f => (
                <div key={f.name}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
                  }}>
                    <Clock size={11} /> {f.label}
                  </label>
                  <input
                    type="date"
                    name={f.name}
                    value={f.value}
                    onChange={handleChange}
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,59,87,0.18)',
                      borderRadius: 8, color: '#fff', fontSize: 13,
                      outline: 'none', transition: 'all 0.2s',
                      colorScheme: 'dark',
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                width: '100%', padding: '12px 20px',
                background: 'var(--primary)', border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.25s', opacity: loading ? 0.6 : 1,
                boxShadow: 'var(--shadow-glow-red)',
                fontFamily: 'var(--font-display)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; }}
            >
              <Save size={16} />
              {loading ? 'Saving…' : 'Save Availability'}
            </button>
          </div>

          {/* ── SIGN OUT ── */}
          <div className="glass-panel fade-in" style={{
            padding: 'clamp(20px, 4vw, 26px)',
            border: '1px solid rgba(239,68,68,0.18)',
            background: 'rgba(239,68,68,0.03)',
            animationDelay: '0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
                display: 'grid', placeItems: 'center',
              }}>
                <LogOut size={17} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ef4444' }}>Sign Out</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>End your current session.</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '12px 20px',
                background: 'transparent',
                border: '1.5px solid rgba(239,68,68,0.28)',
                color: '#ef4444', borderRadius: 12,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.28)';
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}