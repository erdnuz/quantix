import React from "react";
import Link from "next/link";
import styles from"./panel.module.css"; 

export function ImagePanel({ 
    title, 
    subtitle, 
    body, 
    buttonText, 
    image, 
    reverse = false, 
    href,
    query=null
}) {
    return (
        <div className={`${ styles.tcol } ${reverse ? styles.reverse : ""}`}>
            
            <div className={ styles.col }>
                <h1 className={ styles.title }>{title}</h1>
                <h2 className={ styles.subtitle }>{subtitle}</h2>
                <p className={ styles.body }>{body}</p>
                 
                    <Link href={query?{pathname:href, query: {t:query}}:href} className="btn primary">{buttonText}</Link>
            </div>
            <div className={ styles.icol }>
                <img src={image} className={ styles.image } />
            </div>
        </div>
    );
};

