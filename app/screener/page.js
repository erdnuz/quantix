import { Hero, Screener } from '../../components/composition';



const ScreenerPage=() =>{
    
    

    return (
        <div>
            <Hero title="Screener" subtitle="Filter top stocks, ETFs, and mutual funds" />
            <Screener />
        </div>
    );
}

export default ScreenerPage;
