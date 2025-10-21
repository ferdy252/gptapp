import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import IssueSummary from '../components/IssueSummary';
import PartsAndTools from '../components/PartsAndTools';

/**
 * MCP Widget Wrapper for Diagnosis
 * Integrates with window.openai API
 */
function DiagnosisWidget() {
  const [diagnosis, setDiagnosis] = useState(null);
  const [bom, setBom] = useState(null);

  useEffect(() => {
    // Get data from window.openai
    if (window.openai?.toolOutput) {
      const output = window.openai.toolOutput;
      if (output.diagnosis) setDiagnosis(output.diagnosis);
      if (output.bom) setBom(output.bom);
    }
  }, []);

  const handleViewSteps = () => {
    // Trigger follow-up to show steps
    window.openai?.sendFollowUpMessage({
      prompt: 'Show me the step-by-step repair plan'
    });
  };

  const handleGetQuotes = () => {
    // Trigger quote request tool
    window.openai?.callTool('request_quotes', {
      zip: '00000', // Will be replaced by actual user input
      scope: diagnosis?.summary || '',
      confirmed: false
    });
  };

  if (!diagnosis) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <IssueSummary 
        diagnosis={diagnosis}
        onViewSteps={handleViewSteps}
        onGetQuotes={handleGetQuotes}
      />
      
      {bom && (
        <PartsAndTools 
          bom={bom}
          onToggleHave={() => {}}
          onExport={() => {}}
          onOpenSteps={handleViewSteps}
        />
      )}
    </div>
  );
}

// Mount the component
if (typeof document !== 'undefined') {
  const root = document.getElementById('diagnosis-root');
  if (root) {
    createRoot(root).render(<DiagnosisWidget />);
  }
}

export default DiagnosisWidget;
