import { AppContent } from '../components/AppContent';
import { AuthProvider } from '../services/useAuth';
import '../styles/global.css';

export const metadata = {
  title: 'Quantix',
  description: 'Quantix empowers investors with data-driven insights to analyze stocks, ETFs, mutual funds, and portfolios.',
  keywords: 'investing, stocks, ETFs, mutual funds, financial analysis, portfolio management, risk assessment',
  author: 'Quantix Team',
  openGraph: {
    type: 'website',
    title: 'Quantix - Data-Driven Investment Insights',
    description: 'Quantix empowers investors with data-driven insights to analyze stocks, ETFs, mutual funds, and portfolios.',
    url: 'https://quant-algo-4430a.web.app',
    image: '/logo512.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantix - Data-Driven Investment Insights',
    description: 'Quantix empowers investors with data-driven insights to analyze stocks, ETFs, mutual funds, and portfolios.',
    image: '/logo512.png',
  },
  icons: {
    icon: '/logo.svg',
    type: 'image/svg+xml',
  },
  canonical: 'https://quant-algo-4430a.web.app',
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          
          
          {/* Wrapping children in AppContent to provide layout */}
          <AppContent Component={children.type} pageProps={children.props} />
        </AuthProvider>
      </body>
    </html>
  );
}
