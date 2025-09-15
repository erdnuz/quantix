'use client';
import React from "react";
import Link from "next/link";
import styles from "./panel.module.css";

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
    <div className={`${styles.tcol} ${reverse ? styles.reverse : ""}`}>
      <div className={styles.col}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <h2 className={styles.subtitle}>{subtitle}</h2>}
        {body && <p className={styles.body}>{body}</p>}
        {buttonText && (
          <Link 
            href={query ? { pathname: href, query: { t: query } } : href} 
            className="btn primary"
          >
            {buttonText}
          </Link>
        )}
      </div>
      <div className={styles.icol}>
        <img src={image} alt={title} className={styles.image} />
      </div>
    </div>
  );
};
