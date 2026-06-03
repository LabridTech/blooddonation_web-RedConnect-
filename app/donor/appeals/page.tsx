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
    <>
      <style>{`
        .appeals-page {
          display: grid;
          gap: 24px;
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .appeals-header h1 {
          font-size: 30px;
          margin: 0 0 6px 0;
        }

        .appeals-header p {
          color: var(--text-secondary);
          margin: 0;
          font-size: 15px;
        }

        .appeals-filter-panel {
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 160px;
          gap: 12px;
          align-items: center;
        }

        .appeals-search-wrapper {
          position: relative;
        }

        .appeals-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .appeals-search-input {
          width: 100%;
          box-sizing: border-box;
          padding-left: 42px !important;
        }

        .appeals-urgency-select {
          width: 100%;
          box-sizing: border-box;
        }

        .appeals-status-panel {
          padding: 20px 24px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
        }

        .appeals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .appeal-card {
          padding: 20px;
          display: grid;
          gap: 12px;
        }

        .appeal-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .appeal-blood-type {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          color: var(--primary);
          font-weight: 800;
          font-size: 16px;
        }

        .appeal-urgency {
          font-weight: 700;
          font-size: 14px;
          white-space: nowrap;
        }

        .appeal-patient-name {
          font-size: 18px;
          margin: 0;
        }

        .appeal-info {
          color: var(--text-secondary);
          font-size: 14px;
          min-height: 40px;
          margin: 0;
          line-height: 1.5;
        }

        .appeal-contact-grid {
          display: grid;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .appeal-location {
          display: inline-flex;
          gap: 8px;
          align-items: flex-start;
          line-height: 1.4;
          word-break: break-word;
        }

        .appeal-location svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .appeal-phone-link {
          color: var(--primary);
          display: inline-flex;
          gap: 8px;
          align-items: center;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        .appeal-phone-link:hover {
          opacity: 0.8;
        }

        /* Tablet */
        @media (max-width: 768px) {
          .appeals-page {
            gap: 16px;
            padding: 12px;
          }

          .appeals-header h1 {
            font-size: 24px;
          }

          .appeals-filter-panel {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .appeals-urgency-select {
            max-width: 100%;
          }

          .appeals-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }

        /* Mobile */
        @media (max-width: 520px) {
          .appeals-page {
            padding: 10px;
            gap: 14px;
          }

          .appeals-header h1 {
            font-size: 20px;
          }

          .appeals-header p {
            font-size: 13px;
          }

          .appeals-filter-panel {
            padding: 14px;
          }

          .appeals-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .appeal-card {
            padding: 16px;
          }

          .appeal-patient-name {
            font-size: 16px;
          }

          .appeal-info {
            min-height: unset;
          }

          .appeals-status-panel {
            padding: 16px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="appeals-page">
        {/* Header */}
        <div className="appeals-header">
          <h1>Blood Appeals</h1>
          <p>Review active patient and bank requests.</p>
        </div>

        {/* Filters */}
        <section className="glass-panel appeals-filter-panel">
          <div className="appeals-search-wrapper">
            <span className="appeals-search-icon">
              <Search size={16} />
            </span>
            <input
              className="form-input-field appeals-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blood type, city, patient..."
            />
          </div>
          <select
            className="form-input-field appeals-urgency-select"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="all">All Urgency</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="Normal">Normal</option>
          </select>
        </section>

        {/* Loading */}
        {loading && (
          <div className="glass-panel appeals-status-panel">
            <Loader2 size={18} className="heartbeat-animation" />
            Loading appeals...
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="glass-panel appeals-status-panel">
            No appeals match your filters.
          </div>
        )}

        {/* Cards Grid */}
        {!loading && filtered.length > 0 && (
          <section className="appeals-grid">
            {filtered.map((appeal: any, index: number) => (
              <article
                key={appeal.id || index}
                className="glass-panel glass-panel-interactive appeal-card"
              >
                {/* Blood type + urgency */}
                <div className="appeal-card-header">
                  <span className="appeal-blood-type">
                    <Droplet size={18} fill="var(--primary)" />
                    {appeal.bloodType}
                  </span>
                  <span
                    className="appeal-urgency"
                    style={{
                      color:
                        appeal.urgency === 'Critical'
                          ? 'var(--primary)'
                          : appeal.urgency === 'Urgent'
                            ? 'var(--warning, #f59e0b)'
                            : 'var(--success)',
                    }}
                  >
                    {appeal.urgency}
                  </span>
                </div>

                {/* Patient name */}
                <h2 className="appeal-patient-name">
                  {appeal.patientName || 'Patient'}
                </h2>

                {/* Additional info */}
                <p className="appeal-info">
                  {appeal.additionalInfo || 'No additional information provided.'}
                </p>

                {/* Location + contact */}
                <div className="appeal-contact-grid">
                  <span className="appeal-location">
                    <MapPin size={16} />
                    {appeal.address || appeal.city || 'Location not provided'}
                  </span>
                  {appeal.contactNumber && (
                    <a
                      href={`tel:${appeal.contactNumber}`}
                      className="appeal-phone-link"
                    >
                      <Phone size={16} />
                      {appeal.contactNumber}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </>
  );
}