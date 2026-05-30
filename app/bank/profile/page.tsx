'use client';

import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Droplet, HeartPlus, LogOut, Mail, MapPin, Phone, PlusCircle, ToggleLeft, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutUser, updateAvailable, updateLastDonation, updateTotalDonations } from '../../../redux/authSlice';
import { AppDispatch, RootState } from '../../../redux/store';

export default function BankProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser()).unwrap().then(() => router.push('/'));
  };

  const toggleAvailable = () => {
    if (!user?.email) return;
    dispatch(updateAvailable({ available: !user.available }));
  };

  const recordDonation = () => {
    if (!user?.email) return;
    dispatch(updateTotalDonations({ totalDonations: (user.totalDonations || 0) + 1 }));
    dispatch(updateLastDonation({ lastDonation: new Date().toISOString() }));
  };

  if (loading || !user) {
    return <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'grid', gap: '24px' }}>
      <section className="glass-panel" style={{ padding: '28px', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '14px', display: 'grid', placeItems: 'center', background: 'var(--primary-glow)', border: '1px solid rgba(255,59,87,.2)' }}>
            <User size={30} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '30px' }}>{user.name || 'Blood Bank'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{user.role}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Info icon={<Droplet size={16} />} label="Blood Type" value={user.bloodType || 'Not set'} />
          <Info icon={<Mail size={16} />} label="Email" value={user.email || 'Not set'} />
          <Info icon={<Phone size={16} />} label="Phone" value={user.phone || 'Not set'} />
          <Info icon={<MapPin size={16} />} label="Location" value={[user.city, user.country].filter(Boolean).join(', ') || 'Not set'} />
          <Info icon={<Calendar size={16} />} label="Last Donation" value={user.lastDonation || 'N/A'} />
          <Info icon={<HeartPlus size={16} />} label="Total Donations" value={String(user.totalDonations || 0)} />
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '24px', display: 'grid', gap: '12px' }}>
        <h2 style={{ fontSize: '20px' }}>Profile Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/bank/add-blood" className="btn-premium btn-premium-primary"><PlusCircle size={18} />Add Blood</Link>
          <Link href="/bank/appeal" className="btn-premium btn-premium-secondary"><HeartPlus size={18} />Create Appeal</Link>
          <button onClick={toggleAvailable} className="btn-premium btn-premium-secondary"><ToggleLeft size={18} />{user.available ? 'Set Unavailable' : 'Set Available'}</button>
          <button onClick={recordDonation} className="btn-premium btn-premium-secondary"><HeartPlus size={18} />Record Donation</button>
          <button onClick={handleLogout} className="btn-premium btn-premium-secondary"><LogOut size={18} />Logout</button>
        </div>
      </section>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,.03)', display: 'grid', gap: '6px' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>{icon}{label}</span>
      <strong style={{ color: '#fff', overflowWrap: 'anywhere' }}>{value}</strong>
    </div>
  );
}
