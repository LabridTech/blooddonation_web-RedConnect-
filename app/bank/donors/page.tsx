'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { addNotification } from '../../../redux/notificationSlice';
import { fetchBloodDonated } from '../../../redux/bloodDonatedSlice';
import { addFeedback, fetchFeedback } from '../../../redux/feedbackSlice';
import axios from 'axios';
import { API_URL } from '../../../config';
import { 
  Users, Search, Filter, Phone, Mail, MessageSquare, Star, 
  MapPin, Trophy, Calendar, Check, X, ShieldAlert, Loader2, Award, Droplet 
} from 'lucide-react';

export default function DonorSearchScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { donations } = useSelector((state: RootState) => state.bloodDonated);
  const { feedbacks } = useSelector((state: RootState) => state.feedback);

  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('all');

  // Notification Modal state
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any | null>(null);
  const [units, setUnits] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState<{ show: boolean; text: string; success: boolean }>({ show: false, text: '', success: false });

  // Feedback Modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackDonor, setFeedbackDonor] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{ show: boolean; text: string; success: boolean }>({ show: false, text: '', success: false });

  // Triggering visual status alerts
  const showStatus = (setter: React.Dispatch<React.SetStateAction<any>>, text: string, success: boolean) => {
    setter({ show: true, text, success });
    setTimeout(() => {
      setter({ show: false, text: '', success: false });
    }, 3000);
  };

  const loadData = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/auth/findAll`)
      .then(res => {
        const matchingDonors = res.data.filter((u: any) => u.role === 'donor');
        setDonors(matchingDonors);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading donors:", err);
        setLoading(false);
      });
    dispatch(fetchBloodDonated());
    dispatch(fetchFeedback());
  };

  useEffect(() => {
    loadData();
  }, []);

  const daysSinceLastDonation = (lastDonationStr: string) => {
    if (!lastDonationStr) return "No donations logged";
    try {
      const today = new Date();
      // Safe parsing of custom string if mobile passed space-separated date, else standard ISO
      let lastDonationDate: Date;
      if (lastDonationStr.includes(' ')) {
        const [day, month, year] = lastDonationStr.split(' ');
        const monthMap: Record<string, number> = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        lastDonationDate = new Date(parseInt(year), monthMap[month], parseInt(day));
      } else {
        lastDonationDate = new Date(lastDonationStr);
      }

      if (isNaN(lastDonationDate.getTime())) return "Never";
      const diffTime = Math.abs(today.getTime() - lastDonationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 6050 * 24));
      return `${diffDays} days ago`;
    } catch {
      return "Never";
    }
  };

  // Submit Donation Appeal Notification Request
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!units || isNaN(Number(units)) || Number(units) <= 0) {
      showStatus(setNotifyStatus, "Please enter a valid unit number.", false);
      return;
    }

    setNotifyLoading(true);
    dispatch(addNotification({
      userId: user?.email,
      receiverId: selectedDonor.email,
      message: `Blood Bank ${user?.name} is requesting a blood donation of ${units} unit(s).`,
      status: 'pending',
      units: Number(units)
    }))
      .unwrap()
      .then(() => {
        setNotifyLoading(false);
        showStatus(setNotifyStatus, "Donation request sent successfully!", true);
        setUnits('');
        setTimeout(() => setNotifyModalOpen(false), 1500);
      })
      .catch(() => {
        setNotifyLoading(false);
        showStatus(setNotifyStatus, "Failed to send donation request.", false);
      });
  };

  // Submit Feedback on Matched Donors
  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      showStatus(setFeedbackStatus, "Please enter your review message.", false);
      return;
    }
    if (feedbackRating === 0) {
      showStatus(setFeedbackStatus, "Please select a star rating.", false);
      return;
    }

    setFeedbackLoading(true);
    dispatch(addFeedback({
      userId: feedbackDonor.email,
      message: feedbackText,
      rating: feedbackRating
    }))
      .unwrap()
      .then(() => {
        setFeedbackLoading(false);
        showStatus(setFeedbackStatus, "Feedback submitted successfully!", true);
        setFeedbackText('');
        setFeedbackRating(0);
        setTimeout(() => {
          setFeedbackModalOpen(false);
          loadData(); // reload to show the feedback immediately
        }, 1500);
      })
      .catch(() => {
        setFeedbackLoading(false);
        showStatus(setFeedbackStatus, "Failed to submit feedback.", false);
      });
  };

  // Filtering Donor List
  const filteredDonors = donors.filter(d => {
    const nameMatches = d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const bloodMatches = bloodFilter ? d.blood_type === bloodFilter : true;
    const availMatches = availFilter === 'all' ? true : availFilter === 'available' ? d.available : !d.available;
    return nameMatches && bloodMatches && availMatches;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} color="var(--primary)" />
            Search Blood Donors
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Search registered donors, request direct donations, and review donation testimonials.
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '20px', color: 'var(--primary)', fontWeight: 600, fontSize: '13px', background: 'var(--primary-glow)' }}>
          {donors.filter(d => d.available).length} Donors Available
        </div>
      </div>

      {/* ─── SEARCH & FILTER BOARD ─── */}
      <div className="glass-panel" style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px',
      }} id="search-filter-grid">
        {/* Search query input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input-field"
            placeholder="Search donors by name or street address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>

        {/* Dynamic Filters Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Blood Type Filter */}
          <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
            <Filter size={14} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <select
              className="form-input-field"
              value={bloodFilter}
              onChange={e => setBloodFilter(e.target.value)}
              style={{ paddingLeft: '36px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px' }}
            >
              <option value="" style={{ background: '#0f1422' }}>All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                <option key={b} value={b} style={{ background: '#0f1422' }}>Type {b}</option>
              ))}
            </select>
          </div>

          {/* Availability Status Filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { value: 'all', label: 'All Donors' },
              { value: 'available', label: 'Available' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setAvailFilter(item.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${availFilter === item.value ? 'var(--primary)' : 'var(--border-glass)'}`,
                  background: availFilter === item.value ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                  color: availFilter === item.value ? 'var(--primary)' : 'var(--text-secondary)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DONORS CARD CONTAINER ─── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={36} color="var(--primary)" className="heartbeat-animation" />
        </div>
      ) : filteredDonors.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredDonors.map((donor, idx) => {
            const isAvail = donor.available;
            
            // Check if transaction exists between donor and bank
            const canReview = donations.some(d => 
              (d.donorId === donor.email && d.receiverId === user?.email) ||
              (d.donorId === user?.email && d.receiverId === donor.email)
            );

            // Filter feedbacks for this donor
            const donorReviews = feedbacks.filter(fb => fb.userId === donor.email);

            return (
              <div key={donor.id || idx} className="glass-panel" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'between',
                border: isAvail ? '1px solid rgba(16,185,129,0.1)' : '1px solid var(--border-glass)'
              }}>
                {/* Card Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--primary)'
                    }}>
                      {donor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', color: '#fff', lineHeight: 1.2 }}>{donor.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Droplet size={12} color="var(--primary)" fill="var(--primary)" />
                        <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>Blood Type: {donor.blood_type}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: isAvail ? 'var(--success-glow)' : 'rgba(255,255,255,0.05)',
                    color: isAvail ? 'var(--success)' : 'var(--text-muted)',
                    border: `1px solid ${isAvail ? 'var(--success)' : 'transparent'}`
                  }}>
                    {isAvail ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Card Body details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{donor.address}, {donor.city}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>Last Donation: {daysSinceLastDonation(donor.lastDonation)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>Total Donations: {donor.totalDonations || 0} made</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a 
                    href={`tel:${donor.phone}`}
                    className="btn-premium btn-premium-secondary"
                    style={{ padding: '10px', fontSize: '13px', borderRadius: '8px' }}
                  >
                    <Phone size={14} />
                    Call Donor
                  </a>
                  
                  <button 
                    onClick={() => {
                      setSelectedDonor(donor);
                      setNotifyModalOpen(true);
                    }}
                    className="btn-premium btn-premium-primary"
                    style={{ padding: '10px', fontSize: '13px', borderRadius: '8px', background: 'var(--accent)', boxShadow: '0 4px 15px -3px rgba(37,99,235,0.2)' }}
                  >
                    <Mail size={14} />
                    Ask for Donation
                  </button>

                  {canReview && (
                    <button 
                      onClick={() => {
                        setFeedbackDonor(donor);
                        setFeedbackModalOpen(true);
                      }}
                      className="btn-premium btn-premium-secondary"
                      style={{ padding: '10px', fontSize: '13px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)' }}
                    >
                      <MessageSquare size={14} />
                      Write Review
                    </button>
                  )}
                </div>

                {/* Existing Reviews Section */}
                {donorReviews.length > 0 && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '12px', color: '#fff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Donor Reviews</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {donorReviews.map((fb: any, i: number) => (
                        <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '12px' }}>
                          <p style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>"{fb.message}"</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--warning)', fontWeight: 600 }}>
                            <Star size={10} fill="var(--warning)" />
                            <span>{fb.rating} / 5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <ShieldAlert size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '6px' }}>No Donors Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* ─── DONATION UNITS MODAL ─── */}
      {notifyModalOpen && selectedDonor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Ask Donation</h3>
              <button onClick={() => setNotifyModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {notifyStatus.show && (
              <div style={{
                padding: '10px 14px',
                background: notifyStatus.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${notifyStatus.success ? 'var(--success)' : '#ef4444'}`,
                color: notifyStatus.success ? 'var(--success)' : '#ef4444',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: 500
              }}>{notifyStatus.text}</div>
            )}

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              You are requesting a blood donation from <strong>{selectedDonor.name}</strong> ({selectedDonor.blood_type}).
            </p>

            <form onSubmit={handleSendRequest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Number of Units Required</label>
                <input 
                  type="number"
                  className="form-input-field"
                  placeholder="e.g. 2"
                  value={units}
                  onChange={e => setUnits(e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setNotifyModalOpen(false)} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                <button type="submit" disabled={notifyLoading} className="btn-premium btn-premium-primary" style={{ flex: 1, padding: '10px' }}>
                  {notifyLoading ? <Loader2 size={16} className="heartbeat-animation" /> : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REVIEW MODAL ─── */}
      {feedbackModalOpen && feedbackDonor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Review Donor</h3>
              <button onClick={() => setFeedbackModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {feedbackStatus.show && (
              <div style={{
                padding: '10px 14px',
                background: feedbackStatus.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${feedbackStatus.success ? 'var(--success)' : '#ef4444'}`,
                color: feedbackStatus.success ? 'var(--success)' : '#ef4444',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: 500
              }}>{feedbackStatus.text}</div>
            )}

            <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Star Rating select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Select Star Rating</span>
                <div className="star-rating-container">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFeedbackRating(num)}
                      className="star-rating-btn"
                    >
                      <Star 
                        size={28} 
                        color={feedbackRating >= num ? "var(--warning)" : "var(--text-muted)"}
                        fill={feedbackRating >= num ? "var(--warning)" : "transparent"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message review */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Review Description</label>
                <textarea 
                  className="form-input-field"
                  placeholder="Share details about the donor's responsiveness and support..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  style={{ minHeight: '80px', resize: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setFeedbackModalOpen(false)} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                <button type="submit" disabled={feedbackLoading} className="btn-premium btn-premium-success" style={{ flex: 1, padding: '10px' }}>
                  {feedbackLoading ? <Loader2 size={16} className="heartbeat-animation" /> : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {styleQueryFix()}
    </div>
  );
}

// Media Query Style adjustments inline handler
function styleQueryFix() {
  return (
    <style>{`
      @media (min-width: 768px) {
        #search-filter-grid {
          grid-template-columns: 1fr auto !important;
        }
      }
    `}</style>
  );
}
