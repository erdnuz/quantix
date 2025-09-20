'use client';
import React from "react";
import Link from "next/link";

interface ImagePanelProps {
  title: string;
  subtitle?: string;
  body?: string;
  buttonText?: string;
  image: string;
  reverse?: boolean;
  href: string;
  query?: string[] | null;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({
  title,
  subtitle,
  body,
  buttonText,
  image,
  reverse = false,
  href,
  query = null
}) => {
  return (
    <section className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-6 lg:gap-12 p-12  bg-light dark:bg-dark rounded-xl shadow-sm`}>
      
      {/* Text Content */}
      <div className="flex-1 text-center lg:text-left space-y-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary-light dark:text-primary-dark">{title}</h1>
        {subtitle && <h2 className="text-xl lg:text-2xl font-semibold text-secondary-light dark:text-secondary-dark">{subtitle}</h2>}
        {body && <p className="text-base lg:text-lg text-primary-light dark:text-primary-dark">{body}</p>}
        {buttonText && (
          <Link
            href={query ? { pathname: href, query: { t: query } } : href}
            className="inline-block mt-4 px-6 py-3 rounded-lg bg-accent-light text-light font-semibold hover:bg-accent-dark dark:bg-accent-dark dark:text-dark dark:hover:bg-accent-light transition-colors"
          >
            {buttonText}
          </Link>
        )}
      </div>

      {/* Image */}
      <div className="flex-1 w-full max-w-md lg:max-w-lg">
        <img src={image} alt={title} className="w-full h-auto rounded-lg object-cover shadow-lg" />
      </div>
    </section>
  );
};
