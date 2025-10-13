import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, ChevronDown, ChevronRight, CheckCircle, Circle, Play, Pause, DollarSign } from 'lucide-react';

/**
 * Steps View (Fullscreen)
 * Apps SDK Design: Fullscreen when needed, composer stays usable, accordion pattern
 * NEW: Progress tracking, timer, cost updates
 */
export default function StepsView({ plan, bom, progress, onProgressUpdate, onClose }) {
  const [expandedStep, setExpandedStep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const { steps, total_time_minutes, difficulty, risk_level } = plan;

  const toggleStep = (stepNumber) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && !progress.paused_at) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, progress.paused_at]);

  // Auto-start timer when first step is opened
  useEffect(() => {
    if (!progress.started_at && steps.length > 0) {
      onProgressUpdate(prev => ({
        ...prev,
        started_at: new Date().toISOString()
      }));
    }
  }, []);

  const handleStepComplete = (stepNumber) => {
    const isCompleted = progress.completed_steps.includes(stepNumber);
    
    onProgressUpdate(prev => ({
      ...prev,
      completed_steps: isCompleted 
        ? prev.completed_steps.filter(s => s !== stepNumber)
        : [...prev.completed_steps, stepNumber]
    }));
  };

  const toggleTimer = () => {
    if (isRunning) {
      // Pause
      onProgressUpdate(prev => ({
        ...prev,
        paused_at: new Date().toISOString()
      }));
    } else {
      // Resume
      onProgressUpdate(prev => ({
        ...prev,
        paused_at: null
      }));
    }
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completedCount = progress.completed_steps.length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const isOnTrack = elapsedMinutes <= total_time_minutes;

  return (
    <div className="card card-fullscreen">
      {/* Header with Close */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        padding: '20px 0',
        borderBottom: '1px solid #2a2a2a',
        marginBottom: '20px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h2>📋 Step-by-Step Repair Plan</h2>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ 
                background: 'rgba(124, 58, 237, 0.2)',
                color: '#7C3AED',
                border: '1px solid #7C3AED'
              }}>
                {difficulty}
              </span>
              <span style={{ fontSize: '14px', color: '#a0a0a0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                Est: {total_time_minutes} min
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: isOnTrack ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} />
                Actual: {formatTime(elapsedSeconds)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#a0a0a0' }}>Progress</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#7C3AED' }}>
                  {completedCount}/{steps.length} steps ({progressPercent}%)
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                background: '#2a2a2a', 
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #7C3AED 0%, #a78bfa 100%)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={toggleTimer}
              style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ padding: '8px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Safety Warning */}
      {(risk_level === 'medium' || risk_level === 'high') && (
        <div className="safety-notice" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p>
              <strong>Safety First:</strong> Read all steps before starting. If you're unsure at any point, stop and consult a professional.
            </p>
          </div>
        </div>
      )}

      {/* Steps Accordion */}
      <div style={{ marginBottom: '100px' }}>
        {steps.map((step) => {
          const isExpanded = expandedStep === step.step_number;
          
          return (
            <div key={step.step_number} className="accordion-item">
              <div 
                className="accordion-header"
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  {/* Completion Checkbox */}
                  <div 
                    onClick={() => handleStepComplete(step.step_number)}
                    style={{ 
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {progress.completed_steps.includes(step.step_number) ? (
                      <CheckCircle size={24} color="#10b981" fill="#10b981" />
                    ) : (
                      <Circle size={24} color="#6a6a6a" />
                    )}
                  </div>
                  
                  {/* Step Number Badge */}
                  <div style={{ 
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isExpanded ? '#7C3AED' : progress.completed_steps.includes(step.step_number) ? '#10b981' : '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'background 0.2s ease'
                  }}>
                    {step.step_number}
                  </div>
                  <div style={{ flex: 1 }} onClick={() => toggleStep(step.step_number)}>
                    <h4 style={{ margin: 0, textDecoration: progress.completed_steps.includes(step.step_number) ? 'line-through' : 'none', opacity: progress.completed_steps.includes(step.step_number) ? 0.7 : 1 }}>
                      {step.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#6a6a6a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Clock size={12} />
                      {step.duration_minutes} min
                      {progress.completed_steps.includes(step.step_number) && (
                        <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ Completed</span>
                      )}
                    </span>
                  </div>
                </div>
                <div onClick={() => toggleStep(step.step_number)} style={{ cursor: 'pointer' }}>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>
              
              <div className={`accordion-content ${!isExpanded ? 'collapsed' : ''}`}>
                {/* Description */}
                <p style={{ marginBottom: '16px' }}>{step.description}</p>

                {/* Safety Note */}
                {step.safety_note && (
                  <div style={{ 
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                      <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '13px', color: '#fbbf24' }}>
                        {step.safety_note}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tools & Parts */}
                {(step.tools_needed?.length > 0 || step.parts_needed?.length > 0) && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    marginTop: '16px'
                  }}>
                    {step.tools_needed?.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '13px', color: '#a0a0a0' }}>🔧 Tools:</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                          {step.tools_needed.map((tool, idx) => (
                            <li key={idx}>{tool}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {step.parts_needed?.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '13px', color: '#a0a0a0' }}>📦 Parts:</strong>
                        <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
                          {step.parts_needed.map((part, idx) => (
                            <li key={idx}>{part}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Footer (ChatGPT composer stays usable) */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        background: 'linear-gradient(180deg, transparent 0%, #000 20%)',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: '#6a6a6a', margin: 0 }}>
          💬 Need help? Ask me anything about these steps
        </p>
      </div>
    </div>
  );
}
