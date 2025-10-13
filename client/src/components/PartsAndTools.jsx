import React from 'react';
import { Download, ArrowRight } from 'lucide-react';

/**
 * Parts & Tools Card (Inline)
 * Apps SDK Design: Simple table, toggles, max 2 actions
 */
export default function PartsAndTools({ bom, onToggleHave, onExport, onOpenSteps }) {
  const { parts, tools, total_cost_min, total_cost_max } = bom;
  
  const allItems = [
    ...parts.map(p => ({ ...p, category: 'parts' })),
    ...tools.map(t => ({ ...t, category: 'tools' }))
  ];

  const calculateCurrentCost = () => {
    const neededItems = allItems.filter(item => !item.have_it);
    const min = neededItems.reduce((sum, item) => sum + item.price_min, 0);
    const max = neededItems.reduce((sum, item) => sum + item.price_max, 0);
    return { min, max };
  };

  const { min: currentMin, max: currentMax } = calculateCurrentCost();
  const hasAllItems = allItems.every(item => item.have_it);

  return (
    <div className="card card-inline">
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3>📦 Parts & Tools Checklist</h3>
        <p style={{ fontSize: '14px', color: '#a0a0a0', marginTop: '4px' }}>
          Estimated cost: <strong style={{ color: '#fff' }}>
            ${currentMin.toFixed(2)} - ${currentMax.toFixed(2)}
          </strong>
          {hasAllItems && <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ All items ready!</span>}
        </p>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price Range</th>
              <th>I Have This</th>
            </tr>
          </thead>
          <tbody>
            {allItems.map((item, idx) => {
              const categoryIndex = item.category === 'parts' 
                ? parts.findIndex(p => p.name === item.name)
                : tools.findIndex(t => t.name === item.name);
              
              return (
                <tr key={`${item.category}-${idx}`}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.optional && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: '#7C3AED' 
                      }}>
                        (optional)
                      </span>
                    )}
                    <br />
                    <span style={{ fontSize: '12px', color: '#6a6a6a' }}>
                      {item.notes}
                    </span>
                  </td>
                  <td>
                    {item.quantity} {item.unit || 'pc'}
                  </td>
                  <td>
                    ${item.price_min.toFixed(2)} - ${item.price_max.toFixed(2)}
                  </td>
                  <td>
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={item.have_it}
                        onChange={() => onToggleHave(item.category, categoryIndex)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        background: '#1a1a1a',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px'
      }}>
        <span>Parts: {parts.length} • Tools: {tools.length}</span>
        <span>
          <strong>Still need:</strong> {allItems.filter(i => !i.have_it).length} items
        </span>
      </div>

      {/* Actions (Max 2) */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '16px',
        flexWrap: 'wrap'
      }}>
        <button 
          className="btn btn-primary" 
          onClick={onExport}
        >
          <Download size={16} />
          Export List
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={onOpenSteps}
        >
          Open Steps
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
