"use client"
import { Macro, Hero} from "../../components/composition";
import React, { useState, useEffect } from 'react';
import {getMacroRisk, getMarketPrices} from '../../services/firebase/db'
import { Loading } from "../../components/primitive";
import Head from "next/head";

async function fetchChartData(onSuccess) {
  getMacroRisk().then((data) => {
    console.log(data)
    getMarketPrices().then((d) =>onSuccess({'Risk':data, 'S&P 500 Benchmark':d}))
  })
  
}

const MacroPage = () => {
    const [risk, setRisk] = useState(0);
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true)
    
    const [currentTheme, setCurrentTheme] = useState('light'); // Default theme is light

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
            setCurrentTheme(initialTheme);
        }
        const themeObserver = new MutationObserver(() => {
            if (typeof document !== 'undefined') {
                setCurrentTheme(document.documentElement.getAttribute('data-theme'));
            }
        });

        // Start observing the <html> element for changes to the 'data-theme' attribute
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Clean up observer on component unmount
        return () => {
            themeObserver.disconnect();
        };
    }, []);


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

        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'left',
            alignContent: 'left', 
            justifyContent: 'center', 
            height: 'fit-content', 
          }}>
            <Hero title="Macro Risk" subtitle="Track Market Risk Based on Key Macroeconomic Indicators" />
            <Macro />
        </div>
          
);
}

export default MacroPage;

