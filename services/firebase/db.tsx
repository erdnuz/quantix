import { Portfolio, ProxyAsset, SuccessCallback, ErrorCallback, TableETF, TableStock, User, FullStock, FullETF } from '../../types';
import { firestore } from './initialization'; 
import {
  collection,
  increment,
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
} from 'firebase/firestore';

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

export const getUserByUsername = async ({
  username,
}: {
  username: string;
}): Promise<User | null> => {
  const userRef = collection(firestore, 'users');
  const result = await getDocs(query(userRef, where('username', '==', username)));
  if (!result.empty) {
    const docSnap = result.docs[0];
    return { ...docSnap.data(), id: docSnap.id } as User;
  }
  return null;
};

export const addUser = async ({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: (user: User) => void;
}): Promise<User> => {
  const { id, firstName, lastName, username } = user;
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
  data: Omit<Portfolio, 'id' | 'favourites' | 'shares' | 'actions' | 'date'>;
  onSuccess: (id: string) => void;
}): Promise<void> => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(Date.now());

  const portfolioData: Omit<Portfolio, 'id'> = {
    ...data,
    favourites: 0,
    cash: data.cash,
    initialCash: data.cash,
    shares: {},
    actions: {},
    date: formattedDate,
  };

  const portfoliosCollection = collection(firestore, 'portfolios');
  const docRef = await addDoc(portfoliosCollection, portfolioData);
  onSuccess(docRef.id);
};

type PortfolioActionParams = {
  portfolio: string;
  ticker: string;
  shares: number;
  onSuccess: () => void;
  onError?: (err?: any) => void;
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


export const portfolioAction = async ({
  portfolio,
  ticker,
  shares,
  onSuccess,
  onError,
}: PortfolioActionParams): Promise<void> => {
  try {
    // Do your DB or API call here
    onSuccess();
  } catch (err) {
    if (onError) onError(err);
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
    await updateDoc(portDocRef, portfolio as DocumentData);
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

export const incrementFavourites = async ({
  id,
  a,
}: {
  id: string;
  a: number;
}): Promise<void> => {
  const portfolioDocRef = doc(firestore, 'portfolios', id);
  try {
    await updateDoc(portfolioDocRef, { favourites: increment(a) });
  } catch (error) {
    console.error('Error incrementing favourites:', error);
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
      const category = assetClass === 'Equity' ? doc.get('sector') : doc.get('category');

      return {
        ticker: doc.id,
        name: doc.get('name'),
        assetClass,
        size,
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
      return {ticker:assetSnap.id, ...data } as FullStock
    } else {
      return {ticker:assetSnap.id, ...data } as FullETF
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

// Fetch compare data for multiple tickers (prices + correlation + plot)
export async function getCompareData({tickers} : {tickers: string[]}): Promise<{
  plot: Record<string, Record<string, number>>;
  corr: Record<string, Record<string, number>>;
  prices: Record<string, number>;
} | null> {
  try {
    const plot: Record<string, Record<string, number>> = {};
    const prices: Record<string, number> = {};
    const corr: Record<string, Record<string, number>> = {};

    
    return { plot, corr, prices };
  } catch (err) {
    console.error('Error fetching compare data:', err);
    return null;
  }
}


interface GetTableDataParams {
  equity: boolean; // true = equities, false = ETFs
  filtered: boolean; // true = apply thresholds
  onSuccess: (data: TableStock[] | TableETF[]) => void;
  onError?: (err: any) => void;
}

export async function getTableData({ equity, filtered, onSuccess, onError }: GetTableDataParams) {
  try {
    const collectionName = equity ? 'equities' : 'etfs';
    const stocksCollection = collection(firestore, collectionName);

    let q: Query<DocumentData>; // <-- use Query type

    if (filtered) {
      if (equity) {
        q = query(stocksCollection, where('market-cap', '>=', 1e9)); // >= 1B
      } else {
        q = query(stocksCollection, where('assets', '>=', 50e6)); // >= 50M
      }
    } else {
      q = query(stocksCollection); // can still wrap in query()
    }

    // Then:
    const snapshot = await getDocs(q);

    let data: TableStock[] | TableETF[];
    if (equity) {
      data = snapshot.docs.map((doc) => {
          return {
          ticker: doc.id,
          ...doc.data()
        } as TableStock;
      });
    }
    else {
      data = snapshot.docs.map((doc) => {
          return {
          ticker: doc.id,
          ...doc.data()
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



export async function getFastData({
  ticker,
  onSuccess,
  onError,
}: {
  ticker: string;
  onSuccess: SuccessCallback;
  onError?: ErrorCallback;
}): Promise<void> {
  try {
    onSuccess({
      price: 157.69,
      change: 4.09,
    });
  } catch (err) {
    onError?.("Error fetching price data.");
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
      competitors.push({
        ticker: doc.id,
        ...doc.data()
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

/**
 * Fetch portfolio data by ID.
 * Currently returns a placeholder object; will be implemented later.
 */
export async function getPortfolioData({ id }: { id: string }): Promise<Portfolio> {
  // Placeholder: return a minimal portfolio structure
  return {
    id,
    title: 'Sample Portfolio',
    userId: 'user123',
    date: new Date().toISOString(),
    favourites: 0,
    description: 'This is a placeholder portfolio.',
    tags: [],
    actions: {},
    df: {},
    hist: {},
    cash: 0,
    initialCash: 0,
    shares: {},
  } as Portfolio;
}