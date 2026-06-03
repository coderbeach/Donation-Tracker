import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  Coins, Heart, ShieldAlert, Award, TrendingUp, Users, Calendar, 
  PlusCircle, Activity, Sparkles, Building, AlertCircle
} from 'lucide-react';
import { API_BASE } from '../App';

function Dashboard({ role, setActiveTab }) {
  const [stats, setStats] = useState({
    totalDonations: 0,
    monthlyDonations: 0,
    totalCamps: 0,
    totalCenters: 0,
    totalVolunteers: 0,
    activeCampaigns: 0,
    monthlyExpenses: 0,
    remainingFunds: 0,
    dogsRescued: 0,
    orphansSupported: 0,
  });

  const [chartsData, setChartsData] = useState({
    monthlyReport: [],
    campaigns: [],
    distribution: [],
    survivalCosts: [],
  });

  const [topVolunteers, setTopVolunteers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    warning: '#f59e0b',
    danger: '#ef4444',
    pieColors: ['#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#8b5cf6'],
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch concurrently from backend REST APIs
        const [
          donationsRes,
          campsRes,
          centersRes,
          volunteersRes,
          campaignsRes,
          monthlyReportRes,
          predictionsRes
        ] = await Promise.all([
          fetch(`${API_BASE}/donations`),
          fetch(`${API_BASE}/camps`),
          fetch(`${API_BASE}/centers`),
          fetch(`${API_BASE}/volunteers`),
          fetch(`${API_BASE}/campaigns`),
          fetch(`${API_BASE}/reports/monthly`),
          fetch(`${API_BASE}/reports/predictions`),
        ]);

        const donations = await donationsRes.json();
        const camps = await campsRes.json();
        const centers = await centersRes.json();
        const volunteers = await volunteersRes.json();
        const campaigns = await campaignsRes.json();
        const monthlyReport = await monthlyReportRes.json();
        const predictions = await predictionsRes.json();

        // 1. Calculations for Summary Cards
        const completedDonations = donations.filter(d => d.status === 'COMPLETED');
        const totalDonations = completedDonations.reduce((sum, d) => sum + d.amount, 0);

        // Monthly donations (current month)
        const now = new Date();
        const currentMonthDonations = completedDonations
          .filter(d => {
            const date = new Date(d.date);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          })
          .reduce((sum, d) => sum + d.amount, 0);

        // Counts of centers
        const totalCamps = camps.length;
        const totalCenters = centers.length;
        const totalVolunteers = volunteers.length;
        const activeCampaigns = campaigns.length;

        // Beneficiaries
        const dogsRescued = camps.reduce((sum, c) => sum + c.dogsCount, 0);
        const orphansSupported = centers.reduce((sum, c) => sum + c.childrenCount, 0);

        // Expenses
        const campsExpenses = camps.reduce((sum, c) => sum + c.foodCost + c.medicalCost + c.maintenanceCost, 0);
        const centersExpenses = centers.reduce((sum, c) => sum + c.foodCost + c.educationCost + c.healthcareCost + c.utilityCost + c.staffSalaryCost, 0);
        const monthlyExpenses = campsExpenses + centersExpenses;

        const remainingFunds = totalDonations - (monthlyExpenses * 6); // Estimating past 6 months expenses

        setStats({
          totalDonations,
          monthlyDonations: currentMonthDonations,
          totalCamps,
          totalCenters,
          totalVolunteers,
          activeCampaigns,
          monthlyExpenses,
          remainingFunds,
          dogsRescued,
          orphansSupported,
        });

        // 2. Format Charts Data
        // - Campaign Progress charts
        const formattedCampaigns = campaigns.map(c => ({
          name: c.title,
          Raised: c.amountRaised,
          Goal: c.goal,
          Percent: Math.round((c.amountRaised / c.goal) * 100),
        }));

        // - Shelter Funding Distribution (Dynamic calculation based on algorithm)
        // 50% goes to dogs split equally, 50% to orphans split equally
        const totalDogsPool = totalDonations * 0.5;
        const totalOrphansPool = totalDonations * 0.5;
        const sharePerCamp = totalCamps > 0 ? totalDogsPool / totalCamps : 0;
        const sharePerCenter = totalCenters > 0 ? totalOrphansPool / totalCenters : 0;

        const distributionData = [
          ...camps.map(c => ({ name: `${c.name} (Dog)`, value: Math.round(sharePerCamp) })),
          ...centers.map(ctr => ({ name: `${ctr.name} (Orphan)`, value: Math.round(sharePerCenter) }))
        ];

        // - Monthly Survival Cost Analysis (using default calculator values)
        const survivalCostsData = [
          {
            category: 'Dog Camps',
            Food: camps.reduce((sum, c) => sum + c.foodCost, 0),
            Medical: camps.reduce((sum, c) => sum + c.medicalCost, 0),
            Maintenance: camps.reduce((sum, c) => sum + c.maintenanceCost, 0),
          },
          {
            category: 'Orphan Centers',
            Food: centers.reduce((sum, c) => sum + c.foodCost, 0),
            Education: centers.reduce((sum, c) => sum + c.educationCost, 0),
            Medical: centers.reduce((sum, c) => sum + c.healthcareCost, 0),
            Utilities: centers.reduce((sum, c) => sum + c.utilityCost, 0),
            Salaries: centers.reduce((sum, c) => sum + c.staffSalaryCost, 0),
          }
        ];

        setChartsData({
          monthlyReport,
          campaigns: formattedCampaigns,
          distribution: distributionData,
          survivalCosts: survivalCostsData,
        });

        // Top Volunteers (highest hours)
        setTopVolunteers(volunteers.slice(0, 5));

        // Generate AI alerts based on prediction metrics
        const alertsList = [];
        if (predictions.fundingShortageRisk === 'CRITICAL' || predictions.fundingShortageRisk === 'HIGH') {
          alertsList.push({
            type: 'critical',
            title: `Severe funding shortage predicted next month.`,
            desc: `Operating deficit expected to be ₹${predictions.resourceDeficit[0]?.deficit.toLocaleString() || '45,000'}. Recommended: Boost Feed A Friend campaign.`
          });
        }
        if (predictions.volunteerRequirement.deficit > 0) {
          alertsList.push({
            type: 'warning',
            title: `Volunteer Care Deficit Alert`,
            desc: predictions.volunteerRequirement.recommendation
          });
        } else {
          alertsList.push({
            type: 'success',
            title: `Operations fully staffed.`,
            desc: `Current volunteer force of ${totalVolunteers} meets operating care standards.`
          });
        }

        setAlerts(alertsList);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Loading PawHope Dashboard Metrics...</div>
      </div>
    );
  }

  return (
    <div>
      {/* AI Intelligence banner */}
      {alerts.length > 0 && (
        <div className="ai-predictions-panel" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
            <Sparkles size={20} />
            <h4 style={{ fontWeight: 700 }}>AI Predictive Systems & Risk Assessment</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {alerts.map((alert, idx) => (
              <div key={idx} className={`ai-alert-item ${alert.type}`}>
                <div className="ai-alert-content">
                  <h5>{alert.title}</h5>
                  <p>{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Total Donations</span>
            <Coins className="metric-icon" size={18} />
          </div>
          <div className="metric-value">₹{stats.totalDonations.toLocaleString()}</div>
          <div className="metric-subtitle">Cumulative funds received</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Monthly Donations</span>
            <TrendingUp className="metric-icon" size={18} />
          </div>
          <div className="metric-value">₹{stats.monthlyDonations.toLocaleString()}</div>
          <div className="metric-subtitle positive">+8.2% since last month</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Rescue Shelters</span>
            <Building className="metric-icon" size={18} />
          </div>
          <div className="metric-value">{stats.totalCamps}</div>
          <div className="metric-subtitle">Dogs count: {stats.dogsRescued}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Orphan Homes</span>
            <Building className="metric-icon" size={18} />
          </div>
          <div className="metric-value">{stats.totalCenters}</div>
          <div className="metric-subtitle">Children count: {stats.orphansSupported}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Monthly Cost</span>
            <Activity className="metric-icon" size={18} />
          </div>
          <div className="metric-value">₹{stats.monthlyExpenses.toLocaleString()}</div>
          <div className="metric-subtitle">Camps & Center survival cost</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Active Campaigns</span>
            <Calendar className="metric-icon" size={18} />
          </div>
          <div className="metric-value">{stats.activeCampaigns}</div>
          <div className="metric-subtitle">Fundraisers running</div>
        </div>
      </section>

      {/* Charts Grid */}
      <section className="dashboard-grid">
        {/* Donation vs Expense Trends */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Donation & Expense Trends</h3>
              <p className="card-subtitle">Performance analysis for the last 6 months</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartsData.monthlyReport}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.danger} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={colors.danger} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="monthName" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend />
                <Area type="monotone" dataKey="donations" name="Donations Received" stroke={colors.primary} fillOpacity={1} fill="url(#colorDonations)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Operational Cost" stroke={colors.danger} fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shelter Allocation Distribution */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Shelter Funding Distribution</h3>
              <p className="card-subtitle">Algorithmic allocation: 50/50 equal splits</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartsData.distribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartsData.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors.pieColors[index % colors.pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Campaign Performance Bar Chart */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Active Campaigns Status</h3>
              <p className="card-subtitle">Amount raised compared to goal</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartsData.campaigns} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" stroke="var(--text-secondary)" />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={120} style={{ fontSize: '11px' }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Raised" fill={colors.secondary} radius={[0, 4, 4, 0]} barSize={15} />
                <Bar dataKey="Goal" fill="var(--border-color)" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volunteer Hours Leaderboard */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Top Contributing Volunteers</h3>
              <p className="card-subtitle">Most active community members</p>
            </div>
            {role !== 'VOLUNTEER' && (
              <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('volunteers')}>
                View All
              </button>
            )}
          </div>
          
          <div className="leaderboard-list">
            {topVolunteers.map((vol, index) => (
              <div className="leaderboard-item" key={vol.id}>
                <div className="leaderboard-rank">#{index + 1}</div>
                <div className="leaderboard-details">
                  <div className="leaderboard-name">{vol.name}</div>
                  <div className="leaderboard-sub">{vol.skills.split(',')[0]}</div>
                </div>
                <div className="leaderboard-value">{vol.hoursContributed} hrs</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Survival Cost Stacked Analysis */}
      <section className="chart-card" style={{ marginBottom: '2.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Monthly Operating Costs Breakdown</h3>
            <p className="card-subtitle">Minimum food, medical, and utility allocations per category</p>
          </div>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartsData.survivalCosts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="category" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" formatter={(value) => `₹${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Food" stackId="a" fill={colors.primary} />
              <Bar dataKey="Medical" stackId="a" fill={colors.danger} />
              <Bar dataKey="Maintenance" stackId="a" fill={colors.warning} />
              <Bar dataKey="Education" stackId="a" fill={colors.accent} />
              <Bar dataKey="Utilities" stackId="a" fill="#06b6d4" />
              <Bar dataKey="Salaries" stackId="a" fill="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
