import { Hero, Screener } from '../../components/composition';

const ScreenerPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pb-12 sm:pb-16 md:pb-20">
        <Hero
          title="Screener"
          subtitle="Filter top stocks, ETFs, and mutual funds"
        />
      </section>

      {/* Screener Section */}
      <section className="px-4 pb-16 flex justify-center">
        <div className="w-full max-w-7xl">
          <div className="rounded-2xl bg-surface-light-secondary dark:bg-surface-dark-secondary shadow-lg">
            <Screener />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScreenerPage;
