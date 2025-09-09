'use client'
import { useState, useEffect} from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

import styles from './pie.module.css'
// Register chart components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export function PieChart({ title = 'none', data = {}, mult=true}) {
    const [currentTheme, setCurrentTheme] = useState(document.documentElement.getAttribute('data-theme'));
    useEffect(() => {
        const themeObserver = new MutationObserver(() => {
            setCurrentTheme(document.documentElement.getAttribute('data-theme'));
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => {
            themeObserver.disconnect();
        };
        }, []);

    const chartData = {
        labels: Object.keys(data),               // Use the keys as labels
        datasets: [
            {
                label: title,                   // Set the title of the chart as the dataset label
                data: Object.values(data),      // Use the values as the data for the pie chart
                backgroundColor: Object.keys(data).map(label => 
                    label === 'Other' ? '#8A8A8A' :   // Ensure 'Other' gets dark grey
                    [
                        '#005C8A',  // Dark Blue
                        '#2D6F4E',  // Dark Green
                        '#C9A500',  // Dark Yellow
                        '#F34A29',  // Dark Peach
                        '#7F4BC2',  // Dark Lavender
                        '#D62B2B',  // Dark Red
                        '#B49B4C',  // Dark Beige
                        '#757575',  // Dark Slate
                        '#4C8B3D',  // Dark Pastel Green
                        '#9B2E76'   // Dark Pink
                    ][Object.keys(data).indexOf(label)]  // Apply the color to the corresponding label
                ), // Adjust the number of colors to the number of data segments   // Border color of the segments
                hoverOffset: 10, 
                borderWidth: 0              // Thicker border for better visibility
            }
        ]
    };

    // Options for the chart, including tooltips, animations, and responsiveness
    const options = {
        layout: {
            padding: 4
        },
        responsive: true,
        plugins: {
            legend: {
                display: window.innerWidth > 700,
                position: 'top',
                labels: {
                    boxWidth: 10, // Size of the color box
                    boxHeight: 10,
                    usePointStyle: true, // Height of the color box
                    font: {
                        size: 12, // Font size for labels
                        family: 'Inter, sans-serif', // Font family
                        weight: '300', 
                        color: currentTheme==='light'?"#000":"#FFF"// Font weight
                    },
                    
                    generateLabels: (chart) => {
                        // Function to clean up company names
                        const cleanLabel = (label) => {
                            return label
                                .replace(/\b(The|Corp|Corporation|Group|Holdings|Holding|Inc|Ltd|LLC|PLC|Services)\b/gi, '') // Remove common words
                                .replace(/\s+/g, ' ')
                                .replace('Communication', 'Comm.')
                                .replace('Consumer', 'Cons.')
                                .replace('Consumer', 'Cons.')
                                .trim().substring(0, 20) + (label.length > 20 ? '...' : ''); // Cut off and add ellipsis if too long
                        };
                
                        return chart.data.labels.map((label, i) => ({
                            text: cleanLabel(label), // Clean the label
                            fontColor: currentTheme==='light'?"#000":"#FFF",
                            fillStyle: chart.data.datasets[0].backgroundColor[i], // Use dataset color
                        }));
                    },
                    color: '#e1e1e1', // Label text color
                    padding: 5, // Padding between legend items
                },
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${((mult?100:1)*Number(tooltipItem.raw)).toFixed(2)}%`; // Show percentage in tooltip
                    }
                },
                backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker tooltip background
                titleColor: '#fff', // White title color in tooltip
                bodyColor: '#fff', // White body color in tooltip
                footerColor: '#fff' // White footer color in tooltip
            }
        },
        hover: {
            mode: 'index',
            intersect: false
        },
        responsive: true
    };

    return (
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: 'fit-content', textAlign: 'center' }}>
                <div className={styles.width}>
                    <Pie data={chartData} options={options} /> {/* Render Pie chart */}
                </div>
                <h2 className={`subhead ${styles.width}`}>{title}</h2> {/* Display the title of the chart */}
            </div>
        </div>
    );
};
