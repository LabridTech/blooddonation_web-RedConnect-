'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store'; // Adjust path if needed
import { fetchDonorsByCity, User } from '../../../redux/authSlice'; // Adjust path if needed
import { MapPin, Phone, Droplet, Calendar, Heart, Loader2, Users, ChevronLeft, Clock } from 'lucide-react';

const formatAvailabilityWindow = (donor: Pick<User, 'availabilityStart' | 'availabilityEnd'>) => {
    if (!donor.availabilityStart && !donor.availabilityEnd) return 'Any time';
    if (donor.availabilityStart && donor.availabilityEnd) return `${donor.availabilityStart} - ${donor.availabilityEnd}`;
    if (donor.availabilityStart) return `From ${donor.availabilityStart}`;
    return `Until ${donor.availabilityEnd}`;
};

export default function DonorCommunityPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, loading: authLoading, sameCityDonors, error } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user?.city) {
            dispatch(fetchDonorsByCity());
        }
    }, [user?.city, dispatch]);

    if (authLoading || !user) {
        return (
            <div className="glass-panel loading-state">
                <Loader2 size={20} className="heartbeat-animation" style={{ color: 'var(--primary)' }} />
                Loading community...
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Link href="/user" className="btn-premium btn-premium-secondary" style={{ padding: '8px 12px' }}>
                    <ChevronLeft size={18} /> Back
                </Link>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Donors in {user.city}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Connect with fellow lifesavers nearby</p>
                </div>
            </div>

            {error && (
                <div className="glass-panel" style={{ padding: 12, color: 'var(--primary)', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {!sameCityDonors || sameCityDonors.length === 0 ? (
                <div className="glass-panel empty-state" style={{ textAlign: 'center', padding: 40 }}>
                    <Users size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>No donors found yet</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Be the first to share your location and help build this community.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {sameCityDonors.map((donor) => (
                        <DonorDetailTile key={donor.uid} donor={donor} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Detailed Donor Tile ── */
function DonorDetailTile({ donor }: { donor: User }) {
    const total = donor.totalDonations || 0;
    const level = total >= 10 ? 'Gold' : total >= 5 ? 'Silver' : total >= 1 ? 'Bronze' : 'New';
    const levelColors: Record<string, string> = {
        Gold: '#fbbf24', Silver: '#94a3b8', Bronze: '#cd7f32', New: 'var(--text-muted)'
    };

    return (
        <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform 0.2s, box-shadow 0.2s' }}>
            {/* Avatar & Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,59,87,0.15), rgba(255,59,87,0.05))',
                    display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700,
                    color: 'var(--primary)', border: '2px solid rgba(255,59,87,0.2)'
                }}>
                    {donor.name?.charAt(0).toUpperCase() || 'D'}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{donor.name || 'Anonymous Donor'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span className="badge" style={{
                            background: `${levelColors[level]}18`, color: levelColors[level],
                            border: `1px solid ${levelColors[level]}40`, fontSize: 11, padding: '3px 8px', borderRadius: 20
                        }}>
                            {level}
                        </span>
                        <span style={{ fontSize: 13, color: donor.available ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                            {donor.available ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <DetailItem icon={<Droplet size={14} />} label="Blood Type" value={donor.bloodType || 'N/A'} />
                <DetailItem icon={<Calendar size={14} />} label="Last Donation" value={donor.lastDonation || 'Never'} />
                <DetailItem icon={<MapPin size={14} />} label="Location" value={donor.city || 'N/A'} />
                <DetailItem icon={<Heart size={14} />} label="Total Donations" value={String(total)} />
                <DetailItem icon={<Clock size={14} />} label="Available Time" value={formatAvailabilityWindow(donor)} />
            </div>

            {/* Contact Button */}
            <a
                href={donor.phone ? `tel:${donor.phone}` : '#'}
                className={`btn-premium ${donor.phone ? 'btn-premium-primary' : 'btn-premium-secondary'}`}
                style={{ width: '100%', marginTop: 8, justifyContent: 'center', padding: '10px 0', cursor: donor.phone ? 'pointer' : 'not-allowed' }}
                onClick={(e) => { if (!donor.phone) e.preventDefault(); }}
            >
                <Phone size={16} />
                {donor.phone ? `Call ${donor.phone}` : 'Contact Hidden'}
            </a>
        </div>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{value}</div>
            </div>
        </div>
    );
}
