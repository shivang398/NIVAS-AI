import React from 'react';
import { ShieldCheck, FileText, CheckCircle } from 'lucide-react';

const SmartLeaseDocument = ({ lease }) => {
  if (!lease) return null;

  const startDate = new Date(lease.startDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const endDate = new Date(lease.endDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="legal-document" style={{
      background: 'white',
      color: '#1a1a1a',
      padding: '40px 60px',
      fontFamily: 'serif',
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      border: '1px solid #eee'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Residential Lease Agreement</h1>
        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>Document ID: NIVAS-LSE-{lease.id.substring(0,8).toUpperCase()}</p>
      </div>

      {/* Parties */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>1. THE PARTIES</h3>
        <p>This Residential Lease Agreement ("Agreement") is made on <b>{startDate}</b>, between:</p>
        <div style={{ marginLeft: '20px' }}>
          <p><b>LESSOR (Landlord):</b> {lease.owner?.name || "Verified Nivas Owner"} <br/>
          <span style={{ fontSize: '0.9rem' }}>Contact: {lease.owner?.email}</span></p>
          
          <p><b>LESSEE (Tenant):</b> {lease.tenant?.name || "Verified Nivas Tenant"} <br/>
          <span style={{ fontSize: '0.9rem' }}>Contact: {lease.tenant?.email}</span></p>
        </div>
      </section>

      {/* Property */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>2. THE PROPERTY</h3>
        <p>The Lessor agrees to lease to the Lessee the following premises located at:</p>
        <div style={{ marginLeft: '20px', padding: '10px', background: '#f9f9f9', borderLeft: '4px solid #333' }}>
          <b>{lease.property?.title || "Residential Unit"}</b><br/>
          {lease.property?.location || "Nivas Verified Location"}
        </div>
      </section>

      {/* Terms */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>3. TERM AND RENT</h3>
        <p><b>A. Term:</b> This lease shall commence on <b>{startDate}</b> and continue until <b>{endDate}</b> (the "Term").</p>
        <p><b>B. Rent:</b> The monthly rent shall be <b>₹{lease.rent}</b>, payable on the 1st of each month via the Nivas Digital Payment system.</p>
        <p><b>C. Duration:</b> {lease.duration} Months.</p>
      </section>

      {/* Clauses */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>4. STANDARD CLAUSES</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}><b>Nivas AI Trust Guarantee:</b> Both parties have successfully completed background and identity verification via the Nivas Trust Center.</li>
          <li style={{ marginBottom: '10px' }}><b>Maintenance:</b> Major structural repairs are the responsibility of the Lessor. Minor wear and tear and general maintenance are the collective responsibility of both parties as facilitated by Nivas maintenance requests.</li>
          <li style={{ marginBottom: '10px' }}><b>Termination:</b> A minimum of 30 days notice is required for early termination by either party.</li>
        </ol>
      </section>

      {/* Signature */}
      <div style={{ marginTop: '60px', borderTop: '2px dashed #eee', paddingTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
             <div style={{ fontStyle: 'italic', marginBottom: '5px' }}>[Digitally Signed]</div>
             <div style={{ borderBottom: '1px solid #000', padding: '5px' }}><b>{lease.owner?.name}</b></div>
             <p style={{ fontSize: '0.8rem' }}>LESSOR</p>
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
             <div style={{ fontStyle: 'italic', marginBottom: '5px' }}>[Digitally Signed]</div>
             <div style={{ borderBottom: '1px solid #000', padding: '5px' }}><b>{lease.tenant?.name}</b></div>
             <p style={{ fontSize: '0.8rem' }}>LESSEE</p>
          </div>
        </div>
      </div>

      {/* Footer Certification */}
      <div style={{ marginTop: '50px', padding: '15px', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '8px', border: '1px solid #4ade80' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534' }}>
            <ShieldCheck size={24} />
            <div>
               <b style={{ fontSize: '0.9rem' }}>Nivas Smart-Contract Certification</b>
               <p style={{ margin: 0, fontSize: '0.7rem' }}>Verified via Digital Trust Center. Hash: {lease.id.replace(/-/g, '')}</p>
            </div>
         </div>
      </div>
      
      <div className="no-print" style={{ marginTop: '30px', textAlign: 'center' }}>
         <p style={{ color: '#666', fontSize: '0.8rem' }}>Preserve this digital original. Hardcopies carry the Nivas QR verification tag.</p>
      </div>
    </div>
  );
};

export default SmartLeaseDocument;
