import React, { useState, useEffect } from 'react';
import IssueSummary from './components/IssueSummary';
import PartsAndTools from './components/PartsAndTools';
import StepsView from './components/StepsView';
import OutcomeReport from './components/OutcomeReport';

function App() {
  const [currentView, setCurrentView] = useState('summary');
  const [diagnosis, setDiagnosis] = useState(null);
  const [bom, setBom] = useState(null);
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState({
    started_at: null,
    completed_steps: [],
    paused_at: null,
    actual_costs: { parts: 0, tools: 0 },
    notes: []
  });
  
  // Outcome report state
  const [showOutcome, setShowOutcome] = useState(false);

  // Mock data for development (replace with actual MCP tool responses)
  const mockDiagnosis = {
    issue_type: 'Leaking Kitchen Faucet',
    risk_level: 'low',
    recommendation: 'diy',
    confidence: 85,
    safety_concerns: ['Turn off water supply before starting', 'Protect sink surface from tools'],
    summary: 'The faucet appears to be leaking from the base, likely due to worn O-rings or cartridge seals. This is a common DIY repair that most homeowners can complete with basic tools.',
    diy_disabled: false
  };

  const mockBom = {
    parts: [
      { name: 'Faucet Repair Kit', category: 'part', quantity: 1, unit: 'kit', price_min: 8.99, price_max: 15.99, optional: false, notes: 'Universal fit for most faucets', have_it: false },
      { name: 'Plumber\'s Grease', category: 'part', quantity: 1, unit: 'tube', price_min: 3.99, price_max: 6.99, optional: false, notes: 'Silicone-based', have_it: false },
      { name: 'Teflon Tape', category: 'part', quantity: 1, unit: 'roll', price_min: 1.99, price_max: 3.99, optional: true, notes: 'For threaded connections', have_it: false }
    ],
    tools: [
      { name: 'Adjustable Wrench', category: 'tool', quantity: 1, price_min: 10.00, price_max: 25.00, optional: false, notes: '8-10 inch recommended', have_it: false },
      { name: 'Screwdriver Set', category: 'tool', quantity: 1, price_min: 15.00, price_max: 40.00, optional: false, notes: 'Phillips and flathead', have_it: false },
      { name: 'Flashlight', category: 'tool', quantity: 1, price_min: 8.00, price_max: 20.00, optional: true, notes: 'For under-sink visibility', have_it: false }
    ],
    total_cost_min: 47.97,
    total_cost_max: 111.97
  };

  const mockPlan = {
    steps: [
      { step_number: 1, title: 'Shut Off Water Supply', description: 'Locate the shut-off valves under the sink and turn them clockwise until fully closed. Test by trying to turn on the faucet.', duration_minutes: 5, safety_note: 'Keep towels ready in case of residual water', tools_needed: [], parts_needed: [] },
      { step_number: 2, title: 'Remove Faucet Handle', description: 'Use a screwdriver to remove the decorative cap and handle screw. Carefully lift off the handle.', duration_minutes: 10, safety_note: 'Don\'t force; handles can be fragile', tools_needed: ['Screwdriver Set'], parts_needed: [] },
      { step_number: 3, title: 'Replace O-rings and Seals', description: 'Remove old O-rings with a flathead screwdriver. Clean the grooves and apply plumber\'s grease to new O-rings before installing.', duration_minutes: 15, safety_note: 'Keep small parts organized', tools_needed: ['Screwdriver Set'], parts_needed: ['Faucet Repair Kit', 'Plumber\'s Grease'] },
      { step_number: 4, title: 'Reassemble Faucet', description: 'Reinstall all components in reverse order. Tighten screws firmly but don\'t over-tighten.', duration_minutes: 10, safety_note: 'Align parts correctly before tightening', tools_needed: ['Screwdriver Set', 'Adjustable Wrench'], parts_needed: [] },
      { step_number: 5, title: 'Test for Leaks', description: 'Turn water supply back on slowly. Run faucet for 2 minutes and check for leaks at base and connections.', duration_minutes: 10, safety_note: 'Watch for drips under sink', tools_needed: ['Flashlight'], parts_needed: [] }
    ],
    total_time_minutes: 50,
    difficulty: 'Beginner',
    risk_level: 'low'
  };

  // Load mock data on mount
  useEffect(() => {
    setDiagnosis(mockDiagnosis);
    setBom(mockBom);
    setPlan(mockPlan);
  }, []);
  
  // Check if repair is complete and show outcome report
  useEffect(() => {
    if (plan && progress.completed_steps.length === plan.steps.length && progress.completed_steps.length > 0) {
      // All steps completed - optionally auto-show outcome report
      // setShowOutcome(true); // Uncomment to auto-show
    }
  }, [progress.completed_steps, plan]);

  const handleViewChange = (view) => {
    setCurrentView(view);
  };
  
  // Handle outcome submission
  const handleOutcomeSubmit = async (outcomeData) => {
    // In production: call submit_outcome MCP tool
    console.log('Outcome submitted:', outcomeData);
    // const result = await submitOutcome(outcomeData);
    // OutcomeReport handles its own closing now
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>🔧 Home Repair Diagnosis</h1>
      
      {currentView === 'summary' && diagnosis && (
        <IssueSummary 
          diagnosis={diagnosis}
          onViewSteps={() => handleViewChange('steps')}
          onGetQuotes={() => alert('Quote request - requires user confirmation')}
        />
      )}

      {currentView === 'summary' && bom && (
        <>
          <PartsAndTools 
            bom={bom}
            onToggleHave={(category, index) => {
              const newBom = { ...bom };
              newBom[category][index].have_it = !newBom[category][index].have_it;
              setBom(newBom);
            }}
            onExport={() => alert('Export list (CSV/PDF)')}
            onOpenSteps={() => handleViewChange('steps')}
          />
          
          {/* Report Outcome Button - Simple and clear */}
          <button 
            className="btn btn-primary"
            onClick={() => setShowOutcome(true)}
            style={{ marginTop: '16px', width: '100%' }}
          >
            📊 Report Repair Outcome
          </button>
        </>
      )}

      {currentView === 'steps' && plan && (
        <StepsView 
          plan={plan}
          bom={bom}
          progress={progress}
          onProgressUpdate={setProgress}
          onClose={() => handleViewChange('summary')}
        />
      )}
      
      {/* NEW: Outcome Report */}
      {showOutcome && (
        <OutcomeReport 
          diagnosis={diagnosis}
          plan={plan}
          onSubmit={handleOutcomeSubmit}
          onClose={() => setShowOutcome(false)}
        />
      )}
    </div>
  );
}

export default App;
