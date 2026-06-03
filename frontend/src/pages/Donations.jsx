import React, { useState, useEffect } from 'react';
import { 
  Heart, Download, Search, Filter, Plus, CheckCircle, 
  AlertCircle, DollarSign, Wallet, ArrowRightLeft, Sparkles
} from 'lucide-react';
import { API_BASE } from '../App';

function Donations({ role }) {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campsCount, setCampsCount] = useState(4);
  const [centersCount, setCentersCount] = useState(3);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('');

  // Form state
  const [form, setForm] = useState({
    donorName: '',
    amount: '',
    paymentMethod: 'UPI',
    donationType: 'GENERAL',
    campaignId: '',
    status: 'COMPLETED'
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastDistribution, setLastDistribution] = useState(null);

  useEffect(() => {
    fetchDonations();
    fetchCampaigns();
    fetchCounts();
  }, [search, filterType, filterStatus, filterCampaign]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (filterType) query.append('type', filterType);
      if (filterStatus) query.append('status', filterStatus);
      if (filterCampaign) query.append('campaignId', filterCampaign);

      const res = await fetch(`${API_BASE}/donations?${query.toString()}`);
      const data = await res.json();
      setDonations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE}/campaigns`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchCounts = async () => {
    try {
      const campsRes = await fetch(`${API_BASE}/camps`);
      const centersRes = await fetch(`${API_BASE}/centers`);
      const camps = await campsRes.json();
      const centers = await centersRes.json();
      setCampsCount(camps.length || 4);
      setCentersCount(centers.length || 3);
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  // Real-time distribution calculation as user types
  const getPreviewAllocation = () => {
    const amt = parseFloat(form.amount) || 0;
    if (amt <= 0) return null;

    const dogsTotal = amt * 0.5;
    const orphansTotal = amt * 0.5;
    const campShare = campsCount > 0 ? dogsTotal / campsCount : 0;
    const centerShare = centersCount > 0 ? orphansTotal / centersCount : 0;

    return {
      dogsTotal,
      orphansTotal,
      campShare,
      centerShare
    };
  };

  const preview = getPreviewAllocation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.donorName || !form.amount || !form.donationType) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      setLastDistribution(null);

      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error('Failed to record donation');
      }

      const result = await res.json();
      
      setSuccessMsg(`Donation of ₹${result.donation.amount.toLocaleString()} from ${result.donation.donorName} recorded successfully!`);
      setLastDistribution(result.distribution);
      
      // Reset form
      setForm({
        donorName: '',
        amount: '',
        paymentMethod: 'UPI',
        donationType: 'GENERAL',
        campaignId: '',
        status: 'COMPLETED'
      });

      // Refresh list
      fetchDonations();
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process donation. Please try again.');
      setSubmitting(false);
    }
  };

  // Excel CSV Export function
  const handleExportCSV = () => {
    const headers = 'Donation ID,Donor Name,Amount,Date,Payment Method,Type,Campaign,Status\n';
    const rows = donations.map(d => (
      `"${d.id}","${d.donorName.replace(/"/g, '""')}",${d.amount},"${new Date(d.date).toLocaleString()}","${d.paymentMethod}","${d.donationType}","${d.campaign?.title || 'General'}","${d.status}"`
    )).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pawhope_donations_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Search and Filters Bar */}
      <section className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon-inside" size={18} />
          <input 
            type="text" 
            placeholder="Search donors..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          className="form-control" 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Donation Types</option>
          <option value="GENERAL">General Welfare</option>
          <option value="DOGS">Dog Rescue Only</option>
          <option value="ORPHANS">Orphan Support Only</option>
        </select>

        <select 
          className="form-control" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
        </select>

        <select 
          className="form-control" 
          value={filterCampaign} 
          onChange={(e) => setFilterCampaign(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">All Campaigns</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <button className="btn-outline" onClick={handleExportCSV} title="Export to Excel / CSV" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Export Excel
        </button>
      </section>

      {/* Main Grid: Form Left, Table Right */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        
        {/* Record New Donation Form */}
        <div>
          <div className="form-card">
            <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} color="var(--color-primary)" />
              Record New Donation
            </h3>

            {errorMsg && (
              <div className="ai-alert-item critical" style={{ margin: '0 0 1rem 0' }}>
                <AlertCircle size={18} />
                <div className="ai-alert-content"><p>{errorMsg}</p></div>
              </div>
            )}

            {successMsg && (
              <div className="ai-alert-item success" style={{ margin: '0 0 1rem 0' }}>
                <CheckCircle size={18} />
                <div className="ai-alert-content"><p>{successMsg}</p></div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Donor Full Name *</label>
                <input 
                  type="text" 
                  name="donorName"
                  className="form-control" 
                  placeholder="e.g. Priyanth Sen"
                  value={form.donorName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Donation Amount (INR) *</label>
                <input 
                  type="number" 
                  name="amount"
                  className="form-control" 
                  placeholder="₹ Amount"
                  value={form.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Payment Method *</label>
                <select 
                  name="paymentMethod"
                  className="form-control" 
                  value={form.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="UPI">UPI (GPay / PhonePe)</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Direct Transfer</option>
                  <option value="PAYPAL">PayPal Checkout</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Donation Type *</label>
                <select 
                  name="donationType"
                  className="form-control" 
                  value={form.donationType}
                  onChange={handleInputChange}
                >
                  <option value="GENERAL">General Fund (50/50 Split)</option>
                  <option value="DOGS">Dog Operations (100% to Camps)</option>
                  <option value="ORPHANS">Orphans Operations (100% to Centers)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Link to Campaign (Optional)</label>
                <select 
                  name="campaignId"
                  className="form-control" 
                  value={form.campaignId}
                  onChange={handleInputChange}
                >
                  <option value="">Direct Contribution (No Campaign)</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {role === 'VOLUNTEER' ? (
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled>
                  Access Restricted (Managers only)
                </button>
              ) : (
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? 'Recording...' : 'Log Donation'}
                </button>
              )}
            </form>

            {/* Real-time split preview visualizer */}
            {preview && (
              <div className="distribution-preview-box">
                <div className="distribution-header">
                  <ArrowRightLeft size={16} />
                  <span>Algorithmic Split Preview</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Following NGO distribution rules:
                </p>
                <div className="distribution-split">
                  <div className="distribution-col">
                    <h6>🐶 Dogs (50%)</h6>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{preview.dogsTotal.toLocaleString()}
                    </span>
                    <ul className="distribution-list" style={{ marginTop: '0.25rem' }}>
                      <li>Per camp ({campsCount}): <span>₹{Math.round(preview.campShare).toLocaleString()}</span></li>
                    </ul>
                  </div>
                  <div className="distribution-col">
                    <h6>🧒 Children (50%)</h6>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{preview.orphansTotal.toLocaleString()}
                    </span>
                    <ul className="distribution-list" style={{ marginTop: '0.25rem' }}>
                      <li>Per center ({centersCount}): <span>₹{Math.round(preview.centerShare).toLocaleString()}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Last transaction receipt allocation display */}
          {lastDistribution && (
            <div className="form-card" style={{ border: '1px solid var(--color-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', fontWeight: 700, marginBottom: '1rem' }}>
                <Sparkles size={18} />
                <span>Transaction Fund Split Success</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Amount Received:</strong> ₹{lastDistribution.total.toLocaleString()}</div>
                <div><strong>Dog Rescue Allocated (50%):</strong> ₹{lastDistribution.dogRescueTotal.toLocaleString()}</div>
                <ul className="distribution-list" style={{ paddingLeft: '1rem' }}>
                  {lastDistribution.campsDistribution.map(c => (
                    <li key={c.id}>{c.name}: <strong>₹{Math.round(c.amountAllocated).toLocaleString()}</strong></li>
                  ))}
                </ul>
                <div><strong>Orphan Support Allocated (50%):</strong> ₹{lastDistribution.orphanWelfareTotal.toLocaleString()}</div>
                <ul className="distribution-list" style={{ paddingLeft: '1rem' }}>
                  {lastDistribution.centersDistribution.map(ctr => (
                    <li key={ctr.id}>{ctr.name}: <strong>₹{Math.round(ctr.amountAllocated).toLocaleString()}</strong></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Donations Log Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Type</th>
                <th>Campaign</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading donations log...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    No donations matching query.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.donorName}</td>
                    <td style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
                      ₹{d.amount.toLocaleString()}
                    </td>
                    <td>{new Date(d.date).toLocaleDateString()}</td>
                    <td>{d.paymentMethod}</td>
                    <td>
                      <span className={`badge ${d.donationType === 'GENERAL' ? 'general' : d.donationType === 'DOGS' ? 'success' : 'pending'}`}>
                        {d.donationType}
                      </span>
                    </td>
                    <td>{d.campaign?.title || 'General Fund'}</td>
                    <td>
                      <span className={`badge ${d.status === 'COMPLETED' ? 'success' : 'pending'}`}>
                        {d.status}
                      </span>
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

export default Donations;
