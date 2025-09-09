import React from 'react';
import { Hero } from '../../components/composition';

const Privacy = () => { 
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
      <Hero title="Privacy Disclaimer" />
      
      <div className='container' style={{ maxWidth: '800px', display:'flex', flexDirection:'column', gap:'16px',textAlign: 'left',  marginTop:'16px',marginBottom: '32px' }}>
        <p className="body" style={{ fontSize: '16px', lineHeight: 1.5 }}>
          Your privacy is important to us. This Privacy Disclaimer outlines how we collect, use, and protect your data. By using our services, you agree to the practices described below.
        </p>

        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom: '4px' }}>1. Data Collection</h2>
        <p className="body">
          We collect only the necessary data required to provide our services. This may include, but is not limited to, your name, email address, and any information you provide when using the platform. We do not track your usage or browsing behavior beyond what is essential for delivering the service.
        </p>

        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom: '4px' }}>2. Data Usage</h2>
        <p className="body">
          The data we collect is used to improve and deliver our services. We reserve the right to consult the data stored in our databases, including information such as your email and name, for internal purposes. This may include troubleshooting, improving user experience, and ensuring the security and integrity of our platform.
        </p>

        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom: '4px' }}>3. No Data Sharing</h2>
        <p className="body">
          We respect your privacy and will not share your data with third parties without your explicit consent, unless required by law. Your personal information will never be sold, rented, or disclosed for marketing purposes.
        </p>

        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom: '4px' }}>4. Data Security</h2>
        <p className="body">
          We implement reasonable security measures to protect your data from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom: '4px' }}>5. User Responsibility</h2>
        <p className="body">
          You are responsible for maintaining the confidentiality of your account information and for any activity that occurs under your account. Please notify us immediately of any unauthorized use of your account.
        </p>

        <h2 className="subhead" style={{ fontSize: '20px', marginTop: '24px', marginBottom: '4px' }}>6. Changes to this Privacy Disclaimer</h2>
        <p className="body">
          We may update this Privacy Disclaimer from time to time. It is your responsibility to review it periodically. Continued use of the service following any changes constitutes acceptance of the new terms.
        </p>

        <p className="body" style={{ marginTop: '32px', fontStyle: 'italic' }}>
          If you have any questions about this Privacy Disclaimer, please contact us.
        </p>
      </div>
    </div>
    </div>
  );
}
export default Privacy;
