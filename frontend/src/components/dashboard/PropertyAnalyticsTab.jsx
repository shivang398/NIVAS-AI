import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Activity, IndianRupee } from 'lucide-react';
import axios from 'axios';

const PropertyAnalyticsTab = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    occupancyRate: 0,
    activeLeases: 0,
    views: 0
  });

  useEffect(() => {
    // In a real scenario, this would be an API endpoint aggregating owner data.
    // Simulating fetching analytics data
    setStats({
      totalEarnings: Math.floor(Math.random() * 500000) + 100000,
      occupancyRate: Math.floor(Math.random() * 40) + 60,
      activeLeases: Math.floor(Math.random() * 5) + 1,
      views: Math.floor(Math.random() * 1500) + 300
    });
  }, []);

  return (
    <div className="analytics-tab animate-fade-in glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2><BarChart3 className="text-secondary" size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Property Insights</h2>
      </div>

      <div className="stats-grid mb-4">
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper" style={{color: '#4ade80'}}><IndianRupee size={24} /></div>
          <div className="stat-details">
            <p className="stat-label">Total Earnings</p>
            <h3 className="stat-number">₹{stats.totalEarnings.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper text-secondary"><Activity size={24} /></div>
          <div className="stat-details">
            <p className="stat-label">Occupancy Rate</p>
            <h3 className="stat-number">{stats.occupancyRate}%</h3>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper"><TrendingUp size={24} /></div>
          <div className="stat-details">
            <p className="stat-label">Listing Views</p>
            <h3 className="stat-number">{stats.views}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', background: 'rgba(255,255,255,0.02)' }}>
        <h3>Monthly Revenue Trend</h3>
        <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Overview of revenue generated from your active leases.</p>
        
        {/* Simple mock chart visualization */}
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--border-glass)' }}>
            {[40, 60, 45, 80, 55, 90, 75].map((height, i) => (
              <div key={i} style={{ 
                flex: 1, 
                height: `${height}%`, 
                background: 'linear-gradient(180deg, #6366f1 0%, transparent 100%)',
                borderRadius: '4px 4px 0 0',
                opacity: 0.8
              }} />
            ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalyticsTab;
