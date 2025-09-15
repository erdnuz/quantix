'use client'
import { getUserPortfolios, getUserFavourites } from '../../../services/firebase/db';
import { useAuth } from '../../../services/useAuth';
import { useEffect, useState } from 'react';
import { PortfolioCard, Hero } from '../../../components/composition';

const Dash = () => {
    const { currentUser } = useAuth();
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [favourites, setFavourites] = useState<any[]>([]);
    const [target, setTarget] = useState<any>();  // Start as undefined
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTarget(currentUser);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        if (loading) return;

        if (!target?.id) {
            window.location.href = '/404';
            return;
        }

        getUserPortfolios({userId:target.id}).then(setPortfolios);

        if (target.id && target.favourites?.length > 0) {
            getUserFavourites({ favourites:target.favourites } ).then(setFavourites);
        }
    }, [target, currentUser, loading]);

    if (loading) return null;

    return (
        <div>
            <Hero 
                title="Your Dashboard"
                subtitle="Manage, track, and optimize your investment portfolios with ease."  
            />

            <div className="px-16 py-16 flex flex-col gap-4 md:px-6 md:py-6">
                <h2 className="text-4xl font-bold mb-4">Your portfolios</h2>

                {portfolios.length > 0 ? (
                    <div className="w-full flex flex-wrap gap-2">
                        {portfolios.map((p) => (
                            <PortfolioCard key={p.id} portfolio={p} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col w-full items-center text-center">
                        <h2 className="text-2xl font-semibold">You don't have any portfolios yet</h2>
                        <h3 className="text-lg mt-2">
                            <a href="/portfolios" className="text-blue-500 hover:underline cursor-pointer">Create your first?</a>
                        </h3>
                    </div>
                )}

                {favourites.length > 0 && (
                    <div className="w-full mt-8">
                        <h2 className="text-4xl font-bold mb-4">Your favourites</h2>
                        <div className="flex flex-wrap gap-4">
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
