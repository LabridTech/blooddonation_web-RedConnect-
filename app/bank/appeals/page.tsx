'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchBloodAppeals } from '../../../redux/bloodAppealSlice';
import { 
  Heart, FileText, Phone, MapPin, Activity, 
  ShieldAlert, Loader2, ArrowLeft, HeartPulse 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PatientAppealsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { appeals, loading } = useSelector((state: RootState) => state.bloodAppeal);

  const [filteredAppeals, setFilteredAppeals] = useState<any[]>([]);
  const [filterUrgency, setFilterUrgency] = useState('all');

  useEffect(() => {
    dispatch(fetchBloodAppeals());
  }, [dispatch]);

  useEffect(() => {
    if (!appeals) return;
    // Filter only patient appeals
    const patients = appeals.filter(appeal => appeal.role === 'patient');
    
    if (filterUrgency === 'all') {
      setFilteredAppeals(patients);
    } else {
      setFilteredAppeals(patients.filter(appeal => appeal.urgency === filterUrgency));
    }
  }, [appeals, filterUrgency]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
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
              marginBottom: '10px',
              padding: '4px 0',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <h1 style={{ fontSize: '28px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={28} color="var(--primary)" />
            Patient Blood Appeals
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Monitor active blood donation appeals posted by patients.
          </p>
        </div>

        {/* Urgency Filter buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { value: 'all', label: 'All Appeals' },
            { value: 'Critical', label: 'Critical' },
            { value: 'Urgent', label: 'Urgent' },
            { value: 'Normal', label: 'Normal' }
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setFilterUrgency(item.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${filterUrgency === item.value ? 'var(--primary)' : 'var(--border-glass)'}`,
                background: filterUrgency === item.value ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                color: filterUrgency === item.value ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'var(--transition-smooth)'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of appeals */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={36} color="var(--primary)" className="heartbeat-animation" />
        </div>
      ) : filteredAppeals.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredAppeals.map((appeal, index) => {
            const isCritical = appeal.urgency === 'Critical';
            const isUrgent = appeal.urgency === 'Urgent';
            
            return (
              <div key={appeal.id || index} className="glass-panel" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'between',
                border: isCritical ? '1px solid rgba(255, 59, 87, 0.2)' : '1px solid var(--border-glass)'
              }}>
                {/* Appeal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HeartPulse size={20} color="var(--primary)" className="heartbeat-animation" />
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                      Type {appeal.bloodType}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    color: isCritical ? 'var(--primary)' : isUrgent ? 'var(--warning)' : 'var(--success)',
                    background: isCritical ? 'var(--primary-glow)' : isUrgent ? 'var(--warning-glow)' : 'var(--success-glow)'
                  }}>
                    {appeal.urgency}
                  </span>
                </div>

                {/* Appeal Body details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px', flex: 1 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Patient Name</span>
                    <strong style={{ color: '#fff', fontSize: '15px' }}>{appeal.patientName}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Units Required</span>
                      <strong style={{ color: '#fff', fontSize: '15px', fontFamily: 'var(--font-display)' }}>{appeal.units} Packets</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>City</span>
                      <strong style={{ color: '#fff', fontSize: '15px' }}>{appeal.city || "N/A"}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{appeal.address}, {appeal.country}</span>
                  </div>

                  {appeal.additionalInfo && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      marginTop: '6px'
                    }}>
                      "{appeal.additionalInfo}"
                    </div>
                  )}
                </div>

                {/* Action button */}
                <a 
                  href={`tel:${appeal.contactNumber}`}
                  className="btn-premium btn-premium-primary"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', gap: '8px' }}
                >
                  <Phone size={14} />
                  Call Hospital ({appeal.contactNumber})
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '6px' }}>No Appeals Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>There are currently no patient appeals matching the criteria.</p>
        </div>
      )}
    </div>
  );
}
