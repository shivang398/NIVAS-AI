import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Building, User, Clock, CheckCircle, MessageSquare, Wrench, ShieldCheck, FileSignature, Settings } from 'lucide-react';
import AddPropertyModal from '../components/AddPropertyModal';
import PropertyCard from '../components/PropertyCard';
import ChatTab from '../components/dashboard/ChatTab';
import MaintenanceTab from '../components/dashboard/MaintenanceTab';
import VerificationTab from '../components/dashboard/VerificationTab';
import LeasesTab from '../components/dashboard/LeasesTab';
import PoliceDashboardTab from '../components/dashboard/PoliceDashboardTab';
import '../components/AddProperty.css';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ properties: 0, pending: 0, closed: 0 });
  const [properties, setProperties] = useState([]);
  const [applications, setApplications] = useState([]);

  // Default to OWNER if no role, for fallback visualization
  const isOwner = user?.role === 'owner' || user?.role === 'OWNER';
  const isPolice = user?.role === 'police' || user?.role === 'POLICE';

  useEffect(() => {
    fetchDashboardData();
  }, [user, activeTab]);

  const fetchDashboardData = async () => {
    try {
      if (isPolice) return; // Handled inside Police Dashboard

      if (isOwner) {
        // Fetch properties (since backend lacks /my-properties, fetch all and filter client side for MVP)
        const res = await axios.get('/properties');
        if (res.data.success) {
          const ownerProps = res.data.data.filter(p => p.ownerId === user?.id || (p.owner && p.owner?.id === user?.id));
          setProperties(ownerProps);
          
          // Fetch received applications/offers for owner
          try {
            const offersRes = await axios.get('/offers');
            if (offersRes.data.success) {
              setApplications(offersRes.data.data);
              setStats(s => ({ ...s, properties: ownerProps.length, pending: offersRes.data.data.length }));
            } else {
              setStats(s => ({ ...s, properties: ownerProps.length }));
            }
          } catch (offerErr) {
            console.error("Failed to fetch owner applications", offerErr);
            setStats(s => ({ ...s, properties: ownerProps.length }));
          }
        }
      } else {
        // Tenants: fetch their applications/offers
        const res = await axios.get('/offers');
        if (res.data.success) {
          setApplications(res.data.data);
          setStats(s => ({ ...s, pending: res.data.data.length }));
        }
      }
    } catch (err) {
      console.error("Dashboard data fetch failed", err);
    }
  };

  const handleUpdateOfferStatus = async (offerId, newStatus) => {
    try {
      const res = await axios.patch(`/offers/${offerId}`, { status: newStatus });
      if (res.data.success) {
        setApplications(applications.map(o => o.id === offerId ? { ...o, status: newStatus } : o));
        alert(`Application manually marked as ${newStatus}.`);
      }
    } catch (err) {
      alert("Failed to update application status.");
    }
  };

  const handleAddProperty = async (formDataPayload) => {
    try {
      const res = await axios.post('/properties', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert("Property listed successfully!");
        fetchDashboardData(); // Refresh list
      }
    } catch (error) {
      alert("Failed to list property. Check console for details.");
      console.error(error);
    }
  };

  return (
    <div className="main-content dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome <span className="text-gradient">Back</span></h1>
          <p className="text-secondary">Here's your {isOwner ? 'portfolio' : 'leasing'} dashboard.</p>
        </div>
        {isOwner && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> List Property
          </button>
        )}
      </div>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar glass-card">
          <div className="user-profile-summary">
            <div className="avatar-large">{user?.role?.charAt(0)?.toUpperCase() || 'U'}</div>
            <h3 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{user?.email || 'User Account'}</h3>
            <span className="role-badge dashboard-badge">{user?.role || 'TENANT'}</span>
          </div>
          
          <nav className="dashboard-nav">
            {isPolice ? (
              <>
                <button className={`nav-tab ${activeTab === 'police_queue' || activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('police_queue')}>
                  <ShieldCheck size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Verification Queue
                </button>
              </>
            ) : (
              <>
                <button className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                  Overview
                </button>
                {isOwner ? (
                  <>
                    <button className={`nav-tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>
                      My Properties
                    </button>
                    <button className={`nav-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
                      Applications
                    </button>
                  </>
                ) : (
                  <>
                    <button className={`nav-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
                      My Applications
                    </button>
                  </>
                )}
                
                <button className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                  <MessageSquare size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Negotiations
                </button>
                <button className={`nav-tab ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance')}>
                  <Wrench size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Maintenance
                </button>
                <button className={`nav-tab ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>
                  <ShieldCheck size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Trust & NOCs
                </button>
                <button className={`nav-tab ${activeTab === 'leases' ? 'active' : ''}`} onClick={() => setActiveTab('leases')}>
                  <FileSignature size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Leases
                </button>
              </>
            )}
            
            <button className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={16} style={{ marginRight: '0.5rem', display: 'inline' }} /> Settings
            </button>
          </nav>
        </aside>

        <div className="dashboard-content" style={{ overflow: 'hidden' }}>
          {(activeTab === 'police_queue' || (isPolice && activeTab === 'overview')) && <PoliceDashboardTab user={user} />}

          {!isPolice && activeTab === 'overview' && (
            <div className="overview-tab animate-fade-in">
              <div className="stats-grid">
                <div className="stat-card glass-card">
                  <div className="stat-icon-wrapper"><Building size={24} /></div>
                  <div className="stat-details">
                    <p className="stat-label">{isOwner ? 'Active Listings' : 'Saved Homes'}</p>
                    <h3 className="stat-number">{isOwner ? stats.properties : 0}</h3>
                  </div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon-wrapper text-secondary"><Clock size={24} /></div>
                  <div className="stat-details">
                    <p className="stat-label">{isOwner ? 'Pending Applications' : 'Pending Approvals'}</p>
                    <h3 className="stat-number">{isOwner ? stats.pending : stats.pending}</h3>
                  </div>
                </div>
                <div className="stat-card glass-card">
                  <div className="stat-icon-wrapper" style={{color: '#4ade80'}}><CheckCircle size={24} /></div>
                  <div className="stat-details">
                    <p className="stat-label">{isOwner ? 'Leased Properties' : 'Active Leases'}</p>
                    <h3 className="stat-number">{stats.closed}</h3>
                  </div>
                </div>
              </div>

              <div className="recent-activity glass-card mt-2">
                <h3>Recent Activity</h3>
                <div className="activity-placeholder">
                  <p>No recent activity to show.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && isOwner && (
            <div className="properties-tab animate-fade-in">
              <h2>My Properties</h2>
              <div className="owner-properties-grid">
                {properties.map(prop => (
                  <PropertyCard key={prop.id} property={prop} index={0} />
                ))}
                {properties.length === 0 && <p className="text-secondary mt-2">No properties listed yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-tab animate-fade-in glass-card" style={{ padding: '2rem' }}>
              <h2>{isOwner ? 'Received Applications' : 'My Applications'}</h2>
              
              <div className="applications-table-wrapper">
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Date Applied</th>
                      <th>Rent Offer</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id}>
                        <td className="font-medium">{app.property?.title || "Property ID: " + app.propertyId}</td>
                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td className="text-secondary font-bold">₹{app.price}</td>
                        <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button className="btn-secondary small" onClick={() => setActiveTab('chat')}>Negotiate</button>
                            {isOwner && app.status === 'PENDING' && (
                              <>
                                <button 
                                  className="btn-primary small" 
                                  style={{ padding: '0.25rem 0.5rem', background: '#4ade80', color: '#000' }} 
                                  onClick={() => handleUpdateOfferStatus(app.id, 'ACCEPTED')}
                                >
                                  Accept
                                </button>
                                <button 
                                  className="btn-secondary small" 
                                  style={{ padding: '0.25rem 0.5rem', borderColor: '#f87171', color: '#f87171' }} 
                                  onClick={() => handleUpdateOfferStatus(app.id, 'REJECTED')}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center" style={{padding: '2rem'}}>No applications found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'chat' && <ChatTab user={user} />}
          {activeTab === 'maintenance' && <MaintenanceTab isOwner={isOwner} user={user} />}
          {activeTab === 'verification' && <VerificationTab isOwner={isOwner} />}
          {activeTab === 'leases' && <LeasesTab isOwner={isOwner} />}

          {activeTab === 'settings' && (
            <div className="generic-tab glass-card animate-fade-in">
              <h2>Profile Settings</h2>
              <p>Profile and notification settings are currently under development.</p>
            </div>
          )}
        </div>
      </div>
      
      <AddPropertyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddProperty}
      />
    </div>
  );
};

export default Dashboard;
