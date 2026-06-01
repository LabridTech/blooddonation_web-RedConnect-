'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, CheckCircle, Droplet, FileText,
  Loader2, MapPin, Phone, User, AlertCircle, Zap
} from 'lucide-react';
import { addBloodAppeal } from '../redux/bloodAppealSlice';
import { AppDispatch, RootState } from '../redux/store';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const urgencyLevels = [
  { value: 'Normal',   label: 'Normal',   color: 'var(--success)', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)' },
  { value: 'Urgent',   label: 'Urgent',   color: 'var(--warning)', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  { value: 'Critical', label: 'Critical', color: 'var(--primary)', bg: 'rgba(255,59,87,0.12)',   border: 'rgba(255,59,87,0.3)' },
];

export default function BloodAppealWebForm({
  backHref, title, subtitle,
}: {
  backHref: string;
  title: string;
  subtitle: string;
}) {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess]   = useState(false);
  const [formData, setFormData] = useState({
    bloodType:      'A+',
    units:          '',
    urgency:        'Normal',
    contactNumber:  '',
    additionalInfo: '',
    patientName:    '',
    address:        '',
    status:         'Active',
    city:           '',
    country:        '',
  });

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      bloodType:     user.role !== 'bank' ? user.bloodType || prev.bloodType : prev.bloodType,
      contactNumber: user.phone   || '',
      patientName:   user.role !== 'bank' ? user.name : prev.patientName,
      address:       user.address || '',
      city:          user.city    || '',
      country:       user.country || '',
    }));
  }, [user]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!formData.units || Number(formData.units) <= 0) {
      setErrorMsg('Please enter a valid number of units required.');
      return;
    }
    if (!formData.contactNumber) {
      setErrorMsg('Contact number is required.');
      return;
    }
    if (!formData.patientName.trim()) {
      setErrorMsg('Patient name is required.');
      return;
    }
    if (!user?.email) { router.push('/'); return; }

    setLoading(true);
    dispatch(addBloodAppeal({
      ...formData,
      units:     Number(formData.units),
      role:      user.role,
      userEmail: user.email,
    }))
      .unwrap()
      .then(() => {
        setLoading(false);
        setSuccess(true);
        setFormData((prev) => ({
          ...prev,
          units: '', additionalInfo: '',
          patientName: user.role !== 'bank' ? user.name : '',
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(typeof err === 'string' ? err : err?.message || 'Failed to submit blood appeal.');
      });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }} className="fade-in">
      {/* Back button */}
      <button
        onClick={() => router.push(backHref)}
        className="btn-premium btn-premium-ghost"
        style={{ marginBottom: 20, padding: '8px 4px', fontSize: 13 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 40px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--primary-glow)',
            border: '1px solid rgba(255,59,87,0.25)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <FileText size={24} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800 }}>{title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 3 }}>{subtitle}</p>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="fade-in" style={{
            padding: '14px 16px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10,
            color: '#f87171', fontSize: 14, marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {errorMsg}
          </div>
        )}
        {success && (
          <div className="fade-in" style={{
            padding: '14px 16px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 10,
            color: 'var(--success)', fontSize: 14, marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            Blood appeal submitted successfully! Donors will be notified shortly.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* ── Blood Type ── */}
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>
              Blood Group Required *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: 10,
            }}>
              {bloodTypes.map((type) => {
                const isSelected = formData.bloodType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('bloodType', type)}
                    style={{
                      padding: '13px 8px',
                      borderRadius: 10,
                      background: isSelected ? 'rgba(255,59,87,0.15)' : 'rgba(15,20,34,0.5)',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-glass)'}`,
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: isSelected ? '0 0 12px rgba(255,59,87,0.2)' : 'none',
                    }}
                  >
                    {isSelected && <Droplet size={12} fill="currentColor" />}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Urgency Level ── */}
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>
              Urgency Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {urgencyLevels.map((u) => {
                const isSelected = formData.urgency === u.value;
                return (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => updateField('urgency', u.value)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 10,
                      background: isSelected ? u.bg : 'rgba(15,20,34,0.4)',
                      border: `2px solid ${isSelected ? u.border : 'var(--border-glass)'}`,
                      color: isSelected ? u.color : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    {u.value === 'Critical' && <Zap size={14} />}
                    {u.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Form Fields Grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}>
            <FormField
              icon={<User size={15} />}
              label="Patient Name *"
              value={formData.patientName}
              onChange={(v) => updateField('patientName', v)}
              placeholder="Full name"
            />
            <FormField
              icon={<Droplet size={15} />}
              label="Units Required *"
              type="number"
              value={formData.units}
              onChange={(v) => updateField('units', v)}
              placeholder="e.g. 2"
            />
            <FormField
              icon={<Phone size={15} />}
              label="Contact Number *"
              value={formData.contactNumber}
              onChange={(v) => updateField('contactNumber', v)}
              placeholder="+1 234 567 890"
              type="tel"
            />
            <FormField
              icon={<MapPin size={15} />}
              label="City"
              value={formData.city}
              onChange={(v) => updateField('city', v)}
              placeholder="Your city"
            />
            <FormField
              icon={<MapPin size={15} />}
              label="Country"
              value={formData.country}
              onChange={(v) => updateField('country', v)}
              placeholder="Your country"
            />
          </div>

          {/* ── Address ── */}
          <FormField
            icon={<MapPin size={15} />}
            label="Hospital / Address"
            value={formData.address}
            onChange={(v) => updateField('address', v)}
            placeholder="Hospital name or full address"
          />

          {/* ── Additional Info ── */}
          <div className="form-group">
            <label className="form-label">Additional Information</label>
            <textarea
              className="form-input-field"
              rows={4}
              value={formData.additionalInfo}
              onChange={(e) => updateField('additionalInfo', e.target.value)}
              placeholder="Any relevant medical details or special requirements…"
              style={{ resize: 'vertical', minHeight: 100 }}
            />
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            className="btn-premium btn-premium-primary"
            style={{ width: '100%', padding: '16px', borderRadius: 12, fontSize: 15 }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spinSlow 1s linear infinite' }} />Submitting Appeal…</>
            ) : (
              <><CheckCircle size={18} />Submit Blood Appeal</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Helper Components ── */
function FormField({
  icon, label, value, onChange, type = 'text', placeholder = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-icon-wrap">
        <span className="input-icon">{icon}</span>
        <input
          className="form-input-field"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
