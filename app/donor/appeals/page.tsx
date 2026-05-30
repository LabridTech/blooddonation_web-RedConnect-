'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Droplet, Loader2, MapPin, Phone, Search } from 'lucide-react';
import { fetchBloodAppeals } from '../../../redux/bloodAppealSlice';
import { AppDispatch, RootState } from '../../../redux/store';

export default function DonorAppealsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { appeals, loading } = useSelector((state: RootState) => state.bloodAppeal);
  const [query, setQuery] = useState('');
  const [urgency, setUrgency] = useState('all');

  useEffect(() => {
    dispatch(fetchBloodAppeals());
  }, [dispatch]);

  const filtered = appeals.filter((appeal: any) => {
    const searchText = `${appeal.bloodType} ${appeal.patientName} ${appeal.city} ${appeal.address}`.toLowerCase();
    const queryMatches = searchText.includes(query.toLowerCase());
    const urgencyMatches = urgency === 'all' || appeal.urgency === urgency;
    return queryMatches && urgencyMatches && appeal.status !== 'Completed';
  });

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '30px' }}>Blood Appeals</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review active patient and bank requests.</p>
      </div>

      <section className="glass-panel" style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 180px', gap: '12px' }}>
        <label style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
          <input className="form-input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blood type, city, patient..." style={{ paddingLeft: '42px' }} />
        </label>
        <select className="form-input-field" value={urgency} onChange={(event) => setUrgency(event.target.value)}>
          <option value="all">All Urgency</option>
          <option value="Critical">Critical</option>
          <option value="Urgent">Urgent</option>
          <option value="Normal">Normal</option>
        </select>
      </section>

      {loading && <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)' }}><Loader2 size={18} className="heartbeat-animation" /> Loading appeals...</div>}
      {!loading && filtered.length === 0 && <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)' }}>No appeals match your filters.</div>}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {!loading && filtered.map((appeal: any, index: number) => (
          <article key={appeal.id || index} className="glass-panel glass-panel-interactive" style={{ padding: '20px', display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', color: 'var(--primary)', fontWeight: 800 }}>
                <Droplet size={18} fill="var(--primary)" />
                {appeal.bloodType}
              </span>
              <span style={{ color: appeal.urgency === 'Critical' ? 'var(--primary)' : 'var(--success)', fontWeight: 700 }}>{appeal.urgency}</span>
            </div>
            <h2 style={{ fontSize: '18px' }}>{appeal.patientName || 'Patient'}</h2>
            <p style={{ color: 'var(--text-secondary)', minHeight: '42px' }}>{appeal.additionalInfo || 'No additional information provided.'}</p>
            <div style={{ color: 'var(--text-secondary)', display: 'grid', gap: '8px', fontSize: '14px' }}>
              <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}><MapPin size={16} />{appeal.address || appeal.city || 'Location not provided'}</span>
              {appeal.contactNumber && <a href={`tel:${appeal.contactNumber}`} style={{ color: 'var(--primary)', display: 'inline-flex', gap: '8px', alignItems: 'center', textDecoration: 'none' }}><Phone size={16} />{appeal.contactNumber}</a>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
