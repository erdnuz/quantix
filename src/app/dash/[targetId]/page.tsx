'use client'

import { getUserPortfolios, getUserById } from '../../../../services/firebase/db';
import { useEffect, useState } from 'react';
import { PortfolioCard, Hero } from '../../../components/composition';
import { useParams } from 'next/navigation';
import { Portfolio, User } from '../../../../types';

const Dash = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [target, setTarget] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const t = params.targetId as string;

  useEffect(() => {
    getUserById({ id: t })
      .then((user) => {
        setTarget(user);
        setLoading(false);
      })
      .catch(() => {
        setTarget(null);
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    if (loading || !target?.id) return;
    getUserPortfolios({ userId: target.id }).then(setPortfolios);
  }, [target, loading]);

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6">
      <Hero
        title={`${target?.firstName ?? ''} ${target?.lastName ?? ''}`}
        subtitle={target?.username ?? ''}
      />
      <div className="p-4 sm:p-6 md:p-12 flex flex-col gap-6">
        {portfolios.length > 0 ? (
          <div className="w-full flex flex-wrap gap-4 justify-center">
            {portfolios.map((p) => (
                <PortfolioCard key={p.id} portfolio={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col w-full items-center text-center gap-2 py-12">
            <h2 className="text-2xl sm:text-3xl font-semibold">No portfolios yet</h2>
            <p className="text-sm sm:text-base text-secondary-light dark:text-secondary-dark">
              This user hasn’t created any portfolios.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dash;
