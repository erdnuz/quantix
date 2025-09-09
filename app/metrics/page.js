import { Search } from "components/primitive";
import { Hero} from "components/composition";


const Metrics = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          
        }}
      >
        <Hero
          title="Discover Asset Insights"
          subtitle="Search for assets, analyze key metrics, and make informed investment decisions."
        />
  
        <div style={{ display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          justifyContent: 'center', padding: '24px 24px' }}>
          <Search />
          <p className="body"
        style={{
            textAlign: 'left',
            color: 'var(--sds-color-text-default-secondary)'
        }}
        >
        <br/> Our platform gathers real-time market data alongside comprehensive fundamental data to provide you with a complete picture of each asset's performance and underlying value. <br/><br/>
        We focus on delivering the most critical metrics—such as valuation ratios, growth indicators, and risk measures—ensuring you can make well-informed decisions. <br/><br/>
        Each asset is compared against its peers, allowing you to assess strengths and weaknesses within the broader market context. <br/><br/>
        This peer comparison highlights key advantages and potential risks, helping you identify opportunities that align with your investment strategy.<br/><br/>
        </p>
        </div>
        

      </div>
    );
  };
  

export default Metrics;


