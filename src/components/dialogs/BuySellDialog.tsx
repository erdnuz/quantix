'use client';
import { useState, useEffect } from 'react';
import { portfolioAction, getUserPortfolios } from '../../../services/firebase/db';
import { PillGroup, Select, Button } from '../primitive';
import { BaseDialog } from './BaseDialog';
import { useAuth } from '../../../services/useAuth';
import { Portfolio } from '../../../types';
import { getFastData } from '../../../services/firebase/api';



interface BuySellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
}

export const BuySellDialog: React.FC<BuySellDialogProps> = ({ isOpen, onClose, ticker }) => {
  const { currentUser } = useAuth();
  const [error, setError] = useState<string>("");
  const [pill, setPill] = useState<number>(0); // 0 -> Buy, 1 -> Sell
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
    setPill(0);
    onClose();
  };

  // Fetch current price
  useEffect(() => {
  if (ticker) {
    getFastData({
      ticker,
      onSuccess: (data) => setPrice(data.price),
      onError: () => setError("Failed to fetch price."),
      });
    }
  }, [ticker]);


  // Load user portfolios
  const load = (onSuccess: () => void = () => {}) => {
    if (currentUser?.id) {
      getUserPortfolios({userId: currentUser.id}).then((data) => {
        setPortfolioOptions(data);
        setPortfolio(data[0]);
        onSuccess();
      });
    }
  };

  useEffect(() => {
    load();
  }, [currentUser?.id]);

  const selectPort = (s: number) => {
    setSelected(s);
    setPortfolio(portfolioOptions[s]);
  };

  // Update max shares and available cash based on portfolio and price
  useEffect(() => {
    if (portfolio && price !== null) {
      const maxBuy = Math.floor(portfolio.cash / price);
      const maxSell = portfolio.shares?.[ticker] || 0;
      setMaxSharesBuy(maxBuy);
      setMaxSharesSell(maxSell);
      setQuantity(pill ? maxSell : maxBuy);
      setAvailableCash(portfolio.cash);
      setAvailableShares(maxSell);
    }
  }, [portfolio, price, ticker, pill]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity(0);
      return;
    }
    const parsed = Math.max(parseInt(value, 10), 1);
    if (!isNaN(parsed)) {
      setQuantity(pill ? Math.min(parsed, maxSharesSell) : Math.min(parsed, maxSharesBuy));
    }
  };

  const execute = () => {
    if (price === null) {
      setError("Price hasn't loaded yet.");
      return;
    }

    const value = quantity * price;

    if (pill === 0 && value > availableCash) {
      setError("Insufficient funds.");
      return;
    }

    if (pill === 1 && quantity > availableShares) {
      setError("You don't have enough shares to sell.");
      return;
    }

    portfolio && portfolioAction({
      portfolio: portfolio.id,
      ticker,
      shares: pill ? -quantity : quantity,
      onSuccess : () => {
      load(onClose);
      setError("");
    },
      onError : setError
    })
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={close}>
      <PillGroup size={0} currentPill={pill} onSelect={setPill} options={["Add", "Remove"]} />
      {error && <div className={`small`}>{error}</div>}

      <div className="flex flex-col gap-2">
        {/* Portfolio selector */}
        <div className="flex flex-row gap-1 items-center">
          <p className="head flex-1 m-0">Portfolio</p>
          {portfolioOptions.length > 0 && (
            <Select
              size={1}
              options={portfolioOptions.map(o => [o.title])}
              selected={selected}
              setSelected={selectPort}
            />
          )}
        </div>

        {/* Price display */}
        <div className="flex flex-row gap-1">
          <p className="head m-0">{ticker}</p>
          <p className="small m-0 line-height-[2.5]">@ ${price?.toFixed(2) ?? "0.00"} USD</p>
        </div>

        {/* Available cash & shares */}
        <div className="flex flex-row gap-1">
          <p className="body flex-1 m-0">Available cash</p>
          <p className="body flex-1 m-0">${availableCash.toFixed(2)}</p>
        </div>
        <div className="flex flex-row gap-1">
          <p className="body flex-1 m-0">Available shares</p>
          <p className="body flex-1 m-0">{availableShares}</p>
        </div>

        {/* Quantity input */}
        <div className="flex flex-row gap-2 items-center">
          <p className="body flex-1 m-0">Quantity</p>
          <input
            type="number"
            className={`small`}
            value={quantity}
            onChange={handleQuantityChange}
            style={{
              padding: "4px 8px",
              width: "80px",
              textAlign: "left",
              backgroundColor: "var(--sds-color-background-default-secondary)",
              borderRadius: "8px",
              margin: 0
            }}
          />
        </div>

        {/* Cash & shares after execution */}
        <div className="flex flex-row gap-1">
          <p className="body flex-1 m-0">Cash after execution</p>
          <div className="flex flex-1 flex-row gap-1">
            <p className="body m-0">
              ${quantity==0?availableCash:price? (availableCash + (pill ? price : -price) * quantity).toFixed(2): "NaN"}
            </p>
            <p
              className="small m-0 line-height-[1.5]"
              style={{ color: quantity > 0 && !pill ? "#f23645" : "#089981" }}
            >
              ({quantity > 0 && !pill ? "-" : "+"}${price?(quantity * price).toFixed(2): "NaN"})
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-1">
          <p className="body flex-1 m-0">Shares after execution</p>
          <div className="flex flex-1 flex-row gap-1">
            <p className="body m-0">{availableShares + (pill ? -1 : 1) * quantity}</p>
            <p
              className="small m-0 line-height-[1.5]"
              style={{ color: quantity > 0 && !pill ? "#089981" : "#f23645" }}
            >
              ({quantity > 0 && !pill ? "+" : "-"}{quantity})
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={`flex gap-2 mt-2`}>
        <Button type="secondary" label="Cancel" onClick={close} />
        <Button type="brand" label={pill ? "Remove" : "Add"} onClick={execute} />
      </div>
    </BaseDialog>
  );
};
