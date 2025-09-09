import Head from 'next/head';

export const DashboardHead = ({ target, currentUser }) => {
    const isOwnDashboard = target?.id === currentUser?.id;
    const title = isOwnDashboard ? "Your Dashboard - Quantix" : `${target?.firstName} ${target?.lastName} - Quantix`;
    const description = isOwnDashboard 
        ? "Manage, track, and optimize your investment portfolios with ease." 
        : `Explore ${target?.firstName}'s investment portfolios on Quantix.`;

    return (
        <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content="asset comparison, equities, ETFs, stocks, performance metrics, financial analysis, fundamental analysis, risk management" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://quant-algo-4430a.web.app/dash" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <link rel="canonical" href="https://quant-algo-4430a.web.app/dash" />
        </Head>
        
    );
};

