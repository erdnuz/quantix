'use client';
import { useState } from 'react';
import { TagGroup, Select, Button } from '../primitive';
import { useAuth } from '../../../services/useAuth';
import { createPortfolio } from '../../../services/firebase/db';
import { Portfolio, PortfolioTag } from '../../../types';
import Link from 'next/link';

const tagItems = [
  "Growth","Value","Dividend","Balanced","Aggressive","Conservative",
  "Emerging Markets","Emerging Tech","Small Cap","Large Cap","Diversified",
  "Short-term","Long-term",
] as PortfolioTag[];

function removeContradictions(prev: number[], n: number[]): number[] {
  const newList = n.filter(t => !prev.includes(t));
  if (!newList.length) return n;
  const newTag = newList[0];

  if (newTag < 2) n = n.filter(idx => idx === newTag || idx > 1);
  if (newTag === 4 || newTag === 5) n = n.filter(idx => idx === newTag || idx < 4 || idx > 5);
  if (newTag === 8 || newTag === 9) n = n.filter(idx => idx === newTag || idx < 8 || idx > 9);
  if (newTag > 11) n = n.filter(idx => idx === newTag || idx < 12);

  if (n.length > 5) return prev;
  return n;
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const NewPortfolio: React.FC = () => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [initial, setInitial] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { currentUser } = useAuth();

  function reset() {
    setSelectedIndices([]);
    setInitial(1);
    setTitle('');
    setDescription('');
    setError('');
  }

  function handleCreate() {
    if (!title.trim()) {
      setError('Please provide a title for your portfolio');
      return;
    }
    
    if (currentUser) createPortfolio({
      data: {
        userId: currentUser.id,
        initialCash: [1000, 10000, 100000][initial],
        cash: [1000, 10000, 100000][initial],
        title: toTitleCase(title),
        description,
        tags: selectedIndices.map(i => tagItems[i]),
      } as Portfolio,
      onSuccess: () => {
        reset();
        window.location.href = '/dash/';
      }
    });
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-12 p-4 sm:p-8 md:p-12 text-primary-light dark:text-primary-dark rounded-xl shadow-lg">
      
      {/* Left Side: Inputs & Tags */}
      <div className="flex flex-col gap-2 sm:gap-6 flex-1 max-w-full md:max-w-xl">

        <div className="flex flex-col">
        <label htmlFor="title" className="ml-1 text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          placeholder="Portfolio Title"
          aria-label="Portfolio Title"
          className="w-full text-sm sm:text-base md:text-lg p-2 sm:p-4 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light dark:focus:ring-brand-dark transition"
        />
        </div>
      </div>

      <div className="flex flex-col">
        <label htmlFor="description" className="ml-1 text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={e => { setDescription(e.target.value); setError(''); }}
          placeholder="Describe your portfolio (optional)"
          rows={4}
          aria-label="Portfolio Description"
          className="w-full text-sm sm:text-base md:text-lg p-2 sm:p-4 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light dark:focus:ring-brand-dark transition"
        />
      </div>

        {/* Tags */}
        <div className="flex flex-col gap-3">
          <h2 className="text-secondary-light dark:text-secondary-dark text-sm sm:text-base">
            Select up to 5 tags ({5 - selectedIndices.length} remaining)
          </h2>
          <TagGroup
            items={tagItems}
            iconType="hash"
            selectedIndices={selectedIndices}
            setSelectedIndices={lst =>
              setSelectedIndices(prev => removeContradictions(prev, lst))
            }
          />
        </div>

      {/* Right Side: Hint & Initial Investment */}
      <div className="flex flex-col justify-between flex-1 max-w-full md:max-w-md w-full">
        <div className="flex flex-col gap-6">
          <div className="border border-border-light dark:border-border-dark rounded-lg p-2 sm:p-4 bg-surface-light dark:bg-surface-dark text-sm md:text-base text-secondary-light dark:text-secondary-dark leading-relaxed">
            Use the{' '}
            <Link href="/screener" className="font-semibold underline hover:text-brand-hover">
              Screener
            </Link>{' '}
            to discover and compare assets. When you find one you like, go to its metrics page to view details and use the <span className="italic">“Add / Remove”</span> button to manage it in your portfolio.
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-base font-medium">Initial Investment</h2>
              <Select
                options={[
                  { label: '$1,000' },
                  { label: '$10,000' },
                  { label: '$100,000' }
                ]}
                selected={initial}
                setSelected={setInitial}
              />
            </div>
            <p className="text-xs sm:text-sm text-secondary-light dark:text-secondary-dark">
              Choose your starting portfolio value. This is a <span className="font-medium">simulated</span> investment amount used only to track performance — no real money is involved.
            </p>
            {error && <p className="text-bad font-medium text-sm">{error}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row gap-3 mt-6">
          <Button
            type="secondary"
            label="Cancel"
            onClick={reset}
            className="flex-1 bg-secondary-light dark:bg-secondary-dark hover:bg-secondary-hover dark:hover:bg-secondary-hover"
          />
          <Button
            type="brand"
            label="Create Portfolio"
            disabled={!currentUser}
            onClick={handleCreate}
            className="flex-1 bg-brand-light dark:bg-brand-dark hover:bg-brand-hover dark:hover:bg-brand-hover"
          />
        </div>
      </div>
    </div>
  );
};
