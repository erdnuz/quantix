import React from 'react';
import Link from 'next/link';
import Head from 'next/head';


const NotFound = () => {
  return (
    <div>
      <Head>
        <title>404 - Page Not Found | Quantix</title>
        <meta property="og:title" content="404 - Page Not Found | Quantix" />
        <meta property="og:description" content="Sorry, the page you are looking for could not be found. Please check the URL or go back to the home page." />
        <meta property="og:url" content="https://quant-algo-4430a.web.app/404" />
        <meta name="twitter:title" content="404 - Page Not Found | Quantix" />
        <meta name="twitter:description" content="Sorry, the page you are looking for could not be found. Please check the URL or go back to the home page." />
        <link rel="canonical" href="https://www.quantix.com/404" />
    </Head>

    
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'left',
      justifyContent: 'left',
      textAlign: 'left',
      padding: '64px',
      gap:'16px'
    }
      }>
      <h1 className="title">Oops! Page Not Found</h1>
      <p className="body">
        The page you're looking for doesn't exist or has been moved. <br></br>It's possible you
        entered the wrong URL, or the page has been removed.
      </p>
      <div style={{
        display: 'flex',
        maxWidth: '400px',
        flexDirection: 'row',
        gap: '10px'
      }}>
        <Link href='/' className='btn brand' >
        Take me home
        </Link>
        
      </div>
    </div>
    </div>
  );
};

export default NotFound;

