import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Cycles from './pages/Cycles';
import Summary from './pages/Summary';
import Harvests from './pages/Harvests';
import Import from './pages/Import';
import PondDetail from './pages/PondDetail';
import Crud from './pages/Crud';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPondCode, setSelectedPondCode] = useState<string>('');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedPondCode={setSelectedPondCode} 
          />
        );
      case 'cycles':
        return (
          <Cycles 
            setSelectedPondCode={setSelectedPondCode} 
            setActiveTab={setActiveTab} 
          />
        );
      case 'summary':
        return <Summary />;
      case 'harvests':
        return <Harvests />;
      case 'import':
        return <Import />;
      case 'crud':
        return <Crud />;
      case 'pondDetail':
        return <PondDetail pondCode={selectedPondCode} />;
      default:
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedPondCode={setSelectedPondCode} 
          />
        );
    }
  };

  return (
    <div className="flex bg-cofimar-bg text-cofimar-text min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        selectedPondCode={selectedPondCode || undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 bg-cofimar-bg min-h-screen overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
