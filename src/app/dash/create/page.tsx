
import { Hero, NewPortfolio } from '../../../components/composition';

const New = () => 
    {
    return (
    <div className="relative z-10">

        <Hero title="Build your Portfolio" subtitle="Select and customize your investment strategy" />
        
        <div className = "flex p-6 sm:p-12 items-center justify-center" >
            <NewPortfolio />
        </div>
        
    
    </div>
);
}

export default New;


