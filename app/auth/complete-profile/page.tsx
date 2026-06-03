'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { completeGoogleProfile } from '../../../redux/authSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import { Phone, MapPin, Calendar, Shield, Loader2, ArrowRight, CheckCircle2, User } from 'lucide-react';

export default function CompleteProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [errorMsg, setErrorMsg] = useState('');
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');

  const [formData, setFormData] = useState({
    role: '',
    bloodType: 'A+',
    address: '',
    phone: '',
    age: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    const draft = localStorage.getItem('googleProfileDraft');
    if (draft) {
      const parsed = JSON.parse(draft);
      setDraftName(parsed.name || '');
      setDraftEmail(parsed.email || '');
    } else {
      // If no draft found, they probably shouldn't be here or just refreshed after logout
      router.push('/auth/login');
    }
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.role) {
      setErrorMsg("Please select an account type.");
      return;
    }

    if (formData.phone.length < 10) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    const payload = {
      ...formData,
      age: parseInt(formData.age) || 0,
      name: draftName,
      email: draftEmail
    };

    dispatch(completeGoogleProfile(payload))
      .unwrap()
      .then((res) => {
        if (res.user?.role === 'bank') router.push('/bank');
        else router.push('/user');
      })
      .catch((err) => {
        setErrorMsg(err || 'Failed to complete profile.');
      });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px, 5vw, 56px) clamp(16px, 4vw, 32px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Orbs */}
      <div className="glow-orb glow-orb-red" style={{ width: 500, height: 500, top: '-10%', right: '-5%' }} />
      <div className="glow-orb glow-orb-blue" style={{ width: 400, height: 400, bottom: '-10%', left: '-5%' }} />

      <div className="glass-panel fade-in" style={{
        maxWidth: '760px',
        width: '100%',
        padding: 'clamp(24px, 4vw, 48px)',
        zIndex: 10,
      }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="heartbeat-animation" style={{
            width: 56, height: 56, margin: '0 auto 16px',
            background: 'var(--primary-glow)',
            border: '1px solid rgba(255,59,87,0.25)',
            borderRadius: '50%',
            display: 'grid', placeItems: 'center',
          }}>
            <CheckCircle2 size={26} color="var(--primary)" fill="rgba(255,59,87,0.2)" />
          </div>
          <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 800 }}>Almost there, {draftName.split(' ')[0]}!</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Please complete your profile to continue.
          </p>
        </div>

        {(errorMsg || error) && (
          <div className="fade-in" style={{
            padding: '12px 16px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10,
            color: '#f87171',
            fontSize: 13,
            marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Shield size={15} style={{ flexShrink: 0 }} />
            {errorMsg || error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Your Role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {[
                { value: 'user',    label: 'User',          desc: 'Donate blood and request help' },
                { value: 'bank',    label: '🏦 Blood Bank',  desc: 'Manage blood inventory' },
              ].map(item => {
                const sel = formData.role === item.value;
                return (
                  <div
                    key={item.value}
                    onClick={() => handleChange('role', item.value)}
                    style={{
                      padding: '16px 12px',
                      borderRadius: 12,
                      background: sel ? 'rgba(255,59,87,0.12)' : 'rgba(15,20,34,0.4)',
                      border: `2px solid ${sel ? 'var(--primary)' : 'var(--border-glass)'}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition-smooth)',
                      boxShadow: sel ? '0 0 14px rgba(255,59,87,0.15)' : 'none',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: sel ? 'var(--primary)' : 'var(--text-primary)', fontSize: 14, marginBottom: 5 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

            {formData.role !== 'bank' ? (
              <div className="form-group">
                <label className="form-label">Blood Type *</label>
                <div className="input-icon-wrap">
                  <Shield size={15} className="input-icon" />
                  <select className="form-input-field" value={formData.bloodType} onChange={e => handleChange('bloodType', e.target.value)}>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => (
                      <option key={b} value={b} style={{ background: '#0d1120' }}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Organisation License</label>
                <div className="input-icon-wrap">
                  <Shield size={15} className="input-icon" />
                  <input type="text" className="form-input-field" disabled value="LIC-MY-BLOOD-BANK-2026" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{formData.role === 'bank' ? 'Years Established' : 'Age (18+) *'}</label>
              <div className="input-icon-wrap">
                <Calendar size={15} className="input-icon" />
                <input type="number" className="form-input-field" placeholder={formData.role === 'bank' ? '5' : '25'} value={formData.age} onChange={e => handleChange('age', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div className="input-icon-wrap">
                <Phone size={15} className="input-icon" />
                <input type="tel" className="form-input-field" placeholder="+60123456789" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <div className="input-icon-wrap">
                <MapPin size={15} className="input-icon" />
                <input type="text" className="form-input-field" placeholder="Kuala Lumpur" value={formData.city} onChange={e => handleChange('city', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Country *</label>
              <div className="input-icon-wrap">
                <MapPin size={15} className="input-icon" />
                <input type="text" className="form-input-field" placeholder="Malaysia" value={formData.country} onChange={e => handleChange('country', e.target.value)} required />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address *</label>
              <div className="input-icon-wrap">
                <MapPin size={15} className="input-icon" />
                <input type="text" className="form-input-field" placeholder="123 Street, District" value={formData.address} onChange={e => handleChange('address', e.target.value)} required />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium btn-premium-primary"
            style={{ width: '100%', padding: '15px', borderRadius: 12, fontSize: 15, marginTop: 8 }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spinSlow 1s linear infinite' }} />Saving Profile…</>
            ) : (
              <>Complete Sign Up <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
