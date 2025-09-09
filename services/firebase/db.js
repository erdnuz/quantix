import { firestore } from './initialization'; 
import { collection, orderBy, limit, increment,
  setDoc, getDoc,addDoc, updateDoc, getDocs, doc, query, where, deleteDoc} from 'firebase/firestore';

export const generateUsername = async (firstName, lastName ) => {
  firstName = firstName.toLowerCase();
  lastName = lastName.toLowerCase();
  const firstInitial = firstName.charAt(0);
  const lastInitial = lastName.charAt(0);
  let usernameOptions = [];
  usernameOptions.push(firstInitial + lastName);
  usernameOptions.push(firstName + lastInitial);
  usernameOptions.push(firstName + lastName);

  let count = 0;
  while (true) {
    for (let option of usernameOptions) {
      let username = option;
      if (count > 0) {
        username = `${option}${count}`;
      }
      let isUsernameInUse = await usernameExists(username);  // Check if the username is already in use
      if (!isUsernameInUse) {
        return username;
      }
    }
    count++;
  }
};


export const usernameExists = async (username) => {
  const userRef = collection(firestore, 'users');
  const snapshot = await getDocs(query(userRef, where('username', '==', username)));
  return !snapshot.empty; 
};


// Function to get the user by email or username, and create if not found
export const getUserById = async (id) => {
  const userDocRef = doc(firestore, 'users', id);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return { ...userDoc.data(), id: userDoc.id };
  } else {
    return null;
  }
};

export const getUserByUsername = async (username) => {
  const userRef = collection(firestore, 'users');
  const result = await getDocs(query(userRef, where('username', '==', username)));
  if (!result.empty) {
    const doc = result.docs[0];
    return { ...doc.data(), id: doc.id };
  } else {
    return null;
  }
}

export const addUser = async ({ id, email, username, firstName, lastName, onSuccess}) => {
  const userRef = doc(firestore, 'users', id);
  email = email || ""
  const newUser = {
    email,
    firstName,
    lastName,
    username,
    premium: 0,
  };

  await setDoc(userRef, newUser);
  onSuccess({ ...newUser, id });
  return newUser;
};


export const deleteUser = async (userId, onSuccess, onError) => {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    await deleteDoc(userDocRef);
    onSuccess('User deleted successfully.');
  } catch (error) {
    console.error("Error deleting user:", error);
    onError('Error deleting user: ' + error.message);
  }
};

export const updateUser = async (user) => {
  console.log(user)
  try {
    const userDocRef = doc(firestore, "users", user.id);
    await updateDoc(userDocRef, user);
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

export const getStockIdsAndNames = async () => {
  const stored = sessionStorage.getItem("querySugg");
  
  if (stored) {
    try {
      return JSON.parse(stored);  // Parse the cached string back into an object
    } catch (error) {
      console.error("Failed to parse cached stock data:", error);
      sessionStorage.removeItem("querySugg");  // Clear corrupted cache
    }
  }

  try {
    const stocksCollection = collection(firestore, "light_assets");
    const q = query(stocksCollection);

    console.time("getDocsDuration");
    const snapshot = await getDocs(q);
    console.timeEnd("getDocsDuration");

    const stockData = snapshot.docs.map((doc) => ({
      id: doc.id.replace("%@", "."),
      name: doc.get("name") || null,
      size: doc.id.includes("%@")
        ? 0.5
        : 1 * (doc.get("market-cap-usd") || 30 * doc.get("assets-usd") || 0),
    }));

    // Sort by size (descending order)
    stockData.sort((a, b) => b.size - a.size);

    sessionStorage.setItem("querySugg", JSON.stringify(stockData));  // Store as a string
    return stockData;
  } catch (error) {
    console.error("Error retrieving stock IDs and names:", error);
    return [];
  }
};


export const getTableData = async (type, filtered=true) => {
  try {
    const stocksCollection = collection(firestore, ["equities", "etfs","funds"][type]);
    const q = filtered?query(stocksCollection, where(type==0?'market-cap-usd':'assets-usd', '>', [50e9, 50e6, 200e6][type]), where('region', '==', 'USA')):query(stocksCollection);
    const snapshot = await getDocs(q);
    const stockData = snapshot.docs.map((doc) => ({
      ticker: doc.id.replace("%@", "."),
      ...doc.data(),
    }));

    return stockData;
  } catch (error) {
    console.error("Error retrieving stock IDs and names:", error);
    return [];
  }
};


export const getPortfolioTableData = async () => {
  try {
    const portCollection = collection(firestore, "portfolios");
    const snapshot = await getDocs(portCollection); // Pass portCollection here

    console.log(snapshot.docs);
    const portfolios = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(doc => doc.cagr !== undefined  );
    return portfolios; // Extract data properly
  } catch (error) {
    console.error("Error retrieving portfolio data:", error);
    return [];
  }
};


export const getAssetData = async (ticker) => {
  try {
    const id = ticker.replace(".", "%@");
    
    const stock = doc(firestore, "assets", id);

    const snapshot = await getDoc(stock);
    
    // If the document exists, map the data to include the ticker id
    if (snapshot.exists()) {
      const stockData = {
        ticker: snapshot.id.replace("%@", "."),  // Using the document ID as the ticker
        ...snapshot.data(),   // Spread the document data
      };
      return stockData;
      
      
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving stock data:", error);
    return [];  // Return an empty array in case of error
  }
};

export const getCompetitors = async (data) => {

    const stocksRef = collection(firestore, "light_assets");
    let competitorsQuery;
    let f;

    if (data.type===0) {

      competitorsQuery = query(
        stocksRef,
        where("sector", "==", data.sector),
        where("region", "==", data.region),
        orderBy("market-cap-usd", "desc"), // Sort by market cap in descending order
        limit(5) // Limit to top 5 results
      );

      f = (doc) => {
        return {
          ticker: doc.id.replace("%@", "."),
          region: doc.data().region,
          name: doc.data().name,
          cap: doc.data()["market-cap-usd"],
          sector: doc.data().sector,
        };
      };
    } else {

      competitorsQuery = query(
        stocksRef,
        where("category", "==", data.category),
        where("region", "==", data.region), 
        where("type","==",data.type),// Match the same category
        orderBy("assets-usd", "desc"), // Sort by assets in descending order
        limit(5) // Limit to top 5 results
      );

      f = (doc) => {
        return {
          ticker: doc.id.replace("%@", "."),
          region: doc.data().region,
          name: doc.data().name,
          cap: doc.data()["assets-usd"],
          sector: doc.data().category,
        };
      };
    }
    const snapshot = await getDocs(competitorsQuery);

    const competitors = snapshot.docs
      .filter((doc) => {
        const isExcluded = doc.id === data.ticker.replace(".", "%@");
        return !isExcluded;
      })
      .map(f)
      .slice(0, 4);
    console.log(competitors)
    return competitors;

    
};


export const getMacroRisk = async () => {
  try {
    const docRef = doc(firestore, "macro_risk", "hist");
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      const hist = docSnapshot.data(); 
      const formattedData = Object.keys(hist).map((dateString) => {
        // Convert the date string (YYYY-MM-DD) to a UNIX timestamp (in seconds)
        
        return {
          time: dateString,  // UNIX timestamp
          value: hist[dateString]  // The corresponding value
        };
      });
       // Assuming 'hist' is an object with timestamps as keys
      return formattedData;
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving macro risk data:", error);
    return [];
  }
};

export const getMarketPrices = async () => {
  try {
    const docRef = doc(firestore, "macro_risk", "market");
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      const hist = docSnapshot.data(); 
      console.log(hist)
      const formattedData = Object.keys(hist).map((dateString) => {
        // Convert the date string (YYYY-MM-DD) to a UNIX timestamp (in seconds)
        
        return {
          time: dateString,  // UNIX timestamp
          value: hist[dateString]  // The corresponding value
        };
      });
       // Assuming 'hist' is an object with timestamps as keys
      return formattedData;
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving macro risk data:", error);
    return [];
  }
};




//Portfolio methods
export const portfolioAction = async ({ portfolio, ticker, shares, price }) => {
  console.log({ portfolio, ticker, shares, price })
  const portfolioDoc = doc(firestore, "portfolios", portfolio);
  
  // Get the portfolio document
  const snapshot = await getDoc(portfolioDoc);
  
  // If the document exists, process the portfolio data
  if (snapshot.exists()) {
    const portfolioData = snapshot.data();
    const currentCash = portfolioData.cash;
    const currentShares = portfolioData.shares?.[ticker] || 0;
    const actions = portfolioData.actions?.[ticker] || {}; // Actions for the given ticker
    
    // Calculate the new shares and cash balance
    const newShares = currentShares + shares;
    const newCash = currentCash - (shares * price);

    console.log(currentShares, shares)
    if (newShares < 0 || newCash < 0) {
      throw new Error("Insufficient cash or shares for this transaction.");
    }

    // Add the action entry for today (using today's date)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    actions[today] = (actions[today]||0)+shares;

    if (actions[today] === 0) {
      delete actions[today];
    }
    

    // Prepare the data to update in Firestore
    const updatedData = {
      cash: newCash, // Update the cash balance
      shares: {
        ...portfolioData.shares,
        [ticker]: newShares, // Update the number of shares for the ticker
      },
      actions: {
        ...portfolioData.actions,
        [ticker]: actions, // Update the actions for the ticker
      },
    };

    // Update the portfolio document in Firestore
    await updateDoc(portfolioDoc, updatedData);

    console.log(`Portfolio updated: ${ticker} now has ${newShares} shares and cash balance is ${newCash}`);
  } else {
    throw new Error("Portfolio not found.");
  }
};

export const createPortfolio = async ({ userId, initialCash, title, description, tags }, onSuccess) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short', // 'short' for abbreviated month name (e.g., 'Oct')
    day: '2-digit'
  }).format(Date.now());

  const portfolioData = {
    userId: userId,  // Username associated with this portfolio
    title: title,
    date: formattedDate,
    description: description,
    tags: tags,
    favourites: 0,
    cash: initialCash,
    initialCash: initialCash,  // Initial cash balance
    shares: {},  // No shares initially
    actions: {},  // No actions yet
  };

  // Reference to the 'portfolios' collection in Firestore
  const portfoliosCollection = collection(firestore, "portfolios");

  try {
    // Add the new portfolio document to Firestore
    const docRef = await addDoc(portfoliosCollection, portfolioData);
    onSuccess(docRef.id);
  } catch (error) {
    console.error("Error creating portfolio:", error);
    throw new Error("Failed to create portfolio");
  }
};


export const deletePortfolio = async ({portfolioId, onSuccess}) => {
  try {
    console.log(portfolioId)
    const portDocRef = doc(firestore, 'portfolios', portfolioId);
    await deleteDoc(portDocRef).then(onSuccess)
  } catch (error) {
    console.error("Error deleting portfolio:", error);
  }
};

export const updatePortfolio = async (portfolio) => {
  try {
    const portDocRef = doc(firestore, "portfolios", portfolio.id);
    await updateDoc(portDocRef, portfolio);
  } catch (error) {
    console.error("Error updating portfolio:", error);
  }
};

export const getUserPortfolios = async (userId) => {
  // Reference to the 'portfolios' collection in Firestore
  const portfoliosCollection = collection(firestore, "portfolios");

  // Create a query to get all portfolios for the given userId
  const q = query(portfoliosCollection, where("userId", "==", userId));

  try {
    // Execute the query and get the documents
    const querySnapshot = await getDocs(q);
    
    // Convert the query snapshot to an array of portfolio data
    const portfolios = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return portfolios; // Return the portfolios
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    throw new Error("Failed to fetch portfolios");
  }
};

export const getUserFavourites = async (userFavourites) => {
  // Reference to the 'portfolios' collection in Firestore
  const portfoliosCollection = collection(firestore, "portfolios");

  try {
    // Fetch all portfolios from Firestore
    const querySnapshot = await getDocs(portfoliosCollection);
    
    // Filter documents by matching document IDs with userFavourites
    const portfolios = querySnapshot.docs
      .filter(doc => userFavourites.includes(doc.id)) // Check if the document ID is in the userFavourites array
      .map(doc => ({
        id: doc.id,
        ...doc.data(), // Get the document data
      }));

    return portfolios; // Return the filtered portfolios
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    throw new Error("Failed to fetch portfolios");
  }
};

export const getPortfolioDoc = async (id) => {
  const portfolioDocRef = doc(firestore, 'portfolios', id);
  const portfolioDoc = await getDoc(portfolioDocRef);
  if (portfolioDoc.exists()) {
    return { ...portfolioDoc.data(), id: portfolioDoc.id };
  } else {
    return null;
  }
};

export const incrementFavourites = async (id, a) => {
  const portfolioDocRef = doc(firestore, "portfolios", id);

  try {
    await updateDoc(portfolioDocRef, {
      favourites: increment(a), // Increments the favourites field by 1
    });
    console.log(`Favourites count updated for portfolio ID: ${id}`);
  } catch (error) {
    console.error("Error incrementing favourites:", error);
    throw new Error("Failed to increment favourites");
  }
}

export const submitForm = async ({ name, email, message }) => {
  try {
    // Add a new document to the "contact_submissions" collection
    await addDoc(collection(firestore, "contact_submissions"), {
      name,
      email,
      message,
      timestamp: new Date()  // Optional: Add a timestamp
    });

    return true;  // Form submission successful
  } catch (error) {
    console.error("Error submitting form:", error);
    return false;  // Form submission failed
  }
};





// REQUEST FUNCS
export const getFastData = async (ticker, convert=false) => {
  const oUrl = `http://127.0.0.1:5001/quant-algo-4430a/us-central1/get_fast_data?t=${ticker}${convert ? "&convert=1" : ""}`;
  const url = `https://get-fast-data-snhaybxdwa-uc.a.run.app?t=${ticker}${convert ? "&convert=1" : ""}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching compare data:", error);
    return null;
  }
};


export const getCompareData = async (tickers) => {
  if (!tickers || tickers.length === 0) {
    return null;
  }
  const oUrl = `http://127.0.0.1:5001/quant-algo-4430a/us-central1/get_compare_info?t=${tickers.join('&t=')}`;
  const url = `https://get-compare-info-snhaybxdwa-uc.a.run.app?t=${tickers.join('&t=')}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching compare data:", error);
    return null;
  }
};


export const getPortfolioData = async (id) => {
  if (!id) {
    return null;
  }
  const oUrl = `http://127.0.0.1:5001/quant-algo-4430a/us-central1/get_portfolio_data?t=${id}`;
  const url = `https://get-portfolio-data-snhaybxdwa-uc.a.run.app?t=${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching compare data:", error);
    return null;
  }
};




