'use client'
import { getUserPortfolios, getUserFavourites } from '../../../services/firebase/db';
import { useAuth } from '../../../services/useAuth';
import { useEffect, useState } from 'react';
import { PortfolioCard, Hero } from '../../components/composition';
import Link from 'next/link';
import { Button } from '@/components/primitive';

const Dash = () => {
    const { currentUser } = useAuth();
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [favourites, setFavourites] = useState<any[]>([]);
    const [target, setTarget] = useState<any>();
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

        getUserPortfolios({ userId: target.id }).then(setPortfolios);

        if (target.id && target.favourites?.length > 0) {
            getUserFavourites({ favourites: target.favourites }).then(setFavourites);
        }
    }, [target, currentUser, loading]);

    if (loading) return null;

    return (
        <div className="flex flex-col gap-12 ">
            
            {/* Hero / Welcome Section */}
            <Hero 
            title="Your Portfolios" 
            subtitle="Manage and track all your portfolios in one place" 
/>

            {/* Portfolios Section */}
            <section className="flex flex-col p-12 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* "Create Portfolio" Card */}
                    <Link href="/dash/create"
                    className='mb-6'>
                        <div className="flex flex-col h-full items-center justify-center p-6 border rounded-lg shadow-md cursor-pointer hover:shadow-lg transition duration-200 text-center bg-white">
                            <div className="text-4xl font-bold mb-2 text-brand">+</div>
                            <div className="font-semibold text-lg">Create Portfolio</div>
                        </div>
                    </Link>

                    {/* Existing Portfolios */}
                    {portfolios.length > 0 ? (
                        portfolios.map((p) => (
                            <PortfolioCard key={p.id} portfolio={p} />
                        ))
                    ) : null}
                </div>

                {portfolios.length === 0 && (
                    <div className="flex flex-col items-center text-center py-12 text-gray-500">
                        <p>No portfolios yet. Use the card above to create your first one.</p>
                    </div>
                )}
            </section>

            {/* Favourites Section */}
            {favourites.length > 0 && (
                <section className="flex flex-col gap-6">
                    <h2 className="text-4xl font-bold">Your Favourites</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favourites.map((p) => (
                            <PortfolioCard key={p.id} portfolio={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default Dash;
