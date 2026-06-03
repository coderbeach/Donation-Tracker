import React, { useState, useEffect } from 'react';
import { 
  Building, MapPin, Users, Flame, Plus, ShieldAlert, Heart,
  Activity, Sparkles, CheckCircle, Shield
} from 'lucide-react';
import { API_BASE } from '../App';

function CampsCenters({ role }) {
  const [camps, setCamps] = useState([]);
  const [centers, setCenters] = useState([]);
  
  // Forms state
  const [campForm, setCampForm] = useState({
    name: '', location: '', capacity: '', dogsCount: '',
    foodCost: '', medicalCost: '', maintenanceCost: ''
  });

  const [centerForm, setCenterForm] = useState({
    name: '', childrenCount: '', foodCost: '', educationCost: '',
    healthcareCost: '', utilityCost: '', staffSalaryCost: ''
  });

  const [loading, setLoading] = useState(true);
  const [submittingCamp, setSubmittingCamp] = useState(false);
  const [submittingCenter, setSubmittingCenter] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCampsAndCenters();
  }, []);

  const fetchCampsAndCenters = async () => {
    try {
      setLoading(true);
      const [campsRes, centersRes] = await Promise.all([
        fetch(`${API_BASE}/camps`),
        fetch(`${API_BASE}/centers`)
      ]);
      const campsData = await campsRes.json();
      const centersData = await centersRes.json();
      setCamps(campsData);
      setCenters(centersData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCampSubmit = async (e) => {
    e.preventDefault();
    if (!campForm.name || !campForm.location || !campForm.capacity || !campForm.dogsCount) {
      setMsg({ type: 'error', text: 'Please fill in all required camp fields.' });
      return;
    }

    try {
      setSubmittingCamp(true);
      const res = await fetch(`${API_BASE}/camps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campForm)
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Dog Camp "${campForm.name}" created successfully!` });
        setCampForm({
          name: '', location: '', capacity: '', dogsCount: '',
          foodCost: '', medicalCost: '', maintenanceCost: ''
        });
        fetchCampsAndCenters();
      }
      setSubmittingCamp(false);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to create camp.' });
      setSubmittingCamp(false);
    }
  };

  const handleCenterSubmit = async (e) => {
    e.preventDefault();
    if (!centerForm.name || !centerForm.childrenCount) {
      setMsg({ type: 'error', text: 'Please fill in all required center fields.' });
      return;
    }

    try {
      setSubmittingCenter(true);
      const res = await fetch(`${API_BASE}/centers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(centerForm)
      });
      if (res.ok) {
        setMsg({ type: 'success', text: `Orphan Center "${centerForm.name}" created successfully!` });
        setCenterForm({
          name: '', childrenCount: '', foodCost: '', educationCost: '',
          healthcareCost: '', utilityCost: '', staffSalaryCost: ''
        });
        fetchCampsAndCenters();
      }
      setSubmittingCenter(false);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to create center.' });
      setSubmittingCenter(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Loading facilities & operating units...</div>
      </div>
    );
  }

  // Aggregate totals
  const totalDogs = camps.reduce((sum, c) => sum + c.dogsCount, 0);
  const totalChildren = centers.reduce((sum, c) => sum + c.childrenCount, 0);
  const totalCampsCost = camps.reduce((sum, c) => sum + c.monthlyTotalCost, 0);
  const totalCentersCost = centers.reduce((sum, c) => sum + c.monthlyTotalCost, 0);

  return (
    <div>
      {/* Overview Aggregations Bar */}
      <section className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-header"><span>Dogs Rescued</span><Activity size={18} /></div>
          <div className="metric-value">{totalDogs}</div>
          <div className="metric-subtitle">Across {camps.length} active camps</div>
        </div>
        <div className="metric-card" style={{ borderColor: 'var(--color-secondary)' }}>
          <div className="metric-header"><span>Orphans Supported</span><Heart size={18} /></div>
          <div className="metric-value">{totalChildren}</div>
          <div className="metric-subtitle">Across {centers.length} centers</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span>Dog Camps Budget</span><Building size={18} /></div>
          <div className="metric-value">₹{totalCampsCost.toLocaleString()}</div>
          <div className="metric-subtitle">Monthly food & healthcare</div>
        </div>
        <div className="metric-card" style={{ borderColor: 'var(--color-secondary)' }}>
          <div className="metric-header"><span>Orphans Budget</span><Building size={18} /></div>
          <div className="metric-value">₹{totalCentersCost.toLocaleString()}</div>
          <div className="metric-subtitle">Monthly food & education</div>
        </div>
      </section>

      {/* Messages */}
      {msg.text && (
        <div className={`ai-alert-item ${msg.type === 'success' ? 'success' : 'critical'}`} style={{ marginBottom: '2rem' }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
          <div className="ai-alert-content"><p>{msg.text}</p></div>
        </div>
      )}

      {/* Split Camp & Center View Panels */}
      <section className="split-view-container">
        
        {/* LEFT COLUMN: DOG RESCUE CAMPS */}
        <div className="split-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h2 style={{ fontWeight: 700 }}>Dog Rescue Camps ({camps.length})</h2>
          </div>

          {/* New Camp Form */}
          {role !== 'VOLUNTEER' && (
            <div className="form-card">
              <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} />
                Register New Dog Camp
              </h3>
              <form onSubmit={handleCampSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Camp Name *</label>
                    <input type="text" className="form-control" placeholder="e.g. Hope For Paws" value={campForm.name} onChange={(e) => setCampForm({...campForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input type="text" className="form-control" placeholder="e.g. West Hills, Pune" value={campForm.location} onChange={(e) => setCampForm({...campForm, location: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Capacity *</label>
                    <input type="number" className="form-control" placeholder="Max dogs capacity" value={campForm.capacity} onChange={(e) => setCampForm({...campForm, capacity: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Dogs Count *</label>
                    <input type="number" className="form-control" placeholder="Current dogs" value={campForm.dogsCount} onChange={(e) => setCampForm({...campForm, dogsCount: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Monthly Food Cost (₹) *</label>
                    <input type="number" className="form-control" placeholder="Food cost" value={campForm.foodCost} onChange={(e) => setCampForm({...campForm, foodCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Medical Cost (₹) *</label>
                    <input type="number" className="form-control" placeholder="Medical cost" value={campForm.medicalCost} onChange={(e) => setCampForm({...campForm, medicalCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Maintenance Cost (₹) *</label>
                    <input type="number" className="form-control" placeholder="Maintenance cost" value={campForm.maintenanceCost} onChange={(e) => setCampForm({...campForm, maintenanceCost: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={submittingCamp}>
                  {submittingCamp ? 'Saving...' : 'Add Dog Camp'}
                </button>
              </form>
            </div>
          )}

          {/* Camps Grid Cards */}
          {camps.map(camp => (
            <div className="metric-card" key={camp.id} style={{ display: 'block', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{camp.name}</h4>
                <span className="badge success">CAMP ACTIVE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} />
                  <span>{camp.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} />
                  <span>Assigned Volunteers: <strong>{camp.volunteersAssigned}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={16} />
                  <span>Dogs Occupancy: <strong>{camp.dogsCount} / {camp.capacity}</strong> ({Math.round((camp.dogsCount / camp.capacity) * 100)}% capacity)</span>
                </div>
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Monthly Cost Breakdown:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Food Supply:</span> <strong>₹{camp.foodCost.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Medical Care:</span> <strong>₹{camp.medicalCost.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Maintenance:</span> <strong>₹{camp.maintenanceCost.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)', fontWeight: 700, marginTop: '0.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.25rem' }}>
                    <span>Total monthly cost:</span> <span>₹{camp.monthlyTotalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: ORPHAN WELFARE CENTERS */}
        <div className="split-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '0.5rem' }}>
            <Sparkles size={20} color="var(--color-secondary)" />
            <h2 style={{ fontWeight: 700 }}>Orphan Support Centers ({centers.length})</h2>
          </div>

          {/* New Center Form */}
          {role !== 'VOLUNTEER' && (
            <div className="form-card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
              <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} />
                Register New Orphan Center
              </h3>
              <form onSubmit={handleCenterSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Center Name *</label>
                    <input type="text" className="form-control" placeholder="e.g. Hope Children's Center" value={centerForm.name} onChange={(e) => setCenterForm({...centerForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Children Count *</label>
                    <input type="number" className="form-control" placeholder="Current children" value={centerForm.childrenCount} onChange={(e) => setCenterForm({...centerForm, childrenCount: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Monthly Food Cost (₹) *</label>
                    <input type="number" className="form-control" placeholder="Food cost" value={centerForm.foodCost} onChange={(e) => setCenterForm({...centerForm, foodCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Education Cost (₹) *</label>
                    <input type="number" className="form-control" placeholder="Education cost" value={centerForm.educationCost} onChange={(e) => setCenterForm({...centerForm, educationCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Healthcare Cost (₹) *</label>
                    <input type="number" className="form-control" placeholder="Healthcare cost" value={centerForm.healthcareCost} onChange={(e) => setCenterForm({...centerForm, healthcareCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Utility Cost (₹) *</label>
                    <input type="number" className="form-control" placeholder="Utility cost" value={centerForm.utilityCost} onChange={(e) => setCenterForm({...centerForm, utilityCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Staff Salaries (₹) *</label>
                    <input type="number" className="form-control" placeholder="Staff salaries" value={centerForm.staffSalaryCost} onChange={(e) => setCenterForm({...centerForm, staffSalaryCost: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--color-secondary)' }} disabled={submittingCenter}>
                  {submittingCenter ? 'Saving...' : 'Add Orphan Center'}
                </button>
              </form>
            </div>
          )}

          {/* Centers Grid Cards */}
          {centers.map(center => (
            <div className="metric-card" key={center.id} style={{ display: 'block', padding: '1.5rem', borderColor: 'var(--color-secondary-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{center.name}</h4>
                <span className="badge success" style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>CENTER ACTIVE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} />
                  <span>Children Enrolled: <strong>{center.childrenCount}</strong></span>
                </div>
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Monthly Cost Breakdown:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Food & Nutrition:</span> <strong>₹{center.foodCost.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>School Education:</span> <strong>₹{center.educationCost.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Healthcare Support:</span> <strong>₹{center.healthcareCost.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Utilities & Bills:</span> <strong>₹{center.utilityCost.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Staff & Care Salaries:</span> <strong>₹{center.staffSalaryCost.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-secondary)', fontWeight: 700, marginTop: '0.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.25rem' }}>
                    <span>Total monthly cost:</span> <span>₹{center.monthlyTotalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CampsCenters;
