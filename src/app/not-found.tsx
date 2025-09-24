import React from 'react';
import Link from 'next/link';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 flex flex-col">

      <main className="flex flex-col items-start justify-start p-16 gap-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold">Oops! Page Not Found</h1>
        <p className="text-lg leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. <br />
          It&apos;s possible you entered the wrong URL, or the page has been removed.
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
