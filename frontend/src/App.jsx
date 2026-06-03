import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Home, 
  Users2, 
  Calculator, 
  Target, 
  BarChart3, 
  Sun, 
  Moon, 
  ShieldAlert,
  BellRing
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import CampsCenters from './pages/CampsCenters';
import Volunteers from './pages/Volunteers';
import SurvivalCalculator from './pages/SurvivalCalculator';
import Campaigns from './pages/Campaigns';

export const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark'); // Default to dark mode for rich premium styling
  const [role, setRole] = useState('ADMIN'); // Simulated roles: ADMIN, MANAGER, VOLUNTEER
  const [emergencyAlert, setEmergencyAlert] = useState(true); // Pre-activated for demo effect

  // Sync theme attribute with document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const triggerEmergencySOS = () => {
    if (emergencyAlert) {
      setEmergencyAlert(false);
      alert('Emergency Alert resolved. All search groups notified.');
    } else {
      const location = prompt('Enter Rescue Location:', 'Sector 15, Metro Crossing');
      if (location) {
        setEmergencyAlert(true);
        alert(`🚨 EMERGENCY SOS BROADCASTED! Dispatch teams are moving to: ${location}`);
      }
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard role={role} setActiveTab={setActiveTab} />;
      case 'donations':
        return <Donations role={role} />;
      case 'camps':
        return <CampsCenters role={role} />;
      case 'volunteers':
        return <Volunteers role={role} />;
      case 'calculator':
        return <SurvivalCalculator role={role} />;
      case 'campaigns':
        return <Campaigns role={role} />;
      default:
        return <Dashboard role={role} setActiveTab={setActiveTab} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'donations', label: 'Donations', icon: HeartHandshake },
    { id: 'camps', label: 'Camps & Centers', icon: Home },
    { id: 'volunteers', label: 'Volunteers', icon: Users2 },
    { id: 'calculator', label: 'Survival Calculator', icon: Calculator },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <HeartHandshake size={24} />
          </div>
          <span className="logo-text">PawHope Foundation</span>
        </div>

        <ul className="nav-links">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <a 
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">
              {role[0]}
            </div>
            <div className="user-info">
              <span className="user-name">
                {role === 'ADMIN' ? 'Admin Panel' : role === 'MANAGER' ? 'Manager Panel' : 'Volunteer View'}
              </span>
              <span className="user-role">{role} Mode</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Console */}
      <main className="main-content">
        {/* Dashboard Top bar */}
        <header className="header-bar">
          <div className="header-title-area">
            <h1>PawHope Foundation</h1>
            <p>Donation Allocation, Shelter Camps & Orphan Welfare Operations</p>
          </div>

          <div className="header-controls">
            {/* Role Switcher */}
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="role-selector"
              title="Change User Access Level"
            >
              <option value="ADMIN">🔧 Role: Admin</option>
              <option value="MANAGER">📈 Role: Manager</option>
              <option value="VOLUNTEER">🤝 Role: Volunteer</option>
            </select>

            {/* Emergency SOS simulation */}
            <button 
              className="btn-icon" 
              onClick={triggerEmergencySOS} 
              title={emergencyAlert ? "Resolve SOS Alert" : "Trigger Emergency Rescue Alert"}
              style={{ borderColor: emergencyAlert ? 'var(--danger)' : 'var(--border-color)' }}
            >
              <BellRing size={20} color={emergencyAlert ? 'var(--danger)' : 'currentColor'} />
            </button>

            {/* Dark Mode Toggle */}
            <button className="btn-icon" onClick={toggleTheme} title="Toggle Light/Dark Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* SOS Alert Banner */}
        {emergencyAlert && (
          <div className="emergency-banner">
            <div className="emergency-info">
              <div className="emergency-dot"></div>
              <ShieldAlert size={24} />
              <div>
                <h4>ACTIVE SOS ALERT: Dog Rescue Needed at Sector 15 Metro Crossing</h4>
                <p>Severe stray injury reported. 3 volunteers dispatched. Ambulance status: EN ROUTE</p>
              </div>
            </div>
            {role !== 'VOLUNTEER' && (
              <button className="btn-emergency-action" onClick={triggerEmergencySOS}>
                Mark Resolved
              </button>
            )}
          </div>
        )}

        {/* Render current subpage */}
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
