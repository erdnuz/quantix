import React from 'react';
import { Hero } from '../../components/composition';

const Faq = () => {
  return (
      
    
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '16px', 
      width: '100%', 
    }}>
      <Hero title="Frequently Asked Questions" />
      
      <div className='container' style={{ maxWidth: '800px', display:'flex', flexDirection:'column', gap:'16px', textAlign: 'left',  marginBottom: '32px' }}>
        
        <div>
          <h2 className="subhead" style={{ fontWeight:'bold', fontSize: '24px', marginTop: '24px', marginBottom: '4px' }}>
            Q: How often is the data updated?
          </h2>
          <p className="body" style={{ fontSize: '16px', lineHeight: 1.5 }}>
            The screener data is updated monthly, and data for an individual asset is fetched as you expand it.
          </p>
        </div>
        
        <div>
          <h2 className="subhead" style={{ fontWeight:'bold', fontSize: '24px', marginTop: '24px', marginBottom: '4px' }}>
            Q: When will the advanced portfolio metrics appear?
          </h2>
          <p className="body">
            We require at least 90 days of portfolio data for our advanced metrics such as the Alpha and Sharpe ratios to be calculated and displayed.
          </p>
        </div>

        <div>
          <h2 className="subhead" style={{ fontWeight:'bold', fontSize: '24px', marginTop: '24px', marginBottom: '4px' }}>
            Q: How do I delete my account?
          </h2>
          <p className="body">
            Go to <strong>Edit Profile</strong> in the dropdown menu under your avatar, then press <strong>Delete Account</strong> and confirm.
          </p>
        </div>

        <div>
          <h2 className="subhead" style={{ fontWeight:'bold', fontSize: '24px', marginTop: '24px', marginBottom: '4px' }}>
            Q: How can I contact Quantix?
          </h2>
          <p className="body">
            Use the <strong>Contact</strong> link in the footer of our website.
          </p>
        </div>

        <div>
          <h2 className="subhead" style={{ fontWeight:'bold', fontSize: '24px', marginTop: '24px', marginBottom: '4px' }}>
            Q: What is the Q-Score?
          </h2>
          <p className="body">
            The Q-Score is our proprietary ranking system that evaluates an asset by taking into account many metrics from the screener and beyond. It compares the asset to its rivals in the sector, category, and the overall market.
          </p>
        </div>

      </div>
    </div>
    
  );
}

export default Faq;
