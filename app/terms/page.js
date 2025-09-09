import React from 'react';
import { Hero } from '../../components/composition';
import Head from 'next/head';
const Terms = () => { 
  return (
    <div>

    
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      
      gap: '16px',
      width: '100%',
    }}>
      <Hero title="Terms and Conditions" />
      
      <div className='container' style={{ maxWidth: '800px', display:'flex', flexDirection:'column', gap:'16px',textAlign: 'left',  marginTop:'16px',marginBottom: '32px' }}>
        <p className="body" style={{ fontSize: '16px', lineHeight: 1.5 }}>
          By using this website, you agree to be bound by the following terms and conditions. Please read them carefully. If you do not accept these terms, you should not use our services.
        </p>

        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
          <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom:'4px' }}>1. No Financial Advice</h2>
          <p className="body">
            The information provided on this site is for informational purposes only. We are a data aggregation and simplification service. We do not provide personalized financial advice, investment recommendations, or endorse any specific securities, financial instruments, or strategies.  
          </p>
          <p className="body">
            All decisions made based on the information on this site are at your own risk. You should consult with a qualified financial advisor before making any investment decisions.
          </p>
        </div>
        
        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom:'4px' }}>2. User Assumes All Liability</h2>
        <p className="body">
          By using this website, you acknowledge and agree that all risks associated with the use of the information and services provided here are solely your responsibility. Any losses incurred—whether financial, emotional, or otherwise—are entirely your liability. We are not responsible for any damages or losses resulting from your use of this site.
        </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom:'4px' }}>3. Accuracy of Information</h2>
        <p className="body">
          We strive to ensure the accuracy of the data presented on our site; however, we cannot guarantee that all information is current, complete, or free from errors. Market data is subject to change without notice, and we are not responsible for any inaccuracies or omissions.
        </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom:'4px' }}>4. Use of the Service</h2>
        <p className="body">
          You agree to use this service for informational purposes only and not for any unlawful or prohibited activities. You may not reproduce, distribute, or exploit any content on this site for commercial purposes without prior written permission.
        </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
          <h2  className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom:'4px' }}>5. Limitation of Liability</h2>
        <p className="body">
          We are not liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with your use of this site, including, but not limited to, financial losses or trading losses.
        </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
        <h2  className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom:'4px' }}>6. Governing Law</h2>
        <p className="body">
          These terms and conditions are governed by the laws of your jurisdiction. Any disputes related to these terms will be resolved in accordance with local laws.
        </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom:'4px' }}>7. Changes to Terms</h2>
        <p className="body">
          We reserve the right to modify these terms at any time. It is your responsibility to review these terms periodically. Continued use of the service following any changes constitutes acceptance of the new terms.
        </p>
        </div>
        

        <p className="body" style={{ marginTop: '32px', fontStyle: 'italic' }}>
          If you have any questions about these Terms and Conditions, please contact us.
        </p>
      </div>
    </div>
    </div>
  );
}

export default Terms;