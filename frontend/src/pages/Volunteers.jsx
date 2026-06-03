import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, ShieldCheck, Heart, 
  Award, Clock, Calendar, Sparkles, CheckCircle, AlertCircle
} from 'lucide-react';
import { API_BASE } from '../App';

function Volunteers({ role }) {
  const [volunteers, setVolunteers] = useState([]);
  const [camps, setCamps] = useState([]);
  
  // Search / Filter states
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '',
    age: '',
    skills: '',
    availability: 'WEEKENDS',
    assignedCampId: '',
    hoursContributed: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchVolunteers();
    fetchCamps();
  }, [search, availability]);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (availability) query.append('availability', availability);

      const res = await fetch(`${API_BASE}/volunteers?${query.toString()}`);
      const data = await res.json();
      setVolunteers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCamps = async () => {
    try {
      const res = await fetch(`${API_BASE}/camps`);
      const data = await res.json();
      setCamps(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.skills || !form.availability) {
      setMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    try {
      setSubmitting(true);
      setMsg({ type: '', text: '' });

      const res = await fetch(`${API_BASE}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error('Failed to register volunteer');
      }

      setMsg({ type: 'success', text: `Volunteer "${form.name}" registered successfully!` });
      
      setForm({
        name: '',
        age: '',
        skills: '',
        availability: 'WEEKENDS',
        assignedCampId: '',
        hoursContributed: ''
      });

      fetchVolunteers();
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to register volunteer.' });
      setSubmitting(false);
    }
  };

  const totalHours = volunteers.reduce((sum, v) => sum + v.hoursContributed, 0);
  const avgAge = volunteers.length > 0 
    ? Math.round(volunteers.reduce((sum, v) => sum + v.age, 0) / volunteers.length) 
    : 0;

  return (
    <div>
      {/* Volunteer Aggregate Stats */}
      <section className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-header"><span>Total Volunteers</span><Users size={18} /></div>
          <div className="metric-value">{volunteers.length}</div>
          <div className="metric-subtitle">Active helper directory</div>
        </div>
        <div className="metric-card" style={{ borderColor: 'var(--color-secondary)' }}>
          <div className="metric-header"><span>Total Contributed</span><Clock size={18} /></div>
          <div className="metric-value">{totalHours.toLocaleString()} hrs</div>
          <div className="metric-subtitle">Aggregate helper hours logged</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span>Average Age</span><Calendar size={18} /></div>
          <div className="metric-value">{avgAge} yrs</div>
          <div className="metric-subtitle">Community demographic</div>
        </div>
        <div className="metric-card" style={{ borderColor: 'var(--color-secondary)' }}>
          <div className="metric-header"><span>Active Campaigns</span><Award size={18} /></div>
          <div className="metric-value">4</div>
          <div className="metric-subtitle">Fundraising structures aligned</div>
        </div>
      </section>

      {/* Filter and Action bar */}
      <section className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon-inside" size={18} />
          <input 
            type="text" 
            placeholder="Search volunteers by name..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          className="form-control" 
          value={availability} 
          onChange={(e) => setAvailability(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">All Availabilities</option>
          <option value="WEEKENDS">Weekends only</option>
          <option value="WEEKDAYS">Weekdays only</option>
          <option value="FULL_TIME">Full Time Commitment</option>
        </select>
      </section>

      {/* Success / Error Messages */}
      {msg.text && (
        <div className={`ai-alert-item ${msg.type === 'success' ? 'success' : 'critical'}`} style={{ marginBottom: '2rem' }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div className="ai-alert-content"><p>{msg.text}</p></div>
        </div>
      )}

      {/* Main Grid: Form Left, Table Right */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        
        {/* Register Volunteer Form */}
        <div>
          <div className="form-card">
            <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--color-primary)" />
              Register Volunteer
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  placeholder="e.g. Ramesh Patel"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Age *</label>
                <input 
                  type="number" 
                  name="age"
                  className="form-control" 
                  placeholder="Age"
                  value={form.age}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Skills / Expertise *</label>
                <input 
                  type="text" 
                  name="skills"
                  className="form-control" 
                  placeholder="e.g. Animal Care, Teaching, Nursing"
                  value={form.skills}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Availability *</label>
                <select 
                  name="availability"
                  className="form-control" 
                  value={form.availability}
                  onChange={handleInputChange}
                >
                  <option value="WEEKENDS">Weekends only</option>
                  <option value="WEEKDAYS">Weekdays only</option>
                  <option value="FULL_TIME">Full Time Commitment</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Assign to Shelter Camp</label>
                <select 
                  name="assignedCampId"
                  className="form-control" 
                  value={form.assignedCampId}
                  onChange={handleInputChange}
                >
                  <option value="">No Camp Assignment</option>
                  {camps.map(camp => (
                    <option key={camp.id} value={camp.id}>{camp.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Initial Hours Contributed</label>
                <input 
                  type="number" 
                  name="hoursContributed"
                  className="form-control" 
                  placeholder="Hours (optional)"
                  value={form.hoursContributed}
                  onChange={handleInputChange}
                />
              </div>

              {role === 'VOLUNTEER' ? (
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled>
                  Access Restricted (Managers only)
                </button>
              ) : (
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Registering...' : 'Add Volunteer'}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Volunteers Table List */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Primary Skills</th>
                <th>Availability</th>
                <th>Assigned Shelter</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    Retrieving volunteers directory...
                  </td>
                </tr>
              ) : volunteers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    No volunteers matching query.
                  </td>
                </tr>
              ) : (
                volunteers.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.name}</td>
                    <td>{v.age}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.skills}>
                      {v.skills}
                    </td>
                    <td>
                      <span className="badge general" style={{ fontSize: '0.7rem' }}>
                        {v.availability.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{v.assignedCamp?.name || 'General Reserve'}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                      {v.hoursContributed} hrs
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Volunteers;
