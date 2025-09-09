import styles from './ranking.module.css'
function interpolateColor(percentile, neutral=false) {
    // Good-bad color scheme
    const red = [190, 15, 15]; //  #c00f0c
    const yellow = [230, 180, 50]; // #e8b931
    const green = [0, 90, 50];  // #2ECC71

    // Neutral color scheme
    const p1 = [240, 130, 200]; //rgb(231, 133, 202);
    const p2 = [200, 80, 160]; // #d732a8;
    const p3 = [160, 30, 120]; //:rgb(163, 29, 125);

    // Choose the color scheme based on `goodBad`
    const [c1, c2, c3] = neutral
        ? [red, yellow, green] // Red-Yellow-Green for good-bad
        : [p1, p2, p3]; 

    let r, g, b;

    // Convert input from 0-1 scale to 0-100
    if (percentile <= 0.50) {
        // Interpolate between red and yellow
        let factor = (percentile) / 0.50;
        r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
        g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
        b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
    } else {
        // Interpolate between yellow and green
        let factor = (percentile - 0.50) / 0.50;
        r = Math.round(c2[0] + factor * (c3[0] - c2[0]));
        g = Math.round(c2[1] + factor * (c3[1] - c2[1]));
        b = Math.round(c2[2] + factor * (c3[2] - c2[2]));
    }

    

    return `rgb(${r}, ${g}, ${b})`;
}

function clip(percentile) {
    return (100*(percentile)+10)/1.1;
}

export function Ranking({ score, barOnly=false, large=false, goodBad=true, number=null}) {
    const isNone = score === null || score === undefined || score === 'none';

    const color = isNone 
        ? 'var(--sds-color-background-default-tertiary)' 
        : interpolateColor(score, goodBad);

    const displayScore = isNone 
        ? 'N/A' 
        : (100*Number(score)).toFixed(0);

    const width = isNone 
        ? '100%' 
        : `${clip(score)}%`;

    return (
        <div
        className = {styles.container}
            >
            {!barOnly&&<p
            className={`${styles.score} ${large? styles.large:''} ${number?styles.number:''} `}
                
            >
                {number||displayScore}
            </p>}
            <div
                className={styles.bar}
            >
                <div
                    className={`${styles.color} ${large? styles.large:''}`}
                    style={{
                        backgroundColor: color,
                        width: width,
                    }}
                ></div>
            </div>
        </div>
    );

};

