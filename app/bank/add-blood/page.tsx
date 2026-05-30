'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addBlood } from '../../../redux/bloodSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import { Droplet, Calendar, User, FileText, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AddBloodScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [selectedType, setSelectedType] = useState('');
  const [units, setUnits] = useState('');
  const [donorName, setDonorName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddBlood = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!selectedType) {
      setErrorMsg("Please select a blood type.");
      return;
    }

    if (!units || isNaN(Number(units)) || Number(units) <= 0) {
      setErrorMsg("Please enter a valid number of units.");
      return;
    }

    if (!donorName.trim()) {
      setErrorMsg("Please enter the donor's name.");
      return;
    }

    if (!expiryDate) {
      setErrorMsg("Please select a valid expiry date.");
      return;
    }

    setLoading(true);

    dispatch(addBlood({
      donorName,
      bloodType: selectedType,
      units: Number(units),
      expiryDate: new Date(expiryDate).toISOString(),
      email: user?.email,
      token
    })).unwrap().then(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form fields
      setSelectedType('');
      setUnits('');
      setDonorName('');
      setExpiryDate('');
      
      setTimeout(() => {
        router.push("/bank");
      }, 1500);
    }).catch((err) => {
      setLoading(false);
      setErrorMsg(err || "Failed to add blood units to inventory.");
    });
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <button 
        onClick={() => router.push('/bank')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          cursor: 'pointer',
          marginBottom: '20px',
          padding: '4px 0',
          transition: 'var(--transition-smooth)'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '36px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--primary-glow)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 59, 87, 0.2)'
          }}>
            <Droplet size={24} color="var(--primary)" fill="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', color: '#fff' }}>Add Blood to Storage</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Log new incoming donation packets</p>
          </div>
        </div>

        {/* Feedback Panels */}
        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '13px',
            marginBottom: '24px',
            fontWeight: 500
          }}>
            {errorMsg}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '8px',
            color: 'var(--success)',
            fontSize: '13px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500
          }}>
            <CheckCircle size={16} />
            Blood packet catalogued successfully! Redirecting...
          </div>
        )}

        {/* Add Blood Form */}
        <form onSubmit={handleAddBlood} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Blood Type Grid Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Blood Type Group</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px'
            }}>
              {bloodTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: selectedType === type ? 'var(--primary-glow)' : 'rgba(15,20,34,0.4)',
                    border: `1px solid ${selectedType === type ? 'var(--primary)' : 'var(--border-glass)'}`,
                    color: selectedType === type ? 'var(--primary)' : '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  className={selectedType === type ? '' : 'glass-panel-interactive'}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Units */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Number of Units (Packets)</label>
            <div style={{ position: 'relative' }}>
              <Droplet size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="number"
                className="form-input-field"
                placeholder="Enter number of units"
                value={units}
                onChange={e => setUnits(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
                min="1"
              />
            </div>
          </div>

          {/* Donor Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Donor Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-input-field"
                placeholder="Enter donor's full name"
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Expiry Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="date"
                className="form-input-field"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn-premium btn-premium-primary"
            style={{ width: '100%', padding: '14px', borderRadius: '8px', marginTop: '12px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="heartbeat-animation" />
                Adding to Inventory...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Add to Inventory
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
