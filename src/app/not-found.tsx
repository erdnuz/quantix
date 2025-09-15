import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 flex flex-col">
      <Head>
        <title>404 - Page Not Found | Quantix</title>
        <meta property="og:title" content="404 - Page Not Found | Quantix" />
        <meta
          property="og:description"
          content="Sorry, the page you are looking for could not be found. Please check the URL or go back to the home page."
        />
        <meta property="og:url" content="https://quant-algo-4430a.web.app/404" />
        <meta name="twitter:title" content="404 - Page Not Found | Quantix" />
        <meta
          name="twitter:description"
          content="Sorry, the page you are looking for could not be found. Please check the URL or go back to the home page."
        />
        <link rel="canonical" href="https://www.quantix.com/404" />
      </Head>

      <main className="flex flex-col items-start justify-start p-16 gap-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold">Oops! Page Not Found</h1>
        <p className="text-lg leading-relaxed">
          The page you're looking for doesn't exist or has been moved. <br />
          It's possible you entered the wrong URL, or the page has been removed.
        </p>
        <div className="flex flex-row gap-2 mt-4">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Take me home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
