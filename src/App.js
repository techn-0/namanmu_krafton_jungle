// src/App.js
import React from 'react';
import ExerciseGraph from './components/ExerciseGraph';

function App() {
  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
      <ExerciseGraph />
    </div>
  );
}

export default App;
