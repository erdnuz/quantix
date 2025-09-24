"use client";

import { Search } from "../../components/primitive";
import { Hero } from "../../components/composition";

const Metrics: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Hero
        title="Discover Asset Insights"
        subtitle="Search for assets, analyze key metrics, and make informed investment decisions."
      />

      <div className="flex flex-col items-center justify-center gap-4 px-6 py-6 max-w-3xl">
        <Search />

        <p className="text-left text-gray-500 text-base leading-relaxed">
          <br />
          Our platform gathers market data alongside comprehensive fundamental information to provide a detailed picture of each asset&apos;s performance and underlying value.
          <br />
          <br />
          We focus on delivering the most critical metrics—such as valuation ratios, growth indicators, and risk measures—ensuring you can make well-informed decisions.
          <br />
          <br />
          Each asset is compared against its peers, allowing you to assess strengths and weaknesses within the broader market context.
          <br />
          <br />
          This peer comparison highlights key advantages and potential risks, helping you identify opportunities that align with your investment strategy.
          <br />
          <br />
        </p>
      </div>
    </div>
  );
};

export default Metrics;
