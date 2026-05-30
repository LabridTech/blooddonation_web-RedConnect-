'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, CalendarClock, CheckCircle, Loader2, MessageSquare, ShieldAlert } from 'lucide-react';
import { addBloodDonated } from '../../../redux/bloodDonatedSlice';
import { fetchNotifications, updateNotification } from '../../../redux/notificationSlice';
import { AppDispatch, RootState } from '../../../redux/store';

export default function DonorNotificationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const pendingCount = notifications.filter((item: any) => item.status === 'pending').length;

  const handleAccept = (notification: any) => {
    dispatch(addBloodDonated({
      donorId: notification.userId || notification.title || 'Donor',
      units: notification.units || 1,
      receiverId: notification.receiverId || 'Receiver',
      date: new Date().toISOString(),
    }));
    dispatch(updateNotification({
      id: notification.id,
      status: 'accepted',
      receiverId: notification.receiverId,
      message: notification.message,
    }));
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '30px' }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Donation requests and status updates.</p>
        </div>
        {pendingCount > 0 && <span className="btn-premium btn-premium-primary" style={{ cursor: 'default' }}>{pendingCount} new</span>}
      </div>

      {loading && <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)' }}><Loader2 size={18} className="heartbeat-animation" /> Loading notifications...</div>}
      {!loading && notifications.length === 0 && <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)' }}>No notifications yet.</div>}
      <section style={{ display: 'grid', gap: '14px' }}>
        {!loading && notifications.map((notification: any, index: number) => (
          <article key={notification.id || index} className="glass-panel" style={{ padding: '18px', display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: '16px', alignItems: 'start', borderLeft: notification.status === 'pending' ? '3px solid var(--primary)' : '1px solid var(--border-glass)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '999px', display: 'grid', placeItems: 'center', background: iconBg(notification.type) }}>
              {iconFor(notification.type)}
            </div>
            <div style={{ display: 'grid', gap: '6px' }}>
              <h2 style={{ fontSize: '17px' }}>{notification.title || 'Notification'}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{notification.message}</p>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{notification.time || ''}</span>
              {notification.status === 'pending' && (
                <button onClick={() => handleAccept(notification)} className="btn-premium btn-premium-success" style={{ width: 'fit-content', padding: '9px 14px' }}>
                  <CheckCircle size={16} />
                  Accept
                </button>
              )}
              {notification.status === 'accepted' && <span style={{ color: 'var(--success)', fontWeight: 700 }}>Accepted</span>}
            </div>
            {notification.status === 'pending' && <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: 'var(--primary)' }} />}
          </article>
        ))}
      </section>
    </div>
  );
}

function iconFor(type: string) {
  if (type === 'appeal_response') return <MessageSquare size={22} color="var(--accent)" />;
  if (type === 'donation_reminder') return <CalendarClock size={22} color="var(--success)" />;
  if (type === 'urgent_appeal') return <ShieldAlert size={22} color="var(--primary)" />;
  if (type === 'status_update') return <CheckCircle size={22} color="var(--warning)" />;
  return <Bell size={22} color="var(--text-secondary)" />;
}

function iconBg(type: string) {
  if (type === 'appeal_response') return 'rgba(37,99,235,.12)';
  if (type === 'donation_reminder') return 'rgba(16,185,129,.12)';
  if (type === 'urgent_appeal') return 'rgba(255,59,87,.12)';
  if (type === 'status_update') return 'rgba(245,158,11,.12)';
  return 'rgba(255,255,255,.05)';
}
