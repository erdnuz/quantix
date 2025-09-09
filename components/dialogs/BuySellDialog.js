import { useState, useEffect } from 'react';
import { getFastData, portfolioAction, getUserPortfolios } from '../../services/firebase/db';
import { PillGroup } from '../primitive';
import { BaseDialog } from './BaseDialog';
import { Select, Button } from '../primitive';
import styles from "@styles/comp/form.module.css"
import { useAuth } from '../../services/useAuth';

export function BuySellDialog({ isOpen, onClose, ticker }) {
  const {currentUser} = useAuth();
  function close() {
    setError("");
    setPill(0);
    onClose();
  }

  const [error, setError] = useState("");
  const [pill, setPill] = useState(0); // 0 -> Buy, 1 -> Sell
  const [price, setPrice] = useState(null);
  const [portfolio, setPortfolio] = useState(null)
  const [maxSharesBuy, setMaxSharesBuy] = useState(0);
  const [maxSharesSell, setMaxSharesSell] = useState(0);
  const [availableCash, setAvailableCash] = useState(0);
  const [availableShares, setAvailableShares] = useState(0);
  const [selected, setSelected] = useState(0);
  const [portfolioOptions, setPortfolioOptions] = useState([['Default']]);

  const [quantity, setQuantity] = useState(0);

  // Fetch price when component mounts or ticker changes
  useEffect(() => {
    if (ticker) {
      getFastData(ticker, true)
        .then(data => setPrice(data.price))
        .catch(err => setError("Failed to fetch price."));
    }
  }, [ticker]);

  function load(onSuccess=()=>{}) {
    if (currentUser?.id) {
      getUserPortfolios(currentUser.id)
        .then((data) => {
          setPortfolioOptions(data);
          setPortfolio(data[0]);
          onSuccess();
        })
    }
  }
  useEffect(() => {
    load()
  }, [currentUser?.id]);
  
  

  const selectPort = (s) => {
    setSelected(s);
    setPortfolio(portfolioOptions[s])
  }

  // Update max shares and available cash based on portfolio and price
  useEffect(() => {
    if (portfolio && price) {
      const maxSharesBuy = Math.floor(portfolio?.cash / price);
      const maxSharesSell = portfolio?.shares?.[ticker] || 0;
      setMaxSharesBuy(maxSharesBuy);
      setMaxSharesSell(maxSharesSell);
      setQuantity(pill?maxSharesSell:maxSharesBuy);
      setAvailableCash(portfolio?.cash || 0);
      setAvailableShares(maxSharesSell);
    }
  }, [portfolio, price, ticker, pill]);

  // Handle quantity changes
  function handleQuantityChange(e) {
    const value = e.target.value;

    // Allow empty input (this happens when the user deletes everything)
    if (value === '') {
        setQuantity('');
        return;
    }

    // Only allow positive integers greater than 0
    const parsedValue = Math.max(parseInt(value, 10), 1);
    if (!isNaN(parsedValue)) {
      
        if (pill === 0) {
            setQuantity(Math.min(parsedValue, maxSharesBuy));
        }
        if (pill === 1) {
          setQuantity(Math.min(parsedValue, maxSharesSell));
        }
    }
}


  // Execute buy/sell action
  function execute() {
    if (!price) {
      setError("Price hasn't loaded yet.");
      return;
    }

    const value = quantity * price;

    // Buy: Ensure enough cash
    if (pill === 0 && value > availableCash) {
      setError("Insufficient funds.");
      return;
    }

    // Sell: Ensure enough shares
    if (pill === 1 && quantity > availableShares) {
      setError("You don't have enough shares to sell.");
      return;
    }

    // No error, proceed with the action (buy/sell)
    portfolioAction({
      portfolio: portfolio?.id,
      ticker,
      shares: pill?-quantity:quantity,
      price
    }).then(()=>{
      load(onClose);
      setError("");
    })

    
  }

  return (
    <BaseDialog isOpen={isOpen} onClose={close}>
      <PillGroup size={0} currentPill={pill} onSelect={(p) => setPill((prev) => {
        if (prev === p) return;
        return p;
      })} options={["Add", "Remove"]} />
      {error && <div className={`small ${styles.error}`}>{error}</div>}
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        <div style={{display: 'flex', flexDirection: 'row', gap: '4px'}}>
          <p className='head' style={{display: 'flex', flex: 1, margin: 0}}>Portfolio</p>
          {portfolioOptions?
          <Select size={1} options={portfolioOptions?.map((o)=>[o.title])} selected={selected} setSelected={selectPort}/>:null}
        </div>
        <div style={{display: 'flex', flexDirection: 'row', gap: '4px'}}>
          <p className='head' style={{margin: 0}}>{ticker}</p>
          <p className='small' style={{margin: 0, lineHeight: 2.5}}>@ ${price?.toFixed(2)} USD</p>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', gap: '4px'}}>
          <p className='body' style={{display: 'flex', flex: 1, margin: 0}}>Available cash</p>
          <p className='body' style={{display: 'flex', flex: 1, margin: 0}}>${availableCash?.toFixed(2)}</p>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', gap: '4px'}}>
          <p className='body' style={{display: 'flex', flex: 1, margin: 0}}>Available shares</p>
          <p className='body' style={{display: 'flex', flex: 1, margin: 0}}>{availableShares}</p>
        </div>

        {/* Custom quantity selector */}
        <div style={{display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center'}}>
          <p className='body' style={{display: 'flex', flex: 1, margin: 0}}>Quantity</p>
          <div style={{display: 'flex', flex:1,  flexDirection: 'row', gap: '8px', alignItems: 'center'}}>
          
          <input 
          type='number'
            className={`${styles.input}  small ${styles.inputNum}`}
            value={quantity} 
            onChange={handleQuantityChange} 
            style={{padding: '4px 8px', margin:0, width: '80px', textAlign: 'left',backgroundColor:'var(--sds-color-background-default-secondary)', borderRadius:'8px'}} 
          />
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', gap: '4px'}}>
          <p className='body' style={{display: 'flex', flex: 1, margin: 0}}>Cash after execution</p>
          <div style={{display: 'flex', flex: 1, flexDirection: 'row', gap: '4px'}}>
            <p className='body' style={{ margin: 0}}>${(availableCash + (pill ? price : -price) * quantity)?.toFixed(2)}</p>
            <p className='small' style={{margin: 0, lineHeight: 1.5, color: quantity > 0 && !pill ? '#f23645' : '#089981'}}>({quantity > 0 && !pill ? '-' : '+'}${(quantity * price).toFixed(2)})</p>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', gap: '4px'}}>
          <p className='body' style={{display: 'flex', flex: 1, margin: 0}}>Shares after execution</p>
          <div style={{display: 'flex', flex: 1, flexDirection: 'row', gap: '4px'}}>
            <p className='body' style={{ margin: 0}}>{availableShares + (pill ? -1 : 1) * quantity}</p>
            <p className='small' style={{margin: 0, lineHeight: 1.5, color: quantity > 0 && !pill ? '#089981' : '#f23645'}}>({quantity > 0 && !pill ? '+' : '-'}{quantity})</p>
          </div>
        </div>
      </div>
      <div className={styles.links} style={{gap: '8px'}}>
        <Button type="secondary" label="Cancel" onClick={close}/>
        <Button type="brand" label={pill ? 'Remove' : 'Add'} onClick={execute}/>
      </div> 

      
    </BaseDialog>
  );
}
