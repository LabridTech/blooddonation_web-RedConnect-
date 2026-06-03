'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutUser, updateAvailable } from '@/redux/authSlice';
import type { RootState, AppDispatch } from '@/redux/store';
import {
  Building2, Shield, LogOut, Save, Phone, MapPin, Mail,
  Award, Zap, CheckCircle2, Clock, ChevronLeft, Settings,
  Droplet, Edit3, X
} from 'lucide-react';

export default function BankSettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [operational, setOperational] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    country: '',
    address: '',
    operatingHours: '',
  });

  useEffect(() => {
    if (user && user.role === 'bank') {
      setOperational(Boolean(user.available));
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        address: user.address || '',
        operatingHours: (user as any).operatingHours || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setStatusMsg(null);
    dispatch(updateAvailable({ available: operational, ...formData } as any))
      .unwrap()
      .then(() => {
        setStatusMsg({ type: 'success', text: 'Bank profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setStatusMsg(null), 4000);
      })
      .catch((err: any) => {
        setStatusMsg({ type: 'error', text: err?.message || String(err) });
        setTimeout(() => setStatusMsg(null), 5000);
      });
  };

  const handleStatusToggle = () => {
    const newVal = !operational;
    setOperational(newVal);
    dispatch(updateAvailable({ available: newVal }))
      .unwrap()
      .then(() => {
        setStatusMsg({ type: 'success', text: `Bank is now ${newVal ? 'accepting donations' : 'offline'}.` });
        setTimeout(() => setStatusMsg(null), 4000);
      })
      .catch((err: any) => {
        setOperational(!newVal); // revert
        setStatusMsg({ type: 'error', text: err?.message || String(err) });
      });
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/');
  };

  if (!user || user.role !== 'bank') return null;

  const initials = (user.name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-red" style={{ width: 550, height: 550, top: '-15%', right: '-10%', opacity: 0.6 }} />
      <div className="glow-orb glow-orb-blue" style={{ width: 500, height: 500, bottom: '-15%', left: '-10%', opacity: 0.5 }} />

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(32px, 6vw, 60px) clamp(16px, 4vw, 48px) clamp(40px, 6vw, 80px)',
        position: 'relative',
        zIndex: 5,
      }}>
        <div style={{ width: '100%', maxWidth: 760 }}>

          {/* ── Back button ── */}
          <button
            onClick={() => router.push('/bank')}
            className="btn-premium btn-premium-ghost"
            style={{ padding: '6px 0', fontSize: 13, marginBottom: 28, color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>

          {/* ── Page Header ── */}
          <div className="fade-in" style={{ marginBottom: 36 }}>
            <div className="badge badge-red" style={{ marginBottom: 14, display: 'inline-flex', padding: '5px 12px', fontSize: 11 }}>
              <Settings size={12} /> Bank Administration
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              marginBottom: 6,
            }}>
              Bank <span className="gradient-text-red">Settings</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Manage your blood bank profile, operational status, and center information.
            </p>
          </div>

          {/* ── Status toast ── */}
          {statusMsg && (
            <div className="fade-in" style={{
              marginBottom: 24, padding: '13px 18px', borderRadius: 12,
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── PROFILE CARD ── */}
            <div className="glass-panel fade-in" style={{ padding: 'clamp(22px, 4vw, 32px)', animationDelay: '0.05s' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.6), rgba(37,99,235,0.3))',
                    border: '2px solid rgba(59,130,246,0.3)',
                    display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff',
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>{user.name || 'Blood Bank'}</h2>
                      <span style={{
                        padding: '2px 10px', borderRadius: 20,
                        background: 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.22)',
                        fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>Verified Bank</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => { setIsEditing(!isEditing); setStatusMsg(null); }}
                  className="btn-premium btn-premium-secondary"
                  style={{ padding: '8px 16px', fontSize: 13, gap: 6, borderRadius: 10 }}
                >
                  {isEditing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Profile</>}
                </button>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
                {[
                  { icon: <Building2 size={13} />, label: 'Bank Name',     name: 'name',    value: formData.name,    type: 'text' },
                  { icon: <Mail size={13} />,      label: 'Email',         name: 'email',   value: user.email,       type: 'email',  locked: true },
                  { icon: <Phone size={13} />,     label: 'Phone',         name: 'phone',   value: formData.phone,   type: 'tel' },
                  { icon: <MapPin size={13} />,    label: 'City',          name: 'city',    value: formData.city,    type: 'text' },
                  { icon: <MapPin size={13} />,    label: 'Country',       name: 'country', value: formData.country, type: 'text' },
                  { icon: <Clock size={13} />,     label: 'Operating Hours', name: 'operatingHours', value: formData.operatingHours, type: 'text' },
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
                      value={field.value}
                      onChange={field.locked ? undefined : handleChange}
                      disabled={!isEditing || field.locked}
                      style={{
                        width: '100%', padding: '10px 13px',
                        background: isEditing && !field.locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isEditing && !field.locked ? 'rgba(255,59,87,0.22)' : 'var(--border-glass)'}`,
                        borderRadius: 8, color: field.locked ? 'var(--text-muted)' : '#fff',
                        fontSize: 13, transition: 'all 0.25s ease',
                        opacity: field.locked ? 0.6 : 1,
                        cursor: field.locked ? 'not-allowed' : 'text',
                        outline: 'none',
                      }}
                      onFocus={e => { if (!field.locked && isEditing) e.target.style.borderColor = 'var(--primary)'; }}
                      onBlur={e => { if (!field.locked && isEditing) e.target.style.borderColor = 'rgba(255,59,87,0.22)'; }}
                    />
                  </div>
                ))}
              </div>

              {/* Full address textarea */}
              <div style={{ marginBottom: isEditing ? 20 : 0 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6,
                }}>
                  <MapPin size={13} /> Full Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={2}
                  style={{
                    width: '100%', padding: '10px 13px',
                    background: isEditing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isEditing ? 'rgba(255,59,87,0.22)' : 'var(--border-glass)'}`,
                    borderRadius: 8, color: '#fff', fontSize: 13,
                    fontFamily: 'var(--font-sans)', resize: 'vertical',
                    transition: 'all 0.25s ease', outline: 'none',
                  }}
                />
              </div>

              {/* Save button */}
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-premium btn-premium-primary"
                  style={{ width: '100%', padding: '13px', fontSize: 14, borderRadius: 12, opacity: loading ? 0.6 : 1 }}
                >
                  <Save size={16} />
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
              )}
            </div>

            {/* ── STATS STRIP ── */}
            <div className="fade-in" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
              animationDelay: '0.1s',
            }}>
              {[
                {
                  icon: <Shield size={20} />,
                  value: 'Verified',
                  label: 'Account Status',
                  color: 'var(--accent)',
                  bg: 'rgba(59,130,246,0.08)',
                  border: 'rgba(59,130,246,0.18)',
                },
                {
                  icon: <Award size={20} />,
                  value: 'Licensed',
                  label: 'Certification',
                  color: 'var(--warning)',
                  bg: 'rgba(245,158,11,0.08)',
                  border: 'rgba(245,158,11,0.18)',
                },
                {
                  icon: <Zap size={20} />,
                  value: operational ? 'Open' : 'Closed',
                  label: 'Operational',
                  color: operational ? 'var(--success)' : 'var(--text-muted)',
                  bg: operational ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                  border: operational ? 'rgba(16,185,129,0.2)' : 'var(--border-glass)',
                },
              ].map(stat => (
                <div key={stat.label} className="glass-panel" style={{
                  padding: '18px 20px',
                  background: stat.bg,
                  border: `1px solid ${stat.border}`,
                  borderRadius: 12,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── OPERATIONAL STATUS ── */}
            <div className="glass-panel fade-in" style={{ padding: 'clamp(22px, 4vw, 32px)', animationDelay: '0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--primary-glow)',
                  border: '1px solid rgba(255,59,87,0.2)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Droplet size={18} fill="var(--primary)" color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Operational Status</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Control donor and patient visibility of your center.</p>
                </div>
              </div>

              {/* Toggle row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 12,
                background: operational ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${operational ? 'rgba(16,185,129,0.2)' : 'var(--border-glass)'}`,
                transition: 'all 0.3s ease',
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Accepting Donations</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {operational ? 'Your center is visible to donors and patients.' : 'Your center is hidden from public listings.'}
                  </p>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={handleStatusToggle}
                  aria-label="Toggle operational status"
                  disabled={loading}
                  style={{
                    position: 'relative', width: 48, height: 26, borderRadius: 9999,
                    background: operational ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${operational ? 'rgba(255,59,87,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    cursor: loading ? 'not-allowed' : 'pointer', flexShrink: 0,
                    transition: 'all 0.3s ease',
                    boxShadow: operational ? 'var(--shadow-glow-red)' : 'none',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: operational ? 24 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            </div>

            {/* ── BLOOD INVENTORY PREVIEW ── */}
            <div className="glass-panel fade-in" style={{ padding: 'clamp(22px, 4vw, 28px)', animationDelay: '0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--primary-glow)',
                  border: '1px solid rgba(255,59,87,0.2)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <Droplet size={17} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Blood Inventory</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Stock overview — full inventory management coming soon.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
                {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map(type => (
                  <div key={type} style={{
                    padding: '12px 8px', borderRadius: 10, textAlign: 'center',
                    background: 'rgba(255,59,87,0.05)',
                    border: '1px solid rgba(255,59,87,0.12)',
                  }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--primary)', marginBottom: 4 }}>{type}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>0 units</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── DANGER ZONE ── */}
            <div className="glass-panel fade-in" style={{
              padding: 'clamp(22px, 4vw, 28px)',
              borderColor: 'rgba(239,68,68,0.18)',
              background: 'rgba(239,68,68,0.03)',
              animationDelay: '0.25s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <LogOut size={17} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ef4444' }}>Sign Out</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>End your current admin session.</p>
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
                  transition: 'all 0.25s ease',
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
        </div>
      </main>
    </div>
  );
}