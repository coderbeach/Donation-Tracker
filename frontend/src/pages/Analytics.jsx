import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  BarChart3, Sparkles, AlertTriangle, Users, TrendingUp, Download, 
  Printer, ArrowUpRight, Share2, Compass, ShieldAlert, ArrowDownRight,
  Calculator
} from 'lucide-react';
import { API_BASE } from '../App';

function Analytics() {
  const [predictions, setPredictions] = useState({
    predictedDonations: 450000,
    fundingShortageRisk: 'LOW',
    shortagePercentage: 0,
    resourceDeficit: [],
    volunteerRequirement: { required: 0, active: 0, deficit: 0, recommendation: '' }
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState({
    totalDonations: 0,
    totalExpenses: 0,
    netBalance: 0,
    totalBeneficiaries: 0,
    dogsCount: 0,
    orphansCount: 0
  });

  const [loading, setLoading] = useState(true);

  // Mock Marketing Analytics
  const marketingMetrics = {
    websiteVisitors: 42500,
    visitorsGrowth: 15,
    conversionRate: 4.8,
    donationConversion: 1.6,
    socialReach: 185000,
    reachGrowth: 22,
    platformPerformances: [
      { name: 'Direct Traffic', Visitors: 15000, Donors: 320, Rate: '2.1%' },
      { name: 'Instagram', Visitors: 18000, Donors: 220, Rate: '1.2%' },
      { name: 'LinkedIn Advocacy', Visitors: 4500, Donors: 95, Rate: '2.1%' },
      { name: 'Facebook Outreach', Visitors: 5000, Donors: 45, Rate: '0.9%' }
    ]
  };

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true);
        const [predRes, monthlyRes, yearlyRes] = await Promise.all([
          fetch(`${API_BASE}/reports/predictions`),
          fetch(`${API_BASE}/reports/monthly`),
          fetch(`${API_BASE}/reports/yearly`)
        ]);

        const pred = await predRes.json();
        const monthly = await monthlyRes.json();
        const yearly = await yearlyRes.json();

        setPredictions(pred);
        setMonthlyData(monthly);
        setYearlyData(yearly);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, []);

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'Month,Donations Received (INR),Operating Expenses (INR),Net Balance (INR)\n';
    const rows = monthlyData.map(m => (
      `"${m.monthName}",${m.donations},${m.expenses},${m.net}`
    )).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pawhope_monthly_financials_${new Date().getFullYear()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Calculating AI prediction models and report aggregates...</div>
      </div>
    );
  }

  // Formatting predictions display helper
  const getRiskBadgeClass = (risk) => {
    if (risk === 'CRITICAL' || risk === 'HIGH') return 'badge danger';
    if (risk === 'MEDIUM') return 'badge pending';
    return 'badge success';
  };

  return (
    <div>
      {/* Action panel bar */}
      <section className="filter-bar" style={{ justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button className="btn-outline" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Export Financial CSV
        </button>
        <button className="btn-primary" onClick={handlePrintPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} />
          Print PDF Report
        </button>
      </section>

      {/* AI Forecaster and Prediction Models */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Forecast Details */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                <Sparkles size={20} />
                AI Donation Forecasting Models
              </h3>
              <p className="card-subtitle">Projected fundraising targets compared to operating minimums</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="slider-group" style={{ margin: 0, padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Next Month Predicted Donations</span>
              <strong style={{ fontSize: '1.8rem', display: 'block', margin: '0.5rem 0', color: 'var(--color-secondary)' }}>
                ₹{predictions.predictedDonations.toLocaleString()}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowUpRight size={14} color="var(--color-secondary)" /> +4.2% projected baseline growth
              </span>
            </div>

            <div className="slider-group" style={{ margin: 0, padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Funding Shortage Risk Assessment</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                <span className={getRiskBadgeClass(predictions.fundingShortageRisk)} style={{ fontSize: '0.95rem', padding: '0.4rem 0.8rem' }}>
                  {predictions.fundingShortageRisk} RISK
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {predictions.shortagePercentage > 0 
                  ? `Forecast expects a ${predictions.shortagePercentage}% budget shortage.` 
                  : 'Funding reserves exceed minimum monthly needs.'}
              </span>
            </div>
          </div>

          {predictions.resourceDeficit.length > 0 ? (
            <div className="ai-alert-item critical" style={{ margin: 0 }}>
              <AlertTriangle size={20} />
              <div className="ai-alert-content">
                <h5>Resource Deficit Detected</h5>
                {predictions.resourceDeficit.map((def, idx) => (
                  <p key={idx} style={{ marginTop: '0.25rem' }}>{def.description}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="ai-alert-item success" style={{ margin: 0 }}>
              <Sparkles size={20} color="var(--color-secondary)" />
              <div className="ai-alert-content">
                <h5>Optimal Funding Threshold Reached</h5>
                <p>Calculations show forecasted donations split evenly cover standard operational runtimes.</p>
              </div>
            </div>
          )}
        </div>

        {/* Volunteer AI Requirement */}
        <div className="chart-card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} />
              Volunteer Staffing Model
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Active Volunteers:</span>
              <strong>{predictions.volunteerRequirement.active} helper profiles</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Standard Goal Care Force:</span>
              <strong>{predictions.volunteerRequirement.required} helpers needed</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <span>Volunteer Deficit:</span>
              <strong style={{ color: predictions.volunteerRequirement.deficit > 0 ? 'var(--danger)' : 'var(--color-secondary)' }}>
                {predictions.volunteerRequirement.deficit} helpers
              </strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
              <strong>Care target criteria:</strong> 1 helper per 10 rescued shelter dogs, 1 helper per 5 children.
            </div>
          </div>
        </div>
      </section>

      {/* Marketing and Growth Analytics */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2rem 0 1rem 0' }}>Marketing Analytics & Traffic Module</h2>
      <section className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2.5rem' }}>
        <div className="metric-card" style={{ borderColor: 'var(--border-color)' }}>
          <div className="metric-header"><span>Website Traffic</span><Compass size={18} /></div>
          <div className="metric-value">{marketingMetrics.websiteVisitors.toLocaleString()}</div>
          <div className="metric-subtitle positive">+{marketingMetrics.visitorsGrowth}% visitors this month</div>
        </div>

        <div className="metric-card" style={{ borderColor: 'var(--border-color)' }}>
          <div className="metric-header"><span>Traffic Signups</span><TrendingUp size={18} /></div>
          <div className="metric-value">{marketingMetrics.conversionRate}%</div>
          <div className="metric-subtitle">Visitors converting to signups</div>
        </div>

        <div className="metric-card" style={{ borderColor: 'var(--border-color)' }}>
          <div className="metric-header"><span>Donor Conversion</span><Coins size={18} /></div>
          <div className="metric-value">{marketingMetrics.donationConversion}%</div>
          <div className="metric-subtitle">Visitors converting to donors</div>
        </div>

        <div className="metric-card" style={{ borderColor: 'var(--border-color)' }}>
          <div className="metric-header"><span>Social Impressions</span><Share2 size={18} /></div>
          <div className="metric-value">{marketingMetrics.socialReach.toLocaleString()}</div>
          <div className="metric-subtitle positive">+{marketingMetrics.reachGrowth}% reach growth</div>
        </div>
      </section>

      {/* Marketing channels table & Financial Monthly summary */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Marketing Platforms */}
        <div className="table-container" style={{ margin: 0 }}>
          <div className="card-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="card-title">Outreach Conversion Channels</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Channel Source</th>
                <th>Monthly Visits</th>
                <th>Donors</th>
                <th>Conversion</th>
              </tr>
            </thead>
            <tbody>
              {marketingMetrics.platformPerformances.map((plat, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{plat.name}</td>
                  <td>{plat.Visitors.toLocaleString()}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{plat.Donors}</td>
                  <td><span className="badge general">{plat.Rate}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial reports details summary */}
        <div className="table-container" style={{ margin: 0 }}>
          <div className="card-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="card-title">Monthly Ledger Summary</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Donations</th>
                <th>Expenses</th>
                <th>Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{m.monthName}</td>
                  <td style={{ color: 'var(--color-secondary)' }}>₹{m.donations.toLocaleString()}</td>
                  <td style={{ color: 'var(--danger)' }}>₹{m.expenses.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: m.net >= 0 ? 'var(--color-secondary)' : 'var(--danger)' }}>
                    ₹{m.net.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Annual Summary Stats report panel */}
      <section className="form-card" style={{ marginTop: '2.5rem' }}>
        <h3 className="form-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          Annual Financial Statement Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Annual Income Logged:</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', marginTop: '0.25rem' }}>₹{yearlyData.totalDonations.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Annual Costs Logged:</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', marginTop: '0.25rem', color: 'var(--danger)' }}>₹{yearlyData.totalExpenses.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Net Operations Balance:</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', marginTop: '0.25rem', color: yearlyData.netBalance >= 0 ? 'var(--color-secondary)' : 'var(--danger)' }}>
              ₹{yearlyData.netBalance.toLocaleString()}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Beneficiary Occupancy:</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', marginTop: '0.25rem' }}>{yearlyData.totalBeneficiaries} count</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Analytics;
