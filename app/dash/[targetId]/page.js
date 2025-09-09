"use client"
import { getUserPortfolios, getUserById } from '../../../services/firebase/db';
import { useEffect, useState } from 'react';
import { PortfolioCard, Hero} from '../../../components/composition';
import { useParams } from 'next/navigation';
import styles from '../dash.module.css'


const Dash = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [target, setTarget] = useState(undefined);  // Start as undefined, not null
    const [loading, setLoading] = useState(true);

    const params = useParams()
    const t = params.targetId;

    useEffect(() => {
        getUserById(t).then(user => {
                setTarget(user);
                setLoading(false);
            }).catch(() => {
                setTarget(null);
                setLoading(false);
            });
        
    }, [t]);

    useEffect(() => {
        if (loading) return;  // Prevents premature redirection

        getUserPortfolios(target.id).then(setPortfolios);

    }, [target, loading]);

    if (loading) return null;  // Prevents rendering until `target` is determined

    return (
        <div>
            <Hero 
                title={`${target?.firstName} ${target?.lastName}`} 
                subtitle={ target?.username} 
            />
            <div className={styles.container}>
                
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

            </div>
        </div>
    );
}

export default Dash;
