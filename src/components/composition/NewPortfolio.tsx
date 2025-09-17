'use client'
import { useState } from 'react';
import { TagGroup, Select, Button } from '../primitive';
import { useAuth } from '../../../services/useAuth';
import { createPortfolio } from '../../../services/firebase/db';

const tagItems = [
  "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",
  "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",
  "Short-term", "Long-term",
];

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
    if (!title) {
      setError('Please provide a title for your portfolio');
      return;
    }
    createPortfolio({
      data:{
        userId: currentUser!.id,
        initialCash: [1000, 10000, 100000][initial],
        cash: [1000, 10000, 100000][initial],
        title: toTitleCase(title),
        description,
        tags: selectedIndices,
      },
      onSuccess: () => {
        reset();
        window.location.href = '/dash/';
      }}
    );
  }

  return (
    <div className="flex flex-col gap-4 px-16 py-16 md:px-6 md:py-6">
      {/* Inputs and Tags */}
      <div className="flex flex-row gap-6 flex-wrap md:flex-col">
        <div className="flex flex-col gap-3 max-w-md flex-1">
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(''); }}
            placeholder="Choose a title"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setError(''); }}
            placeholder="Describe your portfolio"
            rows={4}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-gray-500 text-lg">
            Select up to 5 tags ({5 - selectedIndices.length} remaining)
          </h2>
          <TagGroup
            items={tagItems}
            iconType="hash"
            size={0}
            selectedIndices={selectedIndices}
            setSelectedIndices={lst =>
              setSelectedIndices(prev => removeContradictions(prev, lst))
            }
          />
        </div>
      </div>

      {/* Initial investment and note */}
      <div className="flex flex-row gap-6 flex-wrap md:flex-col items-start">
        <div className="flex gap-6 max-w-md w-full items-center">
          <h2 className="text-base font-medium">Select your initial investment</h2>
          <Select options={[["$1k"], ["$10k"], ["$100k"]]} selected={initial} setSelected={setInitial} />
        </div>
        <h2 className="text-gray-500 text-sm md:text-xs">
          Investments are simulated to track progress, never risking real funds
        </h2>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Buttons and info */}
      <div className="flex flex-col gap-3 md:gap-2">
        <div className="flex gap-2 max-w-md">
          <Button type="secondary" label="Cancel" onClick={reset} />
          <Button type="brand" label="Create Portfolio" disabled={!currentUser} onClick={handleCreate} />
        </div>
        <h2 className="text-gray-500 text-sm">
          After creating your portfolio, you can add or remove assets by searching in the navigation or through the{' '}
          <a href="/screener" className="font-bold underline">Screener</a>.
        </h2>
      </div>
    </div>
  );
};
