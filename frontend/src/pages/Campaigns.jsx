import React, { useState, useEffect } from 'react';
import { 
  Target, Heart, Users, Award, Plus, Sparkles, CheckCircle, 
  AlertCircle, ChevronRight, TrendingUp, Coins
} from 'lucide-react';
import { API_BASE } from '../App';

function Campaigns({ role }) {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({ title: '', goal: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/campaigns`);
      const data = await res.json();
      setCampaigns(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.goal) {
      setMsg({ type: 'error', text: 'Please fill in all campaign fields.' });
      return;
    }

    try {
      setSubmitting(true);
      setMsg({ type: '', text: '' });

      const res = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error('Failed to create campaign');
      }

      setMsg({ type: 'success', text: `Campaign "${form.title}" launched successfully!` });
      setForm({ title: '', goal: '' });
      fetchCampaigns();
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to create campaign.' });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Loading active campaigns...</div>
      </div>
    );
  }

  // Aggregate stats
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goal, 0);
  const totalRaised = campaigns.reduce((sum, c) => sum + c.amountRaised, 0);
  const overallProgress = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;
  const totalDonors = campaigns.reduce((sum, c) => sum + c.donorsCount, 0);

  return (
    <div>
      {/* Campaign Aggregate Banner */}
      <section className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-header"><span>Fundraising Target</span><Target size={18} /></div>
          <div className="metric-value">₹{totalGoal.toLocaleString()}</div>
          <div className="metric-subtitle">Total campaign target</div>
        </div>
        <div className="metric-card" style={{ borderColor: 'var(--color-secondary)' }}>
          <div className="metric-header"><span>Total Raised</span><Coins size={18} /></div>
          <div className="metric-value">₹{totalRaised.toLocaleString()}</div>
          <div className="metric-subtitle positive">Progress: {overallProgress}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span>Campaign Donors</span><Users size={18} /></div>
          <div className="metric-value">{totalDonors}</div>
          <div className="metric-subtitle">Unique support instances</div>
        </div>
        <div className="metric-card" style={{ borderColor: 'var(--color-secondary)' }}>
          <div className="metric-header"><span>Active Campaigns</span><Award size={18} /></div>
          <div className="metric-value">{campaigns.length}</div>
          <div className="metric-subtitle">Running programs</div>
        </div>
      </section>

      {/* Messages */}
      {msg.text && (
        <div className={`ai-alert-item ${msg.type === 'success' ? 'success' : 'critical'}`} style={{ marginBottom: '2rem' }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div className="ai-alert-content"><p>{msg.text}</p></div>
        </div>
      )}

      {/* Main Grid: Form Left, Cards Grid Right */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        
        {/* Launch Campaign Form */}
        <div>
          <div className="form-card">
            <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} />
              Launch Campaign
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Campaign Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-control" 
                  placeholder="e.g. Save A Paw" 
                  value={form.title} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Fundraising Target Goal (₹) *</label>
                <input 
                  type="number" 
                  name="goal" 
                  className="form-control" 
                  placeholder="₹ Target Goal" 
                  value={form.goal} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              {role === 'VOLUNTEER' ? (
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled>
                  Access Restricted (Managers only)
                </button>
              ) : (
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Launching...' : 'Create Campaign'}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Campaigns Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
          {campaigns.map(c => {
            const percent = Math.min(100, Math.round((c.amountRaised / c.goal) * 100));
            return (
              <div className="metric-card" key={c.id} style={{ display: 'block', padding: '1.5rem', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{c.title}</h4>
                  <span className="badge success">{percent}%</span>
                </div>
                
                {/* Progress bar animation */}
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${percent}%` }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target Goal:</span> <strong>₹{c.goal.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Amount Raised:</span> <strong style={{ color: 'var(--color-secondary)' }}>₹{c.amountRaised.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Donors Count:</span> <strong>{c.donorsCount} people</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>
    </div>
  );
}

export default Campaigns;
