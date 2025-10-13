import React, { useState } from 'react';
import { CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

/**
 * Outcome Report Component - SIMPLIFIED for Apps SDK Compliance
 * Step 1: Outcome (2 actions max)
 * Step 2: Optional rating (2 actions max)
 * Step 3: Thank you
 */
export default function OutcomeReport({ diagnosis, plan, onSubmit, onClose }) {
  const [step, setStep] = useState(1);
  const [outcome, setOutcome] = useState(null);
  const [wouldRecommend, setWouldRecommend] = useState(null);

  // Step 1: Quick outcome
  if (step === 1) {
    return (
      <div className="card card-inline">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
          <h3 style={{ marginBottom: '8px' }}>How Did It Go?</h3>
          <p style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '32px' }}>
            Your feedback helps improve the app
          </p>

          {/* 2 PRIMARY ACTIONS */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setOutcome('success');
                setStep(2);
              }}
              style={{ flex: 1, padding: '16px' }}
            >
              <CheckCircle size={20} style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '16px', fontWeight: '600' }}>✅ Success</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Fixed it myself</div>
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setOutcome('hired_pro');
                setStep(2);
              }}
              style={{ flex: 1, padding: '16px' }}
            >
              <div style={{ fontSize: '16px', fontWeight: '600' }}>👷 Got Help</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Hired a pro</div>
            </button>
          </div>

          {/* Skip option (text link, not counted as action) */}
          <button 
            onClick={onClose}
            style={{ 
              marginTop: '16px',
              background: 'none',
              border: 'none',
              color: '#6a6a6a',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Optional quick rating
  if (step === 2) {
    return (
      <div className="card card-inline">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {outcome === 'success' ? '🎉' : '👍'}
          </div>
          <h3 style={{ marginBottom: '8px' }}>
            {outcome === 'success' ? 'Awesome!' : 'Smart Choice!'}
          </h3>
          <p style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '32px' }}>
            {outcome === 'success' 
              ? 'Would you recommend DIY for this repair?' 
              : 'Using a professional was the right call'}
          </p>

          {/* 2 PRIMARY ACTIONS */}
          {outcome === 'success' ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setWouldRecommend(true);
                  handleSubmit(true);
                }}
                style={{ flex: 1, padding: '16px' }}
              >
                <ThumbsUp size={20} />
                <div style={{ marginTop: '8px' }}>Yes, Recommend</div>
              </button>
              
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setWouldRecommend(false);
                  handleSubmit(false);
                }}
                style={{ flex: 1, padding: '16px' }}
              >
                <ThumbsDown size={20} />
                <div style={{ marginTop: '8px' }}>No, Too Hard</div>
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={() => handleSubmit(null)}
              style={{ width: '100%', padding: '16px' }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // Step 3: Success/Thank you
  if (step === 3) {
    return (
      <div className="card card-inline">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
          <h3 style={{ marginBottom: '8px' }}>Thanks for Your Feedback!</h3>
          <p style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '24px' }}>
            {outcome === 'success' 
              ? '92% of users successfully completed this repair.' 
              : 'Hiring professionals ensures quality work.'}
          </p>

          {/* Community Insight */}
          <div style={{
            padding: '16px',
            background: '#1a1a1a',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>
              💡 Community Insight
            </div>
            <div style={{ fontSize: '14px' }}>
              {outcome === 'success' 
                ? 'Your success helps others gain confidence in DIY repairs!' 
                : 'Knowing when to call a pro is an important skill.'}
            </div>
          </div>

          {/* 1 PRIMARY ACTION */}
          <button 
            className="btn btn-primary" 
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Helper function
  function handleSubmit(recommend) {
    const data = {
      diagnosis_id: diagnosis?.id || `diag_${Date.now()}`,
      outcome,
      would_recommend_diy: recommend,
      // Optionally add plan metadata
      estimated_time: plan?.total_time_minutes,
      difficulty: plan?.difficulty
    };

    console.log('Outcome submitted:', data);
    
    // Call the MCP tool
    if (onSubmit) {
      onSubmit(data);
    }
    
    // Show success
    setStep(3);
  }

  return null;
}
