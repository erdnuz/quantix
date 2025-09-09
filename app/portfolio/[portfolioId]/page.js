"use client"
import React, { useState, useEffect } from 'react';
import { BaselineChart, PieChart, Table } from '../../../components/composition';
import { IconStar, IconUser } from '../../../components/icons';
import { Select, Loading } from '../../../components/primitive';
import { getPortfolioData, getPortfolioDoc, getUserById, incrementFavourites} from '../../../services/firebase/db';
import { useAuth } from '../../../services/useAuth';
import { IconEdit } from '../../../components/icons';
import { EditPortfolioDialog } from '../../../components/dialogs';
import { useParams } from 'next/navigation';
import styles from './portfolio.module.css'

const holdingColumnDets = {
  public: ['ticker', 'name', 'type', 'sector', 'region', 'shares', 'avg-buy', 'price', 'weight','open-pnl'],
  percent: ['open-pnl'], 
  percentNeutral: ['weight'], 
  large: ['shares'],
  price: ['price','avg-buy']
}

const actionColumnDets = {
  public: [
    "ticker", 
    "date",
    "action", 
    "shares", 
    "price",],
  percent: ['pnl'], 
  large: ['shares'],
  price: ['price']
}

const selectOptions = [
  ["Last month"], 
  ["Last 3 months"], 
  ["Last year"], 
  ["All time"]
];

const formatNumber = (number) => {
  if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
  if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
  return `${number.toFixed(0)}`;
};


const tagItems = [
  // Investment Strategies
  "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",

  // Market Focus
  "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",

  // Time Horizon
  "Short-term", "Long-term",
];



const Portfolio = () => {
  const { currentUser, update } = useAuth();
  const [selected, setSelected] = useState(0);
  const [isFavourite, setIsFavourite] = useState(false);
  const [portfolio, setPortfolio] = useState(null)
  const [data, setData] = useState(null);
  const [author, setAuthor] = useState(null)
  const [invalid, setInvalid] = useState(null)
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState([]);
  
  
  const params = useParams()
  const t = params.portfolioId

  useEffect(()=>{
    console.log(t);
    if (!t) {
      return;
    }
    setLoading(true);
    let port;
    
    getPortfolioDoc(t).then((data)=>{
      setPortfolio(data);
      port = data
      getUserById(data.userId).then(
        setAuthor
      )
    })
    getPortfolioData(t).then((data) => {
      if ((!(data?.df)) || Object.keys(port.actions || {}).length === 0) {
        setInvalid(true);
        setLoading(false)
        return;
      } 
      data.holdings = Object.entries(data?.df || {}).map(([ticker, d]) => ({
        ticker,
        ...d,
      }));

      setData(data);
      if (data?.hist) {
      const chart = Object.entries(data?.hist).map(([time, value]) => ({
          time: time,
          value: value
        }));
      setChartData(chart);
      }
      setLoading(false);
    })
    
  }, [t])

  useEffect(()=>{
    if (!currentUser) {
      return setIsFavourite(false);
    }
    setIsFavourite(portfolio?.userId===currentUser.id || currentUser?.favourites?.includes(portfolio?.id))
  }, [currentUser, portfolio])

  function handleFavourite(isF){
    if (!currentUser || currentUser.id === portfolio?.userId) {
      return;
    }
    setIsFavourite(isF);
    if (portfolio.userId===currentUser.id) {
      return null;
    }
    const prev = currentUser.favourites || []
    if (isF) {
      currentUser.favourites = [...prev, t]
      incrementFavourites(portfolio.id, 1)
      setPortfolio((prev)=>{return {...prev, favourites: prev.favourites+1}})
    } else {
      currentUser.favourites = prev.filter((i) => i!==t)
      incrementFavourites(portfolio.id, -1)
      setPortfolio((prev)=>{return {...prev, favourites: prev.favourites-1}})
    }
    console.log(currentUser.favourites)
    update(currentUser)
  }

  function setTimeframe(s) {  
    setSelected(s);
    if (s === 3) {
      setFilter([]);  // Clears the filter
    } else {
      const today = Date.now();
      const month = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      const threeMonths = 3 * month; // 3 months in milliseconds
      const year = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

      setFilter([{
        fit: (act) => {
          const date = new Date(act.date).getTime(); // Get the timestamp of the activity date

          // Adjust the condition based on the timeframe
          if (s === 0) { // Last month
            return today - date < month; // Date within the last month
          } else if (s === 1) { // Last 3 months
            return today - date < threeMonths; // Date within the last 3 months
          } else if (s === 2) { // Last year
            return today - date < year; // Date within the last year
          }
          return false;
        }
      }]);

    }
}



  return (
    
    <div>
      

    <div className='container'>
      <EditPortfolioDialog portfolio={portfolio} isOpen={dialogOpen} onClose={() => {setDialogOpen(false)
      
      }}
      setPortfolio={setPortfolio}/>
      <h1 className="small" style={{color:'var(--sds-color-text-default-secondary)'}}>Created {portfolio?.date}</h1>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', gap:'12px', justifyContent:'space-between' }}>
        <div style={{flex:1, display: 'flex', alignItems: 'start', marginBottom: '0px' }}>
        <div style={{ width: 'fit-content', marginRight: '16px' }}>
          <h2 className='title'>{portfolio?.title}</h2>
          <div onClick={()=>{window.location.href=portfolio && currentUser?.id === portfolio?.userId ? "/dash/":`/dash/${author?.id}/`}} style={{height:'100%', cursor:'pointer', display: 'flex', alignItems: 'center', justifyItems:'center', color: 'var(--sds-color-text-default-secondary)' }}>
            <IconUser size='20' className="subtle" />
            <p className={`subhead ${styles.author}`}>{author?.firstName} {author?.lastName}</p>
          </div>
          
        </div>
        <div style={{ display: 'flex', marginTop:'16px', justifyItems:'center', alignItems:'flex-end', gap: '4px'}}>
          <IconStar size='32' isFilled={isFavourite} onClick={() => handleFavourite(!isFavourite)}/>
          <p className="subtitle" style={{ lineHeight: 0.9 }}>{formatNumber(portfolio?.favourites || 0)}</p>
          
        </div>
        </div>
        {portfolio && currentUser?.id === portfolio?.userId ? 
        <div style={{flex:1, maxWidth:'fit-content', marginTop:'16px'}}>
          <IconEdit size="32" onClick={() => {setDialogOpen(true)}}/>
          
        </div>: null}

      
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:'12px', maxWidth:'520px', marginTop:'16px', marginBottom:'24px'}}>
      <p
        className="body"
        style={{
          marginBottom: 0,
          marginLeft: '4px',
          display: 'block', // Change to block-level for ellipsis to work
          whiteSpace: 'wrap', // Prevent wrapping
          overflow: 'hidden',  // Hide overflowing text
          textOverflow: 'ellipsis',  // Add ellipsis when the text overflows
          flexShrink: 1,
          maxWidth: '100%', // Ensure the text doesn't stretch beyond container
        }}
      >
        {portfolio?.description}
      </p>
      <div style={{display:'flex', flex: 1, height:'fit-content', flexWrap:'wrap', flexDirection:'row', gap:'4px'}}>
      {portfolio?.tags && portfolio?.tags.length > 0 ? (
          portfolio?.tags.map((tag, index) => (
            <p
                key={index}
                className="small"
                style={{
                    display: 'flex',
                    borderRadius: '12px',
                    flexWrap: 'nowrap', // Prevent wrapping
                    width: 'fit-content',
                    height:'fit-content',
                    padding: '4px 8px',
                    backgroundColor: 'var(--sds-color-background-default-secondary)',
                    border: '1px solid var(--sds-color-border-default-default)',
                    whiteSpace: 'nowrap', 
                    margin: 0// Prevent text from wrapping
                }}
                >
                {tagItems[tag]}
                </p>

          ))
        ) : (
          null
        )}
        </div>
      </div> 
      {!invalid && !loading && !data?.['cagr']&&
        <div style={{ display: 'flex', flexDirection: 'column',   height: 'fit-content' }}>
        
          <h1 className="small" style={{color:'var(--sds-color-text-default-secondary)' }}>Metrics are limited as this portfolio was recently created</h1>
        </div>}
      {loading &&
      <Loading />}

      
      {data?.['all']&&
      <div style={{padding:'32px', display:'flex', flexDirection:'row', gap:'16px', justifyContent:'space-between'}}>
        {Object.entries({
          cagr: 'CAGR',
          alpha: 'Alpha',
          sharpe: 'Sharpe',
          max_drawdown: 'Max Drawdown',
        }).map(([columnName, display]) => (
          <div key={columnName} style={{ display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center'}}>
            <p className={`head ${styles.value}`}>{data?.[columnName]?`${(100*data?.[columnName]).toFixed(2)}%`:'NaN'}</p>
            <p className={`body ${styles.name}`} >{display}</p>
          </div>
        ))}
      </div>}

      {data?.['all']&&
      <div>
      <h3 className='head' style={{ lineHeight: 1 }}>Historical Returns</h3>
      <div style={{padding:'32px', display:'flex', flexDirection:'row', gap:'16px', justifyContent:'space-between'}}>
        {Object.entries({
          'all': 'All time',
          '1y': '1y',
          '6m': '6mo',
          '3m': '3mo',
          '1m': '1mo',
        }).map(([columnName, display]) => (
          <div key={columnName} style={{ display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center'}}>
            <p className={`head ${styles.value}`}>{data?.[columnName]?`${(100*data?.[columnName]).toFixed(2)}%`:'NaN'}</p>
            <p className={`body ${styles.name}`} >{display}</p>
          </div>
        ))}
      </div>
      </div>}

      {chartData?.length>3 &&
      <div style={{ marginBottom: '20px' }}>
        
                            <div
                            style={{
                                width: '100%',  // Make the widget fill its container
                                height: '100%', // Make the widget fill its container
                                display: 'block', // Ensure the widget is visible
                            }}
                            >
                            <BaselineChart data={chartData} actions={portfolio?.actions}/>
                            </div>
                        
                    
                        
      </div>}
      

      
      
      {invalid &&
        <div style={{ padding:'64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop:'20px' }}>
        
          <h1 className="head">This portfolio has no holdings or history...</h1>
          {currentUser?.id === portfolio?.userId &&
          <h2 className="subhead">You can add your first assets from the <a href='/screener' style={{cursor:'pointer', fontWeight:'bold'}}>Screener</a></h2>}
        </div>}

      <div>

      {data?.holdings?.length > 0?
      <div style={{marginTop:'32px'}}>
        
      <h3 className='head' style={{ lineHeight: 1 }}>Holdings Distribution</h3>
      <div style={{display:'flex', maxWidth:'100%',marginTop:'12px', flexWrap:'wrap'}}>
        <PieChart mult={false} title="Asset Class" data={data?.['asset_weight']
          ? Object.entries(data['asset_weight']).reduce((acc, [key, value]) => {
              const type = { 0: 'Equity', 1: 'ETF', 2: 'Mutual Fund', 3:'Cash'}[key] || 'Unknown';
              acc[type] = value*100;
              return acc;
            }, {})

          : {}}/>
        <PieChart 
        mult={false}
          title="Sector" 
          data={data?.['sector_weight']
            ? Object.entries(data['sector_weight'])
                .reduce((acc, [key, value]) => {
                  if (value > 0) {
                    acc[key] = value * 100; // Convert the value to percentage if greater than 0
                  }
                  return acc;
                }, {})
            : {}}
        />
        <PieChart 
        mult={false}
          title="Region" 
          data={data?.['region_weight']
            ? Object.entries(data['region_weight'])
                .reduce((acc, [key, value]) => {
                  if (value > 0) {
                    acc[key] = value * 100; // Convert the value to percentage if greater than 0
                  }
                  return acc;
                }, {})
            : {}}
        />
        </div>
      </div>:null}
      
      {chartData?.length > 5 &&
      
      <div style={{marginTop:'32px'}}>
        <h3 className='head' style={{ lineHeight: 1 }}>Contribution Distribution</h3>
        <div style={{display:'flex', maxWidth:'100%', marginTop:'12px', flexWrap:'wrap'}}>
      <PieChart mult={false} title="Asset Class" data={data?.['asset_weight']
          ? Object.entries(data['asset_contrib']).reduce((acc, [key, value]) => {
              const type = { 0: 'Equity', 1: 'ETF', 2: 'Mutual Fund' }[key] || 'Unknown';
              acc[type] = value*100;
              return acc;
            }, {})

          : {}}/>
        <PieChart 
        mult={false}
          title="Sector" 
          data={data?.['sector_contrib']
            ? Object.entries(data['sector_contrib'])
                .reduce((acc, [key, value]) => {
                  if (value > 0) {
                    acc[key] = value * 100; // Convert the value to percentage if greater than 0
                  }
                  return acc;
                }, {})
            : {}}
        />
        <PieChart 
        mult={false}
          title="Region" 
          data={data?.['region_contrib']
            ? Object.entries(data['region_contrib'])
                .reduce((acc, [key, value]) => {
                  if (value > 0) {
                    acc[key] = value * 100; // Convert the value to percentage if greater than 0
                  }
                  return acc;
                }, {})
            : {}}
        />
      </div>
      </div>}

      {invalid||loading?null:
      <div>
        <div className={styles.titleHolder} style={{ display: 'flex', gap: '12px', marginTop:'32px'}}>
          <h3 className={`title ${styles.title}`} style={{ lineHeight: 1 }}>Holdings</h3>
          
        </div>
        {data?.holdings ?
        <Table error="This portfolio has no holdings..." defSort={'weight'} data={data?.holdings} columnDetails={holdingColumnDets} rowsPerPage={10} hints={true} filters={[]} header={["Ticker", "Name", "Class", "Sector", "Region", "Shares", "Avg. Buy", "Price", "Weight", "Open PnL"]} />
        :null}
      </div>}
      {data?.actions ?
      <div style={{marginTop:'32px'}}>
        <div lassName={styles.titleHolder} style={{ display: 'flex', gap: '24px', alignItems:'center'}}>
          <h3 className={`title ${styles.title}`} style={{ lineHeight: 0.8 }}>Actions</h3>
          <Select
            size={1}
            options={selectOptions}
            selected={selected}
            setSelected={setTimeframe}
          />
        </div>
        <Table error="No actions yet..." defSort={'date'} data={data?.actions} columnDetails={actionColumnDets} rowsPerPage={10} hints={true} filters={filter} header={["Ticker","Date", "Action", "Shares", "Price"]} />
        
        </div> :null}
    </div>
  </div>
  </div>
  );
}

export default Portfolio;
