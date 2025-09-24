'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {  getUserPortfolios } from '../../../services/firebase/db';
import { PillGroup, Select, Button } from '../primitive';
import { BaseDialog } from './BaseDialog';
import { useAuth } from '../../../services/useAuth';
import { Portfolio } from '../../../types';
import { getFastData, portfolioAction } from '../../../services/firebase/api';

interface BuySellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
}

export const BuySellDialog: React.FC<BuySellDialogProps> = ({ isOpen, onClose, ticker }) => {
  const { currentUser } = useAuth();
  const [error, setError] = useState<string>("");
  const [pill, setPill] = useState<'Add'|'Remove'>('Add');
  const [price, setPrice] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [maxSharesBuy, setMaxSharesBuy] = useState<number>(0);
  const [maxSharesSell, setMaxSharesSell] = useState<number>(0);
  const [availableCash, setAvailableCash] = useState<number>(0);
  const [availableShares, setAvailableShares] = useState<number>(0);
  const [selected, setSelected] = useState<number>(0);
  const [portfolioOptions, setPortfolioOptions] = useState<Portfolio[]>([]);
  const [quantity, setQuantity] = useState<number>(0);

  const close = () => {
    setError("");
    setPill('Add');
    setQuantity(0);
    onClose();
  };

  // Fetch price
  useEffect(() => {
    if (!ticker) return;
    getFastData({
      ticker,
      onSuccess: data => setPrice(data.price),
      onError: () => setError("Failed to fetch price."),
    });
  }, [ticker]);

  // Load portfolios
  useEffect(() => {
    if (currentUser?.id) {
      getUserPortfolios({ userId: currentUser.id }).then(data => {
        setPortfolioOptions(data);
        setPortfolio(data[0] || null);
      });
    }
  }, [currentUser?.id]);

  const selectPortfolio = (index: number) => {
    setSelected(index);
    setPortfolio(portfolioOptions[index]);
  };

  // Update max shares & available cash
  useEffect(() => {
    if (!portfolio || price === null) return;
    const maxBuy = Math.floor(portfolio.cash / price);
    const maxSell = portfolio.shares?.[ticker] || 0;
    setMaxSharesBuy(maxBuy);
    setMaxSharesSell(maxSell);
    setQuantity(pill === 'Remove' ? maxSell : maxBuy);
    setAvailableCash(portfolio.cash);
    setAvailableShares(maxSell);
  }, [portfolio, price, pill, ticker]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Math.max(parseInt(e.target.value || "0", 10), 0);
    if (!isNaN(value)) {
      value = pill === 'Remove' ? Math.min(value, maxSharesSell) : Math.min(value, maxSharesBuy);
      setQuantity(value);
    }
  };

  const execute = () => {
    if (!portfolio || price === null) return setError("Price hasn't loaded yet.");
    if (quantity <= 0) return setError("Enter a valid quantity.");

    const tradeValue = quantity * price;

    if (pill === 'Add' && tradeValue > availableCash) return setError("Insufficient funds.");
    if (pill === 'Remove' && quantity > availableShares) return setError("Not enough shares to remove.");

    portfolioAction({
      portfolioId: portfolio.id,
      ticker,
      shares: pill === 'Remove' ? -quantity : quantity,
      onSuccess: () => {
        setError("");
        onClose();
      },
      onError: setError,
    });
  };

  const projectedCash = quantity && price
    ? availableCash + (pill === 'Remove' ? quantity * price : -quantity * price)
    : availableCash;

  const projectedShares = quantity
    ? availableShares + (pill === 'Remove' ? -quantity : quantity)
    : availableShares;

  const isNegativeCash = projectedCash < availableCash;
  const isNegativeShares = projectedShares < availableShares;

  return (
    <BaseDialog isOpen={isOpen} onClose={close}>
      <div className="flex flex-col gap-4 min-w-xs sm:min-w-sm md:min-w-lg">
        {/* Pills */}
        <PillGroup size={0} currentPill={pill} onSelect={setPill} options={['Add','Remove']} />

        {/* Error */}
        {error && <div className="text-bad text-sm font-medium my-2">{error}</div>}

        <div className="flex flex-col gap-4 w-full">
          {/* Price */}
          <div className="flex justify-between items-center w-full">
            <span className="font-semibold text-2xl">{ticker}</span>
            <span className="text-sm text-secondary-light dark:text-secondary-dark">
              ${price?.toFixed(2) ?? "0.00"} USD
            </span>
          </div>

          {/* Portfolio */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-secondary-light dark:text-secondary-dark font-medium">Portfolio</label>
            {portfolioOptions.length > 0 ? (
              <Select
                size={1}
                options={portfolioOptions.map(p => ({ label: p.title }))}
                selected={selected}
                setSelected={selectPortfolio}
              />
            ) : (
              <Link
                href="/dash/create"
                className="text-brand-light dark:text-brand-dark font-medium hover:underline"
              >
                Create your first portfolio
              </Link>
            )}
          </div>

          {/* Quantity & projections */}
          {portfolioOptions.length > 0 && (
            <div className="flex flex-col gap-2 w-full">
              <label className="text-secondary-light dark:text-secondary-dark font-medium">Quantity</label>
              <input
                type="number"
                value={quantity > 0 ? quantity : ""}
                onChange={handleQuantityChange}
                min={1}
                max={pill === 'Remove' ? maxSharesSell : maxSharesBuy}
                placeholder="0"
                className="border border-border-light dark:border-border-dark rounded-md p-2 w-full text-primary-light dark:text-primary-dark bg-surface-light dark:bg-surface-dark"
              />

              <div className="flex flex-col gap-1 w-full text-sm text-secondary-light dark:text-secondary-dark">
                <div className="flex justify-between">
                  <span>Available cash:</span>
                  <span>${availableCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash after execution:</span>
                  <span className="flex gap-2">
                    <span>${projectedCash.toFixed(2)}</span>
                    {quantity > 0 && price && (
                      <span className={isNegativeCash ? "text-bad" : "text-good"}>
                        ({pill === 'Add' ? "-" : "+"}${(quantity * price).toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Available shares:</span>
                  <span>{availableShares}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shares after execution:</span>
                  <span className="flex gap-2">
                    <span>{projectedShares}</span>
                    {quantity > 0 && (
                      <span className={isNegativeShares ? "text-bad" : "text-good"}>
                        ({pill === 'Remove' ? "-" : "+"}{quantity})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {portfolioOptions.length > 0 && (
            <div className="flex justify-end gap-2 mt-4 w-full">
              <Button type="secondary" label="Cancel" onClick={close} className="flex-1" />
              <Button type="brand" label={pill} onClick={execute} className="flex-1 text-center" />
            </div>
          )}
        </div>
      </div>
    </BaseDialog>
  );
};
