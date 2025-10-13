import React from 'react';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

/**
 * Issue Summary Card (Inline)
 * Apps SDK Design: Simple card, max 2 actions, no nested scrolling
 */
export default function IssueSummary({ diagnosis, onViewSteps, onGetQuotes }) {
  const {
    issue_type,
    risk_level,
    recommendation,
    confidence,
    safety_concerns,
    summary,
    diy_disabled,
    safety_gate
  } = diagnosis;

  const isDIY = recommendation === 'diy';
  const isHighRisk = risk_level === 'critical' || risk_level === 'high';

  return (
    <div className="card card-inline">
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2>{issue_type}</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
          <span className={isDIY ? 'badge badge-diy' : 'badge badge-hire'}>
            {isDIY ? '✓ DIY Possible' : '⚠ Hire Professional'}
          </span>
          <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
            {risk_level} Risk
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', color: '#a0a0a0' }}>Diagnosis Confidence</span>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{confidence}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${confidence}%` }}></div>
        </div>
      </div>

      {/* Summary */}
      <p>{summary}</p>

      {/* Safety Gate Warning */}
      {safety_gate && (
        <div className="safety-notice">
          <p><strong>⚠️ SAFETY ALERT:</strong> {safety_gate}</p>
        </div>
      )}

      {/* Risk Callout */}
      {safety_concerns && safety_concerns.length > 0 && (
        <div style={{ 
          background: 'rgba(124, 58, 237, 0.1)', 
          border: '1px solid #7C3AED', 
          borderRadius: '8px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
            <AlertTriangle size={18} color="#7C3AED" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#7C3AED', fontSize: '14px' }}>Key Safety Concerns:</strong>
              <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>
                {safety_concerns[0]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions (Max 2 per Apps SDK guidelines) */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Primary Action */}
        {isDIY && !diy_disabled ? (
          <button 
            className="btn btn-primary" 
            onClick={onViewSteps}
          >
            See Steps
            <ArrowRight size={16} />
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={onGetQuotes}
          >
            Get 3 Quotes
            <ArrowRight size={16} />
          </button>
        )}

        {/* Secondary Action */}
        {isDIY && !diy_disabled && (
          <button 
            className="btn btn-secondary" 
            onClick={onGetQuotes}
          >
            Get Quotes Instead
          </button>
        )}
      </div>

      {/* Disabled DIY Notice */}
      {diy_disabled && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <p style={{ color: '#fca5a5', margin: 0 }}>
            ⛔ DIY repair is disabled for your safety. This repair requires professional expertise.
          </p>
        </div>
      )}
    </div>
  );
}
