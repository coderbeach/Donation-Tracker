import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Calculator, Shield, Coins, Sparkles, Flame, HelpCircle } from 'lucide-react';
import { API_BASE } from '../App';

function SurvivalCalculator() {
  // Database counts
  const [totalDogs, setTotalDogs] = useState(375);
  const [totalChildren, setTotalChildren] = useState(100);
  const [fixedOverheads, setFixedOverheads] = useState(180000); // Staff salaries + maintenance
  const [loading, setLoading] = useState(true);

  // Dogs monthly costs per animal
  const [dogFood, setDogFood] = useState(1500);
  const [dogVaccination, setDogVaccination] = useState(500);
  const [dogMedicine, setDogMedicine] = useState(800);
  const [dogShelter, setDogShelter] = useState(1200);

  // Orphans monthly costs per child
  const [childFood, setChildFood] = useState(2500);
  const [childEducation, setChildEducation] = useState(2000);
  const [childHealthcare, setChildHealthcare] = useState(1500);
  const [childUtilities, setChildUtilities] = useState(1000);

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);
        const [campsRes, centersRes] = await Promise.all([
          fetch(`${API_BASE}/camps`),
          fetch(`${API_BASE}/centers`)
        ]);
        const camps = await campsRes.json();
        const centers = await centersRes.json();

        const dogs = camps.reduce((sum, c) => sum + c.dogsCount, 0);
        const children = centers.reduce((sum, c) => sum + c.childrenCount, 0);

        // Fixed maintenance & staff salary overheads from DB
        const campsOverhead = camps.reduce((sum, c) => sum + c.maintenanceCost, 0);
        const centersOverhead = centers.reduce((sum, c) => sum + c.staffSalaryCost, 0);

        setTotalDogs(dogs || 375);
        setTotalChildren(children || 100);
        setFixedOverheads(campsOverhead + centersOverhead || 180000);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  // Compute care cost totals
  const perDogCost = dogFood + dogVaccination + dogMedicine + dogShelter;
  const perChildCost = childFood + childEducation + childHealthcare + childUtilities;

  const monthlyDogsTotal = totalDogs * perDogCost;
  const monthlyChildrenTotal = totalChildren * perChildCost;

  const monthlyMinimumSurvivalCost = monthlyDogsTotal + monthlyChildrenTotal + fixedOverheads;
  const yearlyMinimumSurvivalCost = monthlyMinimumSurvivalCost * 12;
  const emergencyBudget = monthlyMinimumSurvivalCost * 3; // 3 months emergency runway
  const recommendedReserveFund = monthlyMinimumSurvivalCost * 6 + (yearlyMinimumSurvivalCost * 0.05); // 6 months runway + 5% emergency buffer

  // Chart data formatting
  const comparisonData = [
    { name: 'Monthly Survival', Amount: Math.round(monthlyMinimumSurvivalCost) },
    { name: 'Emergency (3M)', Amount: Math.round(emergencyBudget) },
    { name: 'Recommended Reserve', Amount: Math.round(recommendedReserveFund) },
    { name: 'Annual Survival (10%)', Amount: Math.round(yearlyMinimumSurvivalCost / 10) } // Scaled down for readable plotting
  ];

  const breakdownData = [
    { name: 'Dog Rescue operations', value: monthlyDogsTotal, color: '#3b82f6' },
    { name: 'Orphan welfare operations', value: monthlyChildrenTotal, color: '#10b981' },
    { name: 'Fixed Salaries & Maintenance', value: fixedOverheads, color: '#f59e0b' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Analyzing cost metrics and count structures...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner details */}
      <section className="emergency-banner" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', marginBottom: '2.5rem', animation: 'none' }}>
        <div className="emergency-info">
          <Sparkles size={24} />
          <div>
            <h4>Live Benchmarked Beneficiary Directory</h4>
            <p>Calculations linked to live database: <strong>{totalDogs} Rescued Dogs</strong> and <strong>{totalChildren} Children</strong> across all centers.</p>
          </div>
        </div>
      </section>

      {/* Main Grid Slider Left, Charts Right */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        
        {/* Cost Slider Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* DOG CARE COSTS SLIDERS */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
              🐶 Dog Care Cost Sliders (Per Dog/Month)
            </h3>
            
            <div className="slider-group">
              <div className="slider-header">
                <span>Food & Feed Supply</span>
                <span>₹{dogFood}</span>
              </div>
              <input type="range" min="500" max="4000" step="100" className="slider-input" value={dogFood} onChange={(e) => setDogFood(parseInt(e.target.value))} />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Vaccination Kits</span>
                <span>₹{dogVaccination}</span>
              </div>
              <input type="range" min="100" max="1500" step="50" className="slider-input" value={dogVaccination} onChange={(e) => setDogVaccination(parseInt(e.target.value))} />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Medicine & Vet Services</span>
                <span>₹{dogMedicine}</span>
              </div>
              <input type="range" min="200" max="2500" step="50" className="slider-input" value={dogMedicine} onChange={(e) => setDogMedicine(parseInt(e.target.value))} />
            </div>

            <div className="slider-group" style={{ marginBottom: 0 }}>
              <div className="slider-header">
                <span>Kennel Shelter & Sanitation</span>
                <span>₹{dogShelter}</span>
              </div>
              <input type="range" min="300" max="3000" step="100" className="slider-input" value={dogShelter} onChange={(e) => setDogShelter(parseInt(e.target.value))} />
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total Per Dog Cost:</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{perDogCost} / month</span>
            </div>
          </div>

          {/* ORPHAN CARE COSTS SLIDERS */}
          <div className="form-card" style={{ marginBottom: 0, borderLeft: '4px solid var(--color-secondary)' }}>
            <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)' }}>
              🧒 Child Care Cost Sliders (Per Child/Month)
            </h3>
            
            <div className="slider-group">
              <div className="slider-header">
                <span>Nutrition & Groceries</span>
                <span>₹{childFood}</span>
              </div>
              <input type="range" min="1000" max="6000" step="100" className="slider-input" value={childFood} onChange={(e) => setChildFood(parseInt(e.target.value))} />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>School Tuition & Stationery</span>
                <span>₹{childEducation}</span>
              </div>
              <input type="range" min="500" max="5000" step="100" className="slider-input" value={childEducation} onChange={(e) => setChildEducation(parseInt(e.target.value))} />
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Healthcare & Pediatric Visits</span>
                <span>₹{childHealthcare}</span>
              </div>
              <input type="range" min="200" max="3000" step="100" className="slider-input" value={childHealthcare} onChange={(e) => setChildHealthcare(parseInt(e.target.value))} />
            </div>

            <div className="slider-group" style={{ marginBottom: 0 }}>
              <div className="slider-header">
                <span>Center Utilities (Power/Heating)</span>
                <span>₹{childUtilities}</span>
              </div>
              <input type="range" min="200" max="2500" step="50" className="slider-input" value={childUtilities} onChange={(e) => setChildUtilities(parseInt(e.target.value))} />
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total Per Child Cost:</span>
              <span style={{ color: 'var(--color-secondary)' }}>₹{perChildCost} / month</span>
            </div>
          </div>
        </div>

        {/* Dynamic Calculator Calculations Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary Math Metrics */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 className="form-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={18} />
              Required Operating Budgets
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span>Monthly Minimum Cost:</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>₹{monthlyMinimumSurvivalCost.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span>Yearly Minimum Cost:</span>
                <strong style={{ color: 'var(--text-primary)' }}>₹{yearlyMinimumSurvivalCost.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span>Emergency Fund (3 Months):</span>
                <strong style={{ color: 'var(--danger)' }}>₹{emergencyBudget.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                <span>Recommended Reserve (6M Runway):</span>
                <strong style={{ color: 'var(--color-secondary)' }}>₹{recommendedReserveFund.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Bar Chart comparing metrics */}
          <div className="chart-card">
            <div className="card-header">
              <h4 className="card-title">Fund Threshold Comparisons</h4>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: '10px' }} />
                  <YAxis stroke="var(--text-secondary)" width={70} style={{ fontSize: '10px' }} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="Amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={35}>
                    {comparisonData.map((entry, index) => {
                      let color = 'var(--color-primary)';
                      if (index === 1) color = 'var(--danger)';
                      if (index === 2) color = 'var(--color-secondary)';
                      if (index === 3) color = 'var(--text-secondary)';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
              * Annual budget is divided by 10 to fit visual scale.
            </span>
          </div>

          {/* Share Breakdown Pie chart */}
          <div className="chart-card">
            <div className="card-header">
              <h4 className="card-title font-bold">Monthly Cost Split Breakdown</h4>
            </div>
            <div style={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default SurvivalCalculator;
