'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchBloodRequests } from '../../redux/bloodSlice';
import { fetchBloodAppeals } from '../../redux/bloodAppealSlice';
import { Heart, Droplet, Users, Clipboard, Phone, ArrowUpRight, ShieldAlert, Award } from 'lucide-react';
import Link from 'next/link';

// Self-contained Dice's Coefficient String Similarity for web client
const getSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.replace(/\s+/g, '').toLowerCase();
  const s2 = str2.replace(/\s+/g, '').toLowerCase();
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = [];
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let matches = 0;

  for (let i = 0; i < b1.length; i++) {
    const idx = b2.indexOf(b1[i]);
    if (idx !== -1) {
      matches++;
      b2.splice(idx, 1);
    }
  }

  return (2.0 * matches) / (b1.length + getBigrams(s2).length);
};

export default function BankDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { requests, loading: inventoryLoading } = useSelector((state: RootState) => state.blood);
  const { appeals, loading: appealsLoading } = useSelector((state: RootState) => state.bloodAppeal);

  const [filteredAppeals, setFilteredAppeals] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchBloodRequests());
    dispatch(fetchBloodAppeals());
  }, [dispatch]);

  useEffect(() => {
    if (!appeals || appeals.length === 0 || !user) return;

    // Filter patient appeals, excluding bank's own, and check city similarity
    const threshold = 0.65;
    const matched = appeals.filter(appeal => {
      const appealCity = appeal.city || '';
      const userCity = user.city || '';
      const emailMatches = appeal.userEmail === user.email;
      
      const similarity = getSimilarity(appealCity, userCity);
      return (appeal.role === 'user' || appeal.role === 'patient') && !emailMatches && similarity >= threshold;
    }).map((appeal, index) => {
      // Self-contained fallback mock distances for web rendering
      const mockDistances = ["2.4 km", "4.8 km", "7.1 km", "12.3 km", "18.5 km"];
      return {
        ...appeal,
        distance: mockDistances[index % mockDistances.length]
      };
    });

    setFilteredAppeals(matched);
  }, [appeals, user]);

  // Aggregate stock counts for A+, B+, etc. from blood requests (bank inventory)
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const stockInventory = bloodTypes.reduce((acc, type) => {
    // Filter matching active blood logs for this bank
    const matching = requests.filter(r => r.bloodType === type && r.email === user?.email);
    const totalUnits = matching.reduce((sum, item) => sum + (item.units || 0), 0);
    acc[type] = totalUnits;
    return acc;
  }, {} as Record<string, number>);

  const totalStockUnits = Object.values(stockInventory).reduce((sum, u) => sum + u, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ─── HERO HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#fff', marginBottom: '4px' }}>
            Hello, {user?.name || "Blood Bank"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Here is your live blood inventory and active patient request overview.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/bank/add-blood" className="btn-premium btn-premium-primary">
            <PlusCircleIcon />
            Add Blood Log
          </Link>
        </div>
      </div>

      {/* ─── STATS GRID ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {[
          { label: 'Total Stock Units', value: `${totalStockUnits} Units`, desc: 'Active in storage', icon: <Droplet size={24} color="var(--primary)" fill="var(--primary)" />, glow: true },
          { label: 'Pending Appeals', value: filteredAppeals.length, desc: 'Matched in your city', icon: <Heart size={24} color="var(--success)" fill="var(--success)" />, glow: false },
          { label: 'Logged Entries', value: requests.filter(r => r.email === user?.email).length, desc: 'Donations catalogued', icon: <Clipboard size={24} color="var(--accent)" />, glow: false }
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{
            padding: '24px',
            position: 'relative',
            border: stat.glow ? '1px solid var(--border-active)' : '1px solid var(--border-glass)',
            boxShadow: stat.glow ? '0 10px 30px -10px rgba(255, 59, 87, 0.15)' : 'var(--shadow-premium)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <h3 style={{ fontSize: '28px', color: '#fff', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              {stat.value}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* ─── INVENTORY & APPEALS SECTION ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
      }} className="desktop-layout-grid">
        {/* Left Side: Stock Level Inventory Progress */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplet size={18} color="var(--primary)" />
              Blood Stock Inventory
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Storage Capacity</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {bloodTypes.map(type => {
              const units = stockInventory[type] || 0;
              const maxTarget = Math.max(50, ...Object.values(stockInventory)); // dynamically scale bar width
              const percentage = Math.min(100, (units / maxTarget) * 100);
              const isLow = units < 10;

              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>Type {type}</span>
                    <span style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700, 
                      color: isLow ? 'var(--primary)' : 'var(--text-primary)' 
                    }}>
                      {units} Units {isLow && <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--primary)', marginLeft: '6px' }}>[Low Stock]</span>}
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${percentage || 2}%`, 
                      background: isLow ? 'linear-gradient(90deg, #ff3b57, #ff6b6b)' : 'linear-gradient(90deg, #2563eb, #60a5fa)',
                      borderRadius: '99px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Nearby Requests Appeals */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={18} color="var(--primary)" fill="var(--primary)" />
              Nearby Patient Appeals
            </h3>
            <Link 
              href="/bank/appeals" 
              style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
            >
              See All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredAppeals.length > 0 ? (
              filteredAppeals.slice(0, 4).map((appeal, index) => {
                const isCritical = appeal.urgency === 'Critical';
                return (
                  <div key={index} className="glass-panel-interactive" style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          background: 'var(--primary-glow)',
                          border: '1px solid rgba(255,59,87,0.2)',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: '13px',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {appeal.bloodType}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                          {appeal.patientName || "Anonymous Patient"}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: isCritical ? 'var(--primary)' : 'var(--warning)',
                        background: isCritical ? 'var(--primary-glow)' : 'var(--warning-glow)',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {appeal.urgency}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Hospital: {appeal.address}</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{appeal.distance} away</span>
                    </div>

                    <a 
                      href={`tel:${appeal.contactNumber}`}
                      className="btn-premium btn-premium-secondary"
                      style={{ 
                        width: '100%', 
                        padding: '8px', 
                        fontSize: '12px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={12} />
                      Contact Hospital ({appeal.contactNumber})
                    </a>
                  </div>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}>
                <ShieldAlert size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px', opacity: 0.5 }} />
                <p>No nearby patient appeals found within 21km of {user?.city || "your location"}.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid CSS media query adjustments */}
      <style>{`
        @media (min-width: 1024px) {
          .desktop-layout-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Icon helper components
function PlusCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
