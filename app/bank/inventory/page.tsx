'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Calendar, Droplet, Loader2, User } from 'lucide-react';
import { fetchBloodRequests } from '../../../redux/bloodSlice';
import { AppDispatch, RootState } from '../../../redux/store';

export default function BankInventoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { requests, loading } = useSelector((state: RootState) => state.blood);

  useEffect(() => {
    dispatch(fetchBloodRequests());
  }, [dispatch]);

  const inventory = requests.filter((stock: any) => stock.email === user?.email);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '30px' }}>Blood Inventory Status</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Current stock levels for your blood bank.</p>
      </div>

      {loading && <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)' }}><Loader2 size={18} className="heartbeat-animation" /> Loading inventory...</div>}
      {!loading && inventory.length === 0 && <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)' }}>No inventory entries yet.</div>}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {!loading && inventory.map((stock: any, index: number) => {
          const status = getStockStatus(Number(stock.units || 0));
          const statusColor = getStatusColor(status);
          return (
            <article key={stock.id || index} className="glass-panel glass-panel-interactive" style={{ padding: '20px', borderColor: statusColor, display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: '28px', fontWeight: 800 }}>{stock.bloodType}</span>
                {status === 'critical' ? <AlertTriangle size={22} color={statusColor} /> : <Droplet size={22} color={statusColor} fill={statusColor} />}
              </div>
              <strong style={{ color: statusColor, fontSize: '20px' }}>{stock.units} units</strong>
              <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', gap: '8px', alignItems: 'center' }}><User size={16} />Donor: {stock.donorName || 'Unknown'}</span>
              <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}><Calendar size={16} />Expiry: {stock.expiryDate ? new Date(stock.expiryDate).toLocaleDateString() : 'Not set'}</span>
            </article>
          );
        })}
      </section>

      <section className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
        <Legend color="var(--success)" label="Normal (>20 units)" />
        <Legend color="var(--warning)" label="Low (6-20 units)" />
        <Legend color="var(--primary)" label="Critical (5 units or less)" />
      </section>
    </div>
  );
}

function getStockStatus(units: number) {
  if (units <= 5) return 'critical';
  if (units <= 20) return 'low';
  return 'normal';
}

function getStatusColor(status: string) {
  if (status === 'critical') return 'var(--primary)';
  if (status === 'low') return 'var(--warning)';
  return 'var(--success)';
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ width: '12px', height: '12px', borderRadius: '999px', background: color }} />
      {label}
    </span>
  );
}
