'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../../redux/authSlice';
import { AppDispatch } from '../../../redux/store';
import { User, Mail, Lock, Phone, MapPin, Calendar, Heart, Shield, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodType: 'A+',
    address: '',
    phone: '',
    role: '',
    available: false,
    lastDonation: null as any,
    totalDonations: 0,
    age: '',
    city: '',
    country: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic Validation
    if (!formData.role) {
      setErrorMsg("Please select a portal role (Donor, Patient, or Blood Bank).");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (formData.phone.length < 10) {
      setErrorMsg("Please enter a valid phone number (min 10 digits).");
      return;
    }

    setLoading(true);
    const registerPayload = {
      ...formData,
      age: parseInt(formData.age) || 0,
      lastDonation: new Date().toISOString(),
      totalDonations: 0
    };

    dispatch(registerUser(registerPayload))
      .unwrap()
      .then(() => {
        setLoading(false);
        router.push("/");
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err || "Failed to register account.");
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
        {/* Back Link */}
        <button
          onClick={() => router.push('/auth/login')}
          className="btn-premium btn-premium-ghost"
          style={{ padding: '6px 0', fontSize: 13, marginBottom: 24 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowLeft size={15} />
          Back to Login
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div className="heartbeat-animation" style={{
            width: 52, height: 52,
            background: 'var(--primary-glow)',
            border: '1px solid rgba(255,59,87,0.25)',
            borderRadius: '50%',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Heart size={24} color="var(--primary)" fill="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 800 }}>Create Your Account</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Join RedConnect to start saving lives today</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
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
            {errorMsg}
          </div>
        )}

        {/* Form Grid */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Your Role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {[
                { value: 'donor',   label: '🩸 Donor',      desc: 'Donate blood and save lives' },
                { value: 'patient', label: '🏥 Patient',     desc: 'Request blood donations' },
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

          {/* Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

            <div className="form-group">
              <label className="form-label">Name / Organisation *</label>
              <div className="input-icon-wrap">
                <User size={15} className="input-icon" />
                <input type="text" className="form-input-field" placeholder="John Doe" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="input-icon-wrap">
                <Mail size={15} className="input-icon" />
                <input type="email" className="form-input-field" placeholder="name@example.com" value={formData.email} onChange={e => handleChange('email', e.target.value)} required autoComplete="email" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-icon-wrap">
                <Lock size={15} className="input-icon" />
                <input type="password" className="form-input-field" placeholder="Min 8 characters" value={formData.password} onChange={e => handleChange('password', e.target.value)} required autoComplete="new-password" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-icon-wrap">
                <Lock size={15} className="input-icon" />
                <input type="password" className="form-input-field" placeholder="••••••••" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} required autoComplete="new-password" />
              </div>
            </div>

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
              <><Loader2 size={18} style={{ animation: 'spinSlow 1s linear infinite' }} />Creating Account…</>
            ) : (
              <><User size={18} />Create Account</>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div style={{
          textAlign: 'center',
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px solid var(--border-glass)',
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}>
          Already have an account?{' '}
          <button
            onClick={() => router.push('/auth/login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit' }}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
