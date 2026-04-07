import { Link } from 'react-router-dom';
import { ArrowRight, Key, ShieldCheck, Home as HomeIcon, Star, CheckCircle } from 'lucide-react';
import heroImg from '../assets/hero.png';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      
      <div className="hero-section">
        <div className="hero-grid">
          {/* Left Text Content */}
          <div className="hero-content">
            <div className="hero-badge animate-fade-in animate-delay-1">
              <Star size={14} className="text-secondary" />
              <span>The #1 Real Estate Platform</span>
            </div>
            
            <h1 className="hero-title animate-fade-in animate-delay-2">
              Discover the <br />
              <span className="text-gradient">Future</span> of <br />
              Smart Renting
            </h1>
            
            <p className="hero-subtitle animate-fade-in animate-delay-3">
              Nivas connects tenants and owners through intelligent matching, secure digital negotiations, and automated verifications. Ditch the paperwork.
            </p>
            
            <div className="hero-actions animate-fade-in animate-delay-4">
              <Link to="/properties" className="btn-primary hero-btn">
                Explore Listings <ArrowRight size={20} />
              </Link>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-val">10k+</span>
                  <span className="stat-lbl">Active Users</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat">
                  <span className="stat-val">100%</span>
                  <span className="stat-lbl">Verified</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Visual Structure */}
          <div className="hero-visual animate-fade-in animate-delay-3">
            <div className="visual-wrapper glass-card pulse-glow">
              <img src={heroImg} alt="Modern Real Estate" className="hero-image" />
              
              <div className="floating-badge badge-top-right bounce-slow">
                <ShieldCheck size={18} className="text-secondary" />
                <span>NOC Verified</span>
              </div>
              
              <div className="floating-badge badge-bottom-left bounce-slower">
                <CheckCircle size={18} style={{ color: '#4ade80' }} />
                <span>Lease Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section main-content">
        <div className="features-header animate-fade-in" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Why choose Nivas?</h2>
          <p className="section-subtitle">A singular platform unifying every step of your leasing journey.</p>
        </div>
        
        <div className="features-grid">
          <div className="glass-card feature-card shadow-hover animate-fade-in animate-delay-1">
            <div className="feature-icon-wrapper">
              <HomeIcon className="feature-icon" />
            </div>
            <h3>Smart Discovery</h3>
            <p>Find your next home with intelligent matching algorithms built specifically for your needs.</p>
          </div>
          
          <div className="glass-card feature-card shadow-hover animate-fade-in animate-delay-2">
            <div className="feature-icon-wrapper">
              <Key className="feature-icon" />
            </div>
            <h3>Secure Leasing</h3>
            <p>End-to-end transparent process from offering, instant negotiations to digital lease agreement.</p>
          </div>

          <div className="glass-card feature-card shadow-hover animate-fade-in animate-delay-3">
            <div className="feature-icon-wrapper">
              <ShieldCheck className="feature-icon" />
            </div>
            <h3>Verified Trust</h3>
            <p>Integrated background and deep police verifications guarantees safety for both tenants and owners.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
