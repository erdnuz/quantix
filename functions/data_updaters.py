import firebase_admin
from firebase_admin import credentials, firestore
from DataManager import DataManager
from MacroRisk import MacroRisk
from yfHelper import yfHelper
import pandas as pd
from Portfolio import Portfolio
from MarketDataManager import MarketDataManager
import tqdm

cred = credentials.Certificate("./quant-algo-4430a-firebase-adminsdk-l8bgg-1b126ee4ee.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def update_macro_risk():
    macro_series = MacroRisk().update_data()
    macro_series = macro_series.sort_index()
    macro_series.index = macro_series.index.astype(str)

    data_dict = macro_series.to_dict()
    doc_ref = db.collection('macro_risk').document('hist')

    doc_ref.set(
        data_dict
    )
    
    macro_series = yfHelper('^GSPC').price_weekly_long()
    macro_series = macro_series.sort_index()
    macro_series.index = macro_series.index.astype(str)

    data_dict = macro_series.to_dict()

    doc_ref = db.collection('macro_risk').document('market')

    doc_ref.set(
        data_dict
    )

def push_to_db(light, table, full, coll):
    full = full.copy().reset_index()
    batch_size = 500  # Firestore batch size limit

    for b in range(0, len(full), batch_size):
        batch = db.batch()  # Create a new batch for each chunk
        chunk = full.iloc[b:b + batch_size]  # Get a chunk of 500 rows
        
        for _, row in tqdm.tqdm(chunk.iterrows(), desc=f"Pushing batch {b // batch_size + 1}", unit="asset"):
            doc_id = row['ticker'].replace(".", "%@")

            if row.get("name") and row.get("assets-usd", row.get("market-cap-usd")):
                try:
                    light_dict = light.loc[row['ticker']].dropna().to_dict()
                    table_dict = table.loc[row['ticker']].dropna().to_dict()
                    row_dict = row.drop('ticker').dropna().to_dict()

                    # Add to Firestore batch
                    batch.set(db.collection('assets').document(doc_id), row_dict)
                    batch.set(db.collection(coll).document(doc_id), table_dict)
                    batch.set(db.collection('light_assets').document(doc_id), light_dict)
                except Exception as e:
                    print(f"Error processing {doc_id}: {e}")

        # Commit the batch after processing the chunk
        batch.commit()
        print(f"Batch {b // batch_size + 1} write complete.")

    print("All batches have been written.")



#@scheduler_fn.on_schedule(schedule="every month 00:00")
def update_tables(auto=False):
    confirm = auto or input("Get equity tables? (YES/*)\n").strip().lower() == 'yes'
    if confirm:
        light, table, full = DataManager().build_df('./tickers/equity.txt',0)
        print(' & '.join(light.columns) + '\n')
        print(' & '.join(table.columns) + '\n')
        print(' & '.join(full.columns) + '\n')
        print(len(full), 'rows in DF')
        confirm = auto or input("Continue with push? (YES/*)\n").strip().lower() == 'yes'
        if confirm:
            push_to_db(light, table, full, "equities")
            print('Equity push DONE!!')

    confirm = auto or input("Get ETF tables? (YES/*)\n").strip().lower() == 'yes'
    if confirm:
        light, table, full = DataManager().build_df('./tickers/etf.txt',1)
        print(' & '.join(light.columns) + '\n')
        print(' & '.join(table.columns) + '\n')
        print(' & '.join(full.columns) + '\n')
        print(len(full), 'rows in DF')
        confirm = auto or input("Continue with push? (YES/*)\n").strip().lower() == 'yes'
        if confirm:
            push_to_db(light, table, full, "etfs")
            print('ETF push DONE!!')
    
    confirm = auto or input("Get mutual fund tables? (YES/*)\n").strip().lower() == 'yes'
    if confirm:
        light, table, full = DataManager().build_df('./tickers/fund.txt',2)
        print(' & '.join(light.columns) + '\n')
        print(' & '.join(table.columns) + '\n')
        print(' & '.join(full.columns) + '\n')
        print(len(full), 'rows in DF')
        confirm = auto or input("Continue with push? (YES/*)\n").strip().lower() == 'yes'
        if confirm:
            push_to_db(light, table, full, "funds")
            print('Mutual fund push DONE!!')


def get_tickers_with_type():
    i = 0
    for coll in ['equities','etfs','funds']:
        tickers = []
        collection_ref = db.collection(coll)
        

        docs = collection_ref.stream()
        
        for doc in docs:
            ticker = doc.id.replace("%@", ".")  # Reverse the '@' symbol back to '.'
            tickers.append(ticker)
        
        with open(f'./tickers/scraped_{coll}.txt', 'w') as f:

            for ticker in list(set(tickers)):
                try:
                    f.write(ticker + '\n')
                except:
                    print('Error:', ticker)
        i+=1




if __name__=="__main__":
    update_tables()
    #update_macro_risk()
    