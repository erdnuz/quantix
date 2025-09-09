import Link from "next/link";
import styles from './portcard.module.css'
const tagItems = [
    // Investment Strategies
    "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",

    // Market Focus
    "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",

    // Time Horizon
    "Short-term", "Long-term",
];


export const PortfolioCard = ({ portfolio }) => {
  const { id, title,date, description, tags } = portfolio;

  return (
    <div className={styles.container}>
    <Link  href={`/portfolio/${id}/`}>
    <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
    <div className="portfolio-card" style={{cursor:'pointer', display:'flex',  gap:'16px'}}>
    <div style={{ display: 'flex', flex: 1, height: 'fit-content', flexDirection: 'column', gap: '4px' }}>
    <div className={styles.titleRow}>
        
    <h3 className="head" style={{ margin: 0 }}>
        {title}
    </h3>
        <p className="small" style={{margin:0, fontSize:'12px'}}>
            {date}
        </p>
    </div>
  <p
    className="small"
    style={{
      margin: 0,
      display: 'block', // Prevent wrapping
      overflow: 'hidden',  // Hide overflowing text
      textOverflow: 'ellipsis',  // Add ellipsis when the text overflows
      flexShrink: 1,
      maxWidth: '100%', // Ensure the text doesn't stretch beyond container
    }}
  >
    {description}
  </p>
</div>

      
      <div style={{display:'flex', flex: 1, height:'fit-content', flexWrap:'wrap', flexDirection:'row', gap:'4px'}}>
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => (
            <p
                key={index}
                className={`small ${styles.tag}`}
                
                >
                {tagItems[tag]}
                </p>

          ))
        ) : (
          null
        )}
      </div>
    </div>
    <div className="portfolio-card" style={{cursor:'pointer', width:'100%', display:'flex',  gap:'16px'}}>
    
    <div style={{display:'flex', padding:'0px 20px', width:'100%', flexDirection:'row', gap:'24px', justifyContent:'space-between'}}>
        {Object.entries({
          'primary_class': 'Class',
          '1y': '1y',
          '3m': '3mo',
          'all':'All time'
        }).map(([columnName, display]) => (
          <div key={columnName} style={{ display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center'}}>
            <p className={`subhead ${styles.val}`}>{portfolio?.[columnName]?columnName==='primary_class'?portfolio?.[columnName]:`${(100*portfolio?.[columnName]).toFixed(2)}%`:'NaN'}</p>
            <p className={`body ${styles.name}`}>{display}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
    </Link>
    </div>
  );
};

