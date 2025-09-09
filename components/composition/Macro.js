"use client"
import { PlotChart, Hero} from "../../components/composition";
import React, { useState, useEffect } from 'react';
import {getMacroRisk, getMarketPrices} from '../../services/firebase/db'
import { Loading } from "../../components/primitive";
import styles from './macro.module.css'
async function fetchChartData(onSuccess) {
  getMacroRisk().then((data) => {
    console.log(data)
    getMarketPrices().then((d) =>onSuccess({'Risk':data, 'S&P 500 Benchmark':d}))
  })
  
}

export const Macro = () => {
    const [risk, setRisk] = useState(0);
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true)


    useEffect(()=>{
      setLoading(true)
      fetchChartData((d) => {setChartData(d); setLoading(false)});
    }, [])

    useEffect(() => {
      try {
        const lastRiskItem = chartData?.Risk?.[chartData?.Risk?.length - 1]?.value || 0;
        setRisk(lastRiskItem);
      } catch {
        setRisk(0);
      }
    }, [chartData]);

    

    
    return (
            <div className={styles.container}>
              <h1 style={{ font: "var(--sds-font-title-hero)", lineHeight: 0.8 }}>
              {(100*risk).toFixed(0)}%
              </h1>
              <h2 className="subtitle" style={{marginBottom:0}}>
              {risk > 0.5? "High Risk": risk>0.25? "Medium Risk":"Low Risk"}
              </h2>
              <p className="small">Updated Monthly</p>
              {loading?<Loading />:
                    <PlotChart lines={chartData} />
                }
            
              
              
              <h2 className="subtitle">
                Methodology
              </h2>
              <h3 className="body">
                The Macro Risk model offers a reliable, data-driven assessment of market risk by analyzing key U.S. macro-economic indicators, including:
                <ul>
                <li>GDP growth</li>
                <li>Unemployment rate</li>
                <li>Inflation</li>
                <li>Interest rates</li>
                <li>Consumer confidence</li>
                <li>Yield curve</li>
                <li>Stock market strength</li>
                </ul>
                These well-established indicators have historically signaled shifts in the U.S. economy, providing a strong foundation for assessing risk. By considering these factors in conjunction, the model can more accurately predict market trends and fluctuations.

                
                <br/><br/>
                The model is continuously updated with the latest data, ensuring that it reflects current conditions. It tracks both short-term trends and long-term shifts, adapting to changes in the economy and offering an evolving perspective on economic risk.
            </h3>


            </div>
          
);
}

