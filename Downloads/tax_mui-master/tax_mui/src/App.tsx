import React from 'react';
import TaxCalculatorApp from './component/TaxCalculatorApp';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color, #f9fafb)',
      color: 'var(--text-color, #1f2937)',
      transition: 'all 0.3s ease'
    }}>
      <TaxCalculatorApp />
    </div>
  );
}

export default App;
