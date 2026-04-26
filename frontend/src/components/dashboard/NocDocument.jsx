import React from 'react';
import { ShieldCheck, UserCheck } from 'lucide-react';

const NocDocument = ({ verification }) => {
  if (!verification) return null;

  const dateIssued = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="legal-document noc-print" style={{
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <ShieldCheck size={48} color="#1a1a1a" />
        </div>
        <h1 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>No Objection Certificate (NOC)</h1>
        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>Offical Police Clearance Certificate</p>
        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>Certificate ID: NIVAS-NOC-{verification.id.substring(0,8).toUpperCase()}</p>
      </div>

      {/* Body */}
      <section style={{ marginBottom: '30px', textAlign: 'justify' }}>
        <p><b>TO WHOMSOEVER IT MAY CONCERN</b></p>
        <p>
          This is to certify that the applicant with Nivas Applicant ID <b>{verification.tenantId?.substring(0, 8)}...</b>, 
          who has accepted the rental offer reference <b>{verification.offerId}</b> {verification.offer?.property?.title ? <span>for property <b>{verification.offer.property.title}</b></span> : ''}, has been thoroughly vetted through 
          the <b>Nivas Automated Trust Center</b> and verified by the authorized <b>Police Portal</b>.
        </p>
        <p>
          Based on the background checks, identity document verification (Aadhar/PAN), and fraud check verification (AI Trust Score: {verification.fraudCheck ? 100 - verification.fraudCheck.score : 'Verified'}/100), 
          <b> no criminal records or derogatory information</b> have been found against the applicant in our jurisdiction. 
        </p>
        <p>
          We hold <b>no objection</b> to the applicant residing in the assigned Nivas verified property. This certificate is structurally tied to the smart lease agreement executed under Nivas AI protocols.
        </p>
      </section>

      {/* Issuance Date */}
      <section style={{ marginBottom: '40px' }}>
        <p><b>Date of Issuance:</b> {dateIssued}</p>
        <p><b>Status:</b> APPROVED & CLEARED</p>
      </section>

      {/* Signature */}
      <div style={{ marginTop: '60px', borderTop: '2px dashed #eee', paddingTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', width: '250px' }}>
             <div style={{ fontStyle: 'italic', marginBottom: '5px', color: '#166534' }}>[Digitally Approved]</div>
             <div style={{ borderBottom: '1px solid #000', padding: '5px', display: 'flex', justifyContent: 'center' }}>
               <UserCheck size={24} color="#166534" />
             </div>
             <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>AUTHORIZED POLICE PERSONNEL / NIVAS SYSTEM</p>
          </div>
        </div>
      </div>

      {/* Footer Certification */}
      <div style={{ marginTop: '50px', padding: '15px', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '8px', border: '1px solid #4ade80' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534' }}>
            <ShieldCheck size={24} />
            <div>
               <b style={{ fontSize: '0.9rem' }}>Nivas Official Verification Check</b>
               <p style={{ margin: 0, fontSize: '0.7rem' }}>Cryptographic Hash Verification: {verification.id.replace(/-/g, '')}</p>
            </div>
         </div>
      </div>
      
      <div className="no-print" style={{ marginTop: '30px', textAlign: 'center' }}>
         <button className="btn-primary" onClick={() => window.print()} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            🖨️ Print / Save as PDF
         </button>
      </div>

      {/* Inject print styles directly */}
      <style>{`
        @media print {
          /* Hide the main app UI and modal overlays */
          #root > .app-container, .no-print, button {
            display: none !important;
          }
          
          /* Reset background for printing */
          body {
            background: white !important;
          }
          
          /* Ensure the document is visible and positioned normally */
          .noc-print {
            position: relative !important;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NocDocument;
