"use client"
import { getUserPortfolios, getUserFavourites, getUserById } from '../../services/firebase/db';
import { useAuth } from '../../services/useAuth';
import { useEffect, useState } from 'react';
import { PortfolioCard, Hero, DashboardHead } from '../../components/composition';
import styles from './dash.module.css'

const Dash = () => {
    const { currentUser } = useAuth();
    const [portfolios, setPortfolios] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [target, setTarget] = useState(undefined);  // Start as undefined, not null
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        setTarget(currentUser);
        setLoading(false);
        
    }, [currentUser]);

    useEffect(() => {
        if (loading) return;  // Prevents premature redirection

        if (!target?.id) {
            window.location.href = '/404'
        }

        getUserPortfolios(target.id).then(setPortfolios);

        if (target.id && target.favourites?.length > 0) {
            console.log("Getting favourites");
            getUserFavourites(target.favourites).then(setFavourites);
        }
    }, [target, currentUser, loading]);

    if (loading) return null;  // Prevents rendering until `target` is determined

    return (
        <div>
            <Hero 
                title="Your Dashboard"
                subtitle="Manage, track, and optimize your investment portfolios with ease."  
            />
            <div className={styles.container}>
                <h2 className={`title ${styles.title}`}>Your portfolios</h2>
                
                {portfolios.length > 0 ? (
                    <div style={{ width: '100%' }}>
                        <div style={{ gap: '2%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {portfolios.map((p) => (
                                <PortfolioCard key={p.id} portfolio={p} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                        <h2 className="head" style={{ width: 'fit-content' }}>You don't have any portfolios yet</h2>
                        <h3 className="subhead" style={{ width: 'fit-content', cursor: 'pointer' }}>
                            <a href="/portfolios">Create your first?</a>
                        </h3>
                    </div>
                )}

                {favourites.length > 0 && (
                    <div style={{ width: '100%' }}>
                        <h2 className={`title ${styles.title}`}>Your favourites</h2>
                        <div style={{ gap: '16px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {favourites.map((p) => (
                                <PortfolioCard key={p.id} portfolio={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dash;
