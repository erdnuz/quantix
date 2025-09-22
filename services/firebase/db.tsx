import { Portfolio, ProxyAsset, SuccessCallback, ErrorCallback, TableETF, TableStock, User, FullStock, FullETF, Favourite, PortfolioTag } from '../../types';
import { firestore } from './initialization'; 
import {
  collection,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  getDocs,
  doc,
  query,
  where,
  deleteDoc,
  DocumentData,
  Query,
  orderBy,
  limit,
  getCountFromServer,
} from 'firebase/firestore';
import { useAuth } from '../useAuth';

// ------------------ USERS -------------------

export const generateUsername = async ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}): Promise<string> => {
  firstName = firstName.toLowerCase();
  lastName = lastName.toLowerCase();
  const firstInitial = firstName.charAt(0);
  const lastInitial = lastName.charAt(0);
  const usernameOptions = [firstInitial + lastName, firstName + lastInitial, firstName + lastName];

  let count = 0;
  while (true) {
    for (const option of usernameOptions) {
      let username = count > 0 ? `${option}${count}` : option;
      const exists = await usernameExists({ username });
      if (!exists) return username;
    }
    count++;
  }
};

export const usernameExists = async ({
  username,
}: {
  username: string;
}): Promise<boolean> => {
  const userRef = collection(firestore, 'users');
  const snapshot = await getDocs(query(userRef, where('username', '==', username)));
  return !snapshot.empty;
};

export const getUserById = async ({
  id,
}: {
  id: string;
}): Promise<User | null> => {
  const userDocRef = doc(firestore, 'users', id);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? ({ ...userDoc.data(), id: userDoc.id } as User) : null;
};


export const addUser = async ({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: (user: User) => void;
}): Promise<User> => {
  const { id } = user;
  const userRef = doc(firestore, 'users', id);
  await setDoc(userRef, user);
  onSuccess(user);
  return user;
};

export const deleteUser = async ({
  userId,
  onSuccess,
  onError,
}: {
  userId: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) => {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    await deleteDoc(userDocRef);
    onSuccess('User deleted successfully.');
  } catch (error: any) {
    console.error('Error deleting user:', error);
    onError('Error deleting user: ' + error.message);
  }
};

export const updateUser = async ({
  user,
}: {
  user: User;
}): Promise<void> => {
  try {
    const userDocRef = doc(firestore, 'users', user.id);
    await updateDoc(userDocRef, user as DocumentData);
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

// ------------------ PORTFOLIOS -------------------

export const createPortfolio = async ({
  data,
  onSuccess,
}: {
  data: Omit<Portfolio, 'id'>;
  onSuccess: (id: string) => void;
}): Promise<void> => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(Date.now());


  const portfolioData: Omit<Portfolio, 'id'> = {
    ...data,
    cash: data.cash,
    initialCash: data.cash,
    shares: {},
    actions: {},
    created: formattedDate,
  };

  console.log(portfolioData)

  const portfoliosCollection = collection(firestore, 'portfolios');
  const docRef = await addDoc(portfoliosCollection, portfolioData);
  onSuccess(docRef.id);
};

export const getPortfolios = async (): Promise<Portfolio[]> => {
  try {
    const portfoliosCollection = collection(firestore, 'portfolios');
    const snapshot = await getDocs(portfoliosCollection);

    const portfolios: Portfolio[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Portfolio));

    return portfolios;
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return [];
  }
};



export const getUserPortfolios = async ({
  userId,
}: {
  userId: string;
}): Promise<Portfolio[]> => {
  const portfoliosCollection = collection(firestore, 'portfolios');
  const q = query(portfoliosCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Portfolio));
};

export const updatePortfolio = async ({
  portfolio,
}: {
  portfolio: Portfolio;
}): Promise<void> => {
  try {
    const portDocRef = doc(firestore, 'portfolios', portfolio.id!);
    await updateDoc(portDocRef, {
      title: portfolio.title,
      description: portfolio.description,
      tags: portfolio.tags,
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
  }
};


export const deletePortfolio = async ({
  portfolioId,
  onSuccess,
}: {
  portfolioId: string;
  onSuccess?: () => void;
}): Promise<void> => {
  try {
    const portDocRef = doc(firestore, 'portfolios', portfolioId);
    await deleteDoc(portDocRef);
    onSuccess?.();
  } catch (error) {
    console.error('Error deleting portfolio:', error);
  }
};

// ------------------ STOCKS -------------------

export const getStockIdsAndNames = async (): Promise<ProxyAsset[]> => {
  const cached = sessionStorage.getItem('querySugg');
  if (cached) {
    try {
      return JSON.parse(cached) as ProxyAsset[];
    } catch {
      sessionStorage.removeItem('querySugg'); // Remove corrupted cache
    }
  }

  try {
    const stocksCollection = collection(firestore, 'light_assets');
    const snapshot = await getDocs(stocksCollection);

    const stockData: ProxyAsset[] = snapshot.docs.map((doc) => {
      const assetClass = doc.get('asset-class') ?? null;
      const size = assetClass === 'Equity' ? doc.get('market-cap') : doc.get('assets');
      const category = assetClass === 'Equity' ? undefined : doc.get('category');
      const sector = assetClass === 'Equity' ? doc.get('sector') : doc.get('category');
      
      return {
        ticker: doc.id,
        name: doc.get('name'),
        assetClass,
        size,
        sector,
        category,
      };
    });

    stockData.sort((a, b) => b.size - a.size);
    sessionStorage.setItem('querySugg', JSON.stringify(stockData));

    return stockData;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
};

// Fetch full asset details (stock or ETF)
export async function getAssetData({ticker} : {ticker: string}): Promise<FullStock | FullETF | null> {
  try {
    const assetDocRef = doc(firestore, 'assets', ticker);
    const assetSnap = await getDoc(assetDocRef);

    if (!assetSnap.exists()) return null;

    const data = assetSnap.data();
    const assetClass = data['asset-class'] ?? null;

    if (assetClass === 'Equity') {
      return {

        numAn: data['num-an'],
        anRec: data['an-rec'],
        anMin: data['an-min'],
        anAvg:data['an-avg'],
        anMax:data['an-max'],

        assetClass,
        name: data['name'],
        ticker: assetSnap.id,
        marketCorrelation: data['market-corr'],
        marketCorrelationPS: data['market-corr_SECT'],
        marketCorrelationPO: data['market-corr_OVER'],
        size: data['market-cap'],
        sizePS: data['market-cap_SECT'],
        sizePO: data['market-cap_OVER'],
        sector: data['sector'],
        volume: data['volume'],
        volumePS: data['volume_SECT'],
        volumePO: data['volume_OVER'],
        dividendYield: data['yield'],
        dividendYieldPS: data['yield_SECT'],
        dividendYieldPO: data['yield_OVER'],

        threeYearGrowth: data['3y'],
        threeYearGrowthPS: data['3y_SECT'],
        threeYearGrowthPO: data['3y_OVER'],
        sixMonthGrowth: data['6mo'],
        sixMonthGrowthPS: data['6mo_SECT'],
        sixMonthGrowthPO: data['6mo_OVER'],
        cagr: data['cagr'],
        cagrPS: data['cagr_SECT'],
        cagrPO: data['cagr_OVER'],
        oneYearGrowth: data['yoy'],
        oneYearGrowthPS: data['yoy_SECT'],
        oneYearGrowthPO: data['yoy_OVER'],

        dividendGrowth: data['div-g'],
        dividendGrowthPS: data['div-g_SECT'],
        dividendGrowthPO: data['div-g_OVER'],
        earningsGrowth: data['earnings-g'],
        earningsGrowthPS: data['earnings-g_SECT'],
        earningsGrowthPO: data['earnings-g_OVER'],
        revenueGrowth: data['revenue-g'],
        revenueGrowthPS: data['revenue-g_SECT'],
        revenueGrowthPO: data['revenue-g_OVER'],
        profitMargin: data['profit-m'],
        profitMarginPS: data['profit-m_SECT'],
        profitMarginPO: data['profit-m_OVER'],
        returnOnEquity: data['roe'],
        returnOnEquityPS: data['roe_SECT'],
        returnOnEquityPO: data['roe_OVER'],
        returnOnAssets: data['roa'],
        returnOnAssetsPS: data['roa_SECT'],
        returnOnAssetsPO: data['roa_OVER'],

        priceToEarnings: data['p-earnings'],
        priceToEarningsPS: data['p-earnings_SECT'],
        priceToEarningsPO: data['p-earnings_OVER'],
        priceToSales: data['p-sales'],
        priceToSalesPS: data['p-sales_SECT'],
        priceToSalesPO: data['p-sales_OVER'],
        priceToBook: data['p-book'],
        priceToBookPS: data['p-book_SECT'],
        priceToBookPO: data['p-book_OVER'],
        priceToEarningsToGrowth: data['peg'],
        priceToEarningsToGrowthPS: data['peg_SECT'],
        priceToEarningsToGrowthPO: data['peg_OVER'],

        avgDrawdown: data['avg-d'],
        avgDrawdownPS: data['avg-d_SECT'],
        avgDrawdownPO: data['avg-d_OVER'],
        maxDrawdown: data['max-d'],
        maxDrawdownPS: data['max-d_SECT'],
        maxDrawdownPO: data['max-d_OVER'],
        beta: data['beta'],
        betaPS: data['beta_SECT'],
        betaPO: data['beta_OVER'],
        standardDeviationReturns: data['std-dev'],
        standardDeviationReturnsPS: data['std-dev_SECT'],
        standardDeviationReturnsPO: data['std-dev_OVER'],
        var1: data['var1'],
        var1PS: data['var1_SECT'],
        var1PO: data['var1_OVER'],
        var5: data['var5'],
        var5PS: data['var5_SECT'],
        var5PO: data['var5_OVER'],
        var10: data['var10'],
        var10PS: data['var10_SECT'],
        var10PO: data['var10_OVER'],

        calmar: data['calmar'],
        calmarPS: data['calmar_SECT'],
        calmarPO: data['calmar_OVER'],
        alpha: data['alpha'],
        alphaPS: data['alpha_SECT'],
        alphaPO: data['alpha_OVER'],
        sharpe: data['sharpe'],
        sharpePS: data['sharpe_SECT'],
        sharpePO: data['sharpe_OVER'],
        sortino: data['sortino'],
        sortinoPS: data['sortino_SECT'],
        sortinoPO: data['sortino_OVER'],
        mSquared: data['m-squared'],
        mSquaredPS: data['m-squared_SECT'],
        mSquaredPO: data['m-squared_OVER'],
        martin: data['martin'],
        martinPS: data['martin_SECT'],
        martinPO: data['martin_OVER'],
        omega: data['omega'],
        omegaPS: data['omega_SECT'],
        omegaPO: data['omega_OVER'],

        altmanZ: data['altman-z'],
        altmanZPS: data['altman-z_SECT'],
        altmanZPO: data['altman-z_OVER'],
        assetsToLiabilities: data['assets-l'],
        assetsToLiabilitiesPS: data['assets-l_SECT'],
        assetsToLiabilitiesPO: data['assets-l_OVER'],
        debtToAssets: data['debt-a'],
        debtToAssetsPS: data['debt-a_SECT'],
        debtToAssetsPO: data['debt-a_OVER'],
        debtToEquity: data['debt-e'],
        debtToEquityPS: data['debt-e_SECT'],
        debtToEquityPO: data['debt-e_OVER'],
        debtToEBIT: data['debt-ebit'],
        debtToEBITPS: data['debt-ebit_SECT'],
        debtToEBITPO: data['debt-ebit_OVER'],

        qOverall: data['OVERALL'],
        qOverallPS: data['OVERALL_SECT'],
        qOverallPO: data['OVERALL_OVER'],
        qGrowth: data['G'],
        qGrowthPS: data['G_SECT'],
        qGrowthPO: data['G_OVER'],
        qRisk: data['R'],
        qRiskPS: data['R_SECT'],
        qRiskPO: data['R_OVER'],
        qPerformance: data['PE'],
        qPerformancePS: data['PE_SECT'],
        qPerformancePO: data['PE_OVER'],
        qLeverage: data['L'],
        qLeveragePS: data['L_SECT'],
        qLeveragePO: data['L_OVER'],
        qValuation: data['V'],
        qValuationPS: data['V_SECT'],
        qValuationPO: data['V_OVER'],
        qProfitability: data['PR'],
        qProfitabilityPS: data['PR_SECT'],
        qProfitabilityPO: data['PR_OVER'],
      } as FullStock;
    } else {
      return {
        assetClass,
        plotSectors: data['plot-sectors'],
        plotHoldings: data['plotHoldings'],
        expenses: data['expenses'],
        expensesPO: data['expenses_OVER'],
        expensesPS: data['expenses_SECT'],
        
        priceToEarnings: data['p-earnings'],
        priceToEarningsPS: data['p-earnings_SECT'],
        priceToEarningsPO: data['p-earnings_OVER'],
        turnover: data['turnover'],
        turnoverPO: data['turnover_OVER'],
        turnoverPS: data['turnover_SECT'],

        sectorDiversity: data['sector-diversity'],
        sectorDiversityPO: data['sector-diversity_OVER'],
        sectorDiversityPS: data['sector-diversity_SECT'],

        holdingsDiversity: data['holding-diversity'],
        holdingsDiversityPO: data['holding-diversity_OVER'],
        holdingsDiversityPS: data['holding-diversity_SECT'],


        name: data['name'],
        ticker: assetSnap.id,
        marketCorrelation: data['market-corr'],
        marketCorrelationPS: data['market-corr_SECT'],
        marketCorrelationPO: data['market-corr_OVER'],
        size: data['assets'],
        sizePS: data['assets_SECT'],
        sizePO: data['assets_OVER'],
        sector: data['sector'],
        volume: data['volume'],
        volumePS: data['volume_SECT'],
        volumePO: data['volume_OVER'],
        dividendYield: data['yield'],
        dividendYieldPS: data['yield_SECT'],
        dividendYieldPO: data['yield_OVER'],

        threeYearGrowth: data['3y'],
        threeYearGrowthPS: data['3y_SECT'],
        threeYearGrowthPO: data['3y_OVER'],
        sixMonthGrowth: data['6mo'],
        sixMonthGrowthPS: data['6mo_SECT'],
        sixMonthGrowthPO: data['6mo_OVER'],
        cagr: data['cagr'],
        cagrPS: data['cagr_SECT'],
        cagrPO: data['cagr_OVER'],
        oneYearGrowth: data['yoy'],
        oneYearGrowthPS: data['yoy_SECT'],
        oneYearGrowthPO: data['yoy_OVER'],

        dividendGrowth: data['div-g'],
        dividendGrowthPS: data['div-g_SECT'],
        dividendGrowthPO: data['div-g_OVER'],
        earningsGrowth: data['earnings-g'],
        earningsGrowthPS: data['earnings-g_SECT'],
        earningsGrowthPO: data['earnings-g_OVER'],
        revenueGrowth: data['revenue-g'],
        revenueGrowthPS: data['revenue-g_SECT'],
        revenueGrowthPO: data['revenue-g_OVER'],
        profitMargin: data['profit-m'],
        profitMarginPS: data['profit-m_SECT'],
        profitMarginPO: data['profit-m_OVER'],
        returnOnEquity: data['roe'],
        returnOnEquityPS: data['roe_SECT'],
        returnOnEquityPO: data['roe_OVER'],
        returnOnAssets: data['roa'],
        returnOnAssetsPS: data['roa_SECT'],
        returnOnAssetsPO: data['roa_OVER'],

        avgDrawdown: data['avg-d'],
        avgDrawdownPS: data['avg-d_SECT'],
        avgDrawdownPO: data['avg-d_OVER'],
        maxDrawdown: data['max-d'],
        maxDrawdownPS: data['max-d_SECT'],
        maxDrawdownPO: data['max-d_OVER'],
        beta: data['beta'],
        betaPS: data['beta_SECT'],
        betaPO: data['beta_OVER'],
        standardDeviationReturns: data['std-dev'],
        standardDeviationReturnsPS: data['std-dev_SECT'],
        standardDeviationReturnsPO: data['std-dev_OVER'],
        var1: data['var1'],
        var1PS: data['var1_SECT'],
        var1PO: data['var1_OVER'],
        var5: data['var5'],
        var5PS: data['var5_SECT'],
        var5PO: data['var5_OVER'],
        var10: data['var10'],
        var10PS: data['var10_SECT'],
        var10PO: data['var10_OVER'],

        calmar: data['calmar'],
        calmarPS: data['calmar_SECT'],
        calmarPO: data['calmar_OVER'],
        alpha: data['alpha'],
        alphaPS: data['alpha_SECT'],
        alphaPO: data['alpha_OVER'],
        sharpe: data['sharpe'],
        sharpePS: data['sharpe_SECT'],
        sharpePO: data['sharpe_OVER'],
        sortino: data['sortino'],
        sortinoPS: data['sortino_SECT'],
        sortinoPO: data['sortino_OVER'],
        mSquared: data['m-squared'],
        mSquaredPS: data['m-squared_SECT'],
        mSquaredPO: data['m-squared_OVER'],
        martin: data['martin'],
        martinPS: data['martin_SECT'],
        martinPO: data['martin_OVER'],
        omega: data['omega'],
        omegaPS: data['omega_SECT'],
        omegaPO: data['omega_OVER'],


        qOverall: data['OVERALL'],
        qOverallPS: data['OVERALL_SECT'],
        qOverallPO: data['OVERALL_OVER'],
        qGrowth: data['G'],
        qGrowthPS: data['G_SECT'],
        qGrowthPO: data['G_OVER'],
        qRisk: data['R'],
        qRiskPS: data['R_SECT'],
        qRiskPO: data['R_OVER'],
        qPerformance: data['PE'],
        qPerformancePS: data['PE_SECT'],
        qPerformancePO: data['PE_OVER'],
        } as FullETF
      }
  } catch (err) {
    console.error('Error fetching asset data for', ticker, err);
    return null;
  }
}

export const getUserFavourites = async ({favourites}: {favourites: string[]}): Promise<Portfolio[]> => {
  try {
    if (!favourites || favourites.length === 0) return [];

    const portfoliosCollection = collection(firestore, 'portfolios');

    // Firestore doesn't allow `where in` with >10 items, so batch if needed
    const batchSize = 10;
    const result: Portfolio[] = [];

    for (let i = 0; i < favourites.length; i += batchSize) {
      const batchIds = favourites.slice(i, i + batchSize);
      const q = query(portfoliosCollection, where('__name__', 'in', batchIds));
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() } as Portfolio);
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching user favourites:', error);
    return [];
  }
};





interface GetTableDataParams {
  equity: boolean; // true = equities, false = ETFs
  onSuccess: (data: TableStock[] | TableETF[]) => void;
  onError?: (err: any) => void;
}

export async function getTableData({ equity, onSuccess, onError }: GetTableDataParams) {
  try {
    const collectionName = equity ? 'equities' : 'etfs';
    const stocksCollection = collection(firestore, collectionName);

    let q: Query<DocumentData> = query(stocksCollection); // can still wrap in query()
    

    // Then:
    const snapshot = await getDocs(q);

    let data: TableStock[] | TableETF[];
    if (equity) {
      data = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          assetClass: data['asset-class'],
          name: data['name'],
          ticker: doc.id,
          size: data['market-cap'],
          sector: data['sector'],
          volume: data['volume'],
          dividendYield: data['yield'],

          threeYearGrowth: data['3y'],
          sixMonthGrowth: data['6mo'],
          cagr: data['cagr'],
          oneYearGrowth: data['yoy'],

          dividendGrowth: data['div-g'],
          earningsGrowth: data['earnings-g'],
          revenueGrowth: data['revenue-g'],
          profitMargin: data['profit-m'],
          returnOnEquity: data['roe'],
          returnOnAssets: data['roa'],

          priceToEarnings: data['p-earnings'],
          priceToSales: data['p-sales'],
          priceToBook: data['p-book'],
          priceToEarningsToGrowth: data['peg'],

          avgDrawdown: data['avg-d'],
          maxDrawdown: data['max-d'],
          beta: data['beta'],
          standardDeviationReturns: data['std-dev'],
          var1: data['var1'],
          var5: data['var5'],
          var10: data['var10'],

          calmar: data['calmar'],
          alpha: data['alpha'],
          sharpe: data['sharpe'],
          sortino: data['sortino'],
          mSquared: data['m-squared'],
          martin: data['martin'],
          omega: data['omega'],

          altmanZ: data['altman-z'],
          assetsToLiabilities: data['assets-l'],
          debtToAssets: data['debt-a'],
          debtToEquity: data['debt-e'],
          debtToEBIT: data['debt-ebit'],
          wacc: data['wacc'],

          qOverall: data['OVERALL'],
          qGrowth: data['G'],
          qRisk: data['R'],
          qPerformance: data['PE'],
          qLeverage: data['L'],
          qValuation: data['V'],
          qProfitability: data['PR'],
        } as TableStock;
      });
    }
    else {
      data = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          assetClass: data['asset-class'],
          name: data['name'],
          ticker: doc.id,
          size: data['assets'] * 1000,
          sector: data['sector'],
          volume: data['volume'],
          dividendYield: data['yield'],

          threeYearGrowth: data['3y'],
          sixMonthGrowth: data['6mo'],
          cagr: data['cagr'],
          oneYearGrowth: data['yoy'],

          dividendGrowth: data['div-g'],
          expenses:data['expenses'],
          turnover:data['turnover'],
          sectorDiversity:data['sector-diversity'],
          holdingsDiversity:data['holding-diversity'],

          priceToEarnings: data['p-earnings'],

          avgDrawdown: data['avg-d'],
          maxDrawdown: data['max-d'],
          beta: data['beta'],
          standardDeviationReturns: data['std-dev'],
          var1: data['var1'],
          var5: data['var5'],
          var10: data['var10'],

          calmar: data['calmar'],
          alpha: data['alpha'],
          sharpe: data['sharpe'],
          sortino: data['sortino'],
          mSquared: data['m-squared'],
          martin: data['martin'],
          omega: data['omega'],

          qOverall: data['OVERALL'],
          qGrowth: data['G'],
          qRisk: data['R'],
          qPerformance: data['PE'],
        } as TableETF;
      });
    }

    // Sort descending by size
    data.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));

    onSuccess(data);
  } catch (error) {
    console.error('Error fetching table data:', error);
    if (onError) onError(error);
  }
}

export async function getCompetitors({ ticker }: { ticker: string }): Promise<ProxyAsset[]> {
  try {
    // Fetch the main asset to know its class and category
    const assetRef = collection(firestore, 'light_assets');
    const mainSnapshot = await getDocs(query(assetRef, where('__name__', '==', ticker)));
    if (mainSnapshot.empty) return [];

    const mainAsset = mainSnapshot.docs[0].data();
    const assetClass = mainAsset['asset-class'];
    const category = assetClass === 'Equity' ? mainAsset['sector'] : mainAsset['category'];

    // Query top 4 assets with same class and category, excluding current ticker
    let q = query(
      assetRef,
      where('asset-class', '==', assetClass),
      where(assetClass === 'Equity' ? 'sector' : 'category', '==', category),
      orderBy(assetClass === 'Equity' ? 'market-cap' : 'assets', 'desc'),
      limit(5) // fetch one extra in case the current ticker is included
    );

    const snapshot = await getDocs(q);

    const competitors: ProxyAsset[] = [];
    
    for (const doc of snapshot.docs) {
      if (doc.id === ticker) continue; // exclude the main ticker
      const data = doc.data();
      competitors.push({
        ticker: doc.id,
        name: data.name,
        size: data['asset-class'] == 'ETF'?data['assets']:data['market-cap'],
        category: data['asset-class'] == 'ETF'?data['category']:data['sector'],
        assetClass: data['asset-class']
      } as ProxyAsset);
      if (competitors.length >= 4) break; // only top 4
    }

    return competitors;
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return [];
  }
}

export async function getPortfolioDoc({ id }: { id: string }): Promise<Portfolio | null> {
  try {
    const docRef = doc(firestore, 'portfolios', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as Portfolio;
  } catch (error) {
    console.error('Error fetching portfolio document:', error);
    return null;
  }
}



// Get all favourites for a given user
export async function getFavourites({ userId }: { userId: string }): Promise<Favourite[]> {
  try {
    const favsRef = collection(firestore, 'favourites');
    const q = query(favsRef, where('fromUser', '==', userId));
    const querySnap = await getDocs(q);

    return querySnap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Favourite[];
  } catch (error) {
    console.error('Error fetching favourites:', error);
    return [];
  }
}

// Get the count of favourites for a given portfolio
export async function getFavouriteCount({ portfolioId }: { portfolioId: string }): Promise<number> {
  try {
    const favsRef = collection(firestore, 'favourites');
    const q = query(favsRef, where('toPortfolio', '==', portfolioId));

    // Using Firestore count aggregation for efficiency
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error fetching favourite count:', error);
    return 0;
  }
}

export async function toggleFavourite({ portfolioId, userId, att }: { portfolioId: string; userId: string, att: 'Add' | 'Remove' }): Promise<void> {
  try {
    const favsRef = collection(firestore, 'favourites');

    // Check if favourite already exists
    const q = query(
      favsRef,
      where('fromUser', '==', userId),
      where('toPortfolio', '==', portfolioId)
    );
    const snapshot = await getDocs(q);

    if (att == 'Add' && snapshot.empty) {
      // Add new favourite
      await addDoc(favsRef, {
        fromUser: userId,
        toPortfolio: portfolioId,
      } as Favourite);
    } else if (att == 'Remove') {
      // Remove existing favourite(s)
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
      }
    }
  } catch (error) {
    console.error('Error toggling favourite:', error);
  }
}
