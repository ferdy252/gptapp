import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import StepsView from '../components/StepsView';

/**
 * MCP Widget Wrapper for Steps View
 * Integrates with window.openai API
 */
function StepsWidget() {
  const [plan, setPlan] = useState(null);
  const [bom, setBom] = useState(null);
  const [progress, setProgress] = useState({
    started_at: null,
    completed_steps: [],
    paused_at: null,
    actual_costs: { parts: 0, tools: 0 },
    notes: []
  });

  useEffect(() => {
    // Get data from window.openai
    if (window.openai?.toolOutput) {
      const output = window.openai.toolOutput;
      if (output.plan) setPlan(output.plan);
      if (output.bom) setBom(output.bom);
    }

    // Restore widget state if available
    if (window.openai?.widgetState) {
      setProgress(window.openai.widgetState);
    }
  }, []);

  const handleProgressUpdate = (newProgress) => {
    setProgress(newProgress);
    // Persist state back to ChatGPT
    window.openai?.setWidgetState(newProgress);
  };

  const handleClose = () => {
    // Request inline mode or send follow-up
    window.openai?.requestDisplayMode({ mode: 'inline' });
  };

  if (!plan) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading repair plan...</div>;
  }

  return (
    <StepsView 
      plan={plan}
      bom={bom}
      progress={progress}
      onProgressUpdate={handleProgressUpdate}
      onClose={handleClose}
    />
  );
}

// Mount the component
if (typeof document !== 'undefined') {
  const root = document.getElementById('steps-root');
  if (root) {
    createRoot(root).render(<StepsWidget />);
  }
}

export default StepsWidget;
