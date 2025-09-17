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
    getUserById({id:t})
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
    getUserPortfolios({userId:target.id}).then(setPortfolios);
  }, [target, loading]);

  if (loading) return null;

  return (
    <div>
      <Hero
        title={`${target?.firstName ?? ''} ${target?.lastName ?? ''}`}
        subtitle={target?.username ?? ''}
      />
      <div className="px-16 py-16 flex flex-col gap-4 sm:px-6">
        {portfolios.length > 0 ? (
          <div className="w-full">
            <div className="flex flex-wrap gap-2">
              {portfolios.map((p) => (
                <PortfolioCard key={p.id} portfolio={p} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full items-center text-center gap-2">
            <h2 className="text-2xl font-semibold">You don't have any portfolios yet</h2>
            <h3 className="text-lg text-blue-600 cursor-pointer">
              <a href="/portfolios">Create your first?</a>
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dash;
