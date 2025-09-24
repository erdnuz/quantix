'use client'
import { getUserPortfolios, getUserFavouritePortfolios } from '../../../services/firebase/db';
import { useAuth } from '../../../services/useAuth';
import { useEffect, useState, useMemo } from 'react';
import { PortfolioCard, Hero } from '../../components/composition';
import Link from 'next/link';
import { Portfolio, User } from '../../../types';
import { Button, TabGroup } from '@/components/primitive';
const Dash = () => {
  const { currentUser } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [favourites, setFavourites] = useState<Portfolio[]>([]);
  const [combined, setCombined] = useState<Portfolio[]>([]);
  const [target, setTarget] = useState<User | null>();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'By You' | 'Favourites'>('All');

  useEffect(() => {
    setTarget(currentUser);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (loading || !target?.id) return;

    getUserPortfolios({ userId: target.id }).then(setPortfolios);
    getUserFavouritePortfolios({ userId: target.id }).then(setFavourites);
  }, [target, loading]);

  // Combine portfolios and favourites, mark source
  useEffect(() => {
    const combinedList = [
      ...portfolios,
      ...favourites
    ];
    combinedList.sort((a, b) => {
        const dateA = new Date(a.created).getTime();
        const dateB = new Date(b.created).getTime();
        return dateB - dateA;
        });
    setCombined(combinedList);
  }, [portfolios, favourites]);

  const filteredPortfolios = useMemo(() => {
    if (filter === 'All') return combined;
    return combined.filter((p) => {{return (filter=="Favourites"&&p.userId!=currentUser?.id || filter=="By You"&&p.userId==currentUser?.id)}});
  }, [combined, filter, currentUser]);

  if (loading) return null;

  return (
    <div className="flex flex-col">
      {/* Hero / Welcome Section */}
      <Hero 
        title="Your Portfolios" 
        subtitle="Manage and track all your portfolios in one place" 
      />

      <div className="flex flex-col justify-between items-center p-4 sm:p-8 md:p-12 gap-4">
            {/* Create Portfolio Button */}
            <Link href="/dash/create" className="w-full sm:w-auto mt-4 sm:mt-0">
                <Button
                type="secondary"
                icon="plus"
                label="Create Portfolio"
                className="px-6 py-3 justify-center w-full sm:w-auto"
                />
            </Link>
            
            
            {/* TabGroup stays unchanged */}
            <TabGroup
                currentTab={filter}
                options={["All", "By You", "Favourites"]}
                onSelect={setFilter}
            />

            
            </div>



      {/* Portfolios Section */}
      <section className="flex flex-col p-4 sm:p-8 md:p-12 gap-6">
        {filteredPortfolios.length > 0?<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Combined Portfolios */}
          {filteredPortfolios.length > 0
            ? filteredPortfolios.map((p) => <PortfolioCard key={p.id} portfolio={p} />)
            : null
          }
        </div>:null}

        {filteredPortfolios.length === 0 && (
  <div className="flex text-sm sm:text-base flex-col items-center text-center py-12 text-gray-500 px-6">
    {filter === 'All' && (
      <p>
        You don&apos;t have any portfolios yet. Explore public portfolios in the{' '}
        <Link href="/portfolios" className="text-brand underline hover:text-brand-dark">
          Portfolio Screener
        </Link>{' '}
        or{' '}
        <Link href="/dash/create" className="text-brand underline hover:text-brand-dark">
          create your own
        </Link>.
      </p>
    )}
    {filter === 'By You' && (
      <p>
        You haven&apos;t created any portfolios yet. Start by{' '}
        <Link href="/dash/create" className="text-brand underline hover:text-brand-dark">
          creating your first portfolio
        </Link>.
      </p>
    )}
    {filter === 'Favourites' && (
      <p>
        You don&apos;t have any favourite portfolios yet. Browse the{' '}
        <Link href="/portfolios" className="text-brand underline hover:text-brand-dark">
          Portfolio Screener
        </Link>{' '}
        to find portfolios you like.
      </p>
    )}
  </div>
)}

      </section>
    </div>
  );
}

export default Dash;
