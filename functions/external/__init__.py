from datetime import date, datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
from .data import DataManager
import tqdm
import json
import os

if __name__ == "__main__":
    cred = credentials.Certificate("./quant-algo-4430a-firebase-adminsdk-l8bgg-1b126ee4ee.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    os.makedirs("./tables", exist_ok=True)
    os.makedirs("./cache", exist_ok=True)

def push_to_db(light, table, full, coll):
    full = full.copy().reset_index()
    batch_size = 500  # Firestore batch size limit

    for b in range(0, len(full), batch_size):
        batch = db.batch()  # Create a new batch for each chunk
        chunk = full.iloc[b:b + batch_size]  # Get a chunk of 500 rows
        
        for _, row in tqdm.tqdm(chunk.iterrows(), desc=f"Pushing batch {b // batch_size + 1}", unit="asset"):
            doc_id = row['ticker']

            if row.get("name") and row.get("assets", row.get("market-cap")):
                try:
                    light_dict = light.loc[row['ticker']].dropna().to_dict()
                    table_dict = table.loc[row['ticker']].dropna().to_dict()
                    row_dict = row.drop('ticker').dropna().to_dict()
                    row_dict['earnings-date'] = row_dict.get(
                        'earnings-date', 
                        (datetime.now() + timedelta(days=95))
                    ).strftime("%Y-%m-%d")
                    # Add to Firestore batch
                    batch.set(db.collection('assets').document(doc_id), row_dict)
                    batch.set(db.collection(coll).document(doc_id), table_dict)
                    batch.set(db.collection('light_assets').document(doc_id), light_dict)
                except Exception as e:

                    print(f"Error processing {doc_id}: {e}.")
                    print(row)
                    raise(e)

        # Commit the batch after processing the chunk
        batch.commit()
        print(f"Batch {b // batch_size + 1} write complete.")

    print("All batches have been written.")
    
def update_tables(auto=False):
    symbols = json.load(open('./external/yahoo_symbols.json','r'))  # Pre-load symbols

    confirm = auto or input("Get equity tables? (YES/*)\n").strip().lower() == 'yes'
    if confirm:
        light, table, full = DataManager().build_df(symbols['equities'],True)
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
        light, table, full = DataManager().build_df(symbols['etfs'],False)
        print(' & '.join(light.columns) + '\n')
        print(' & '.join(table.columns) + '\n')
        print(' & '.join(full.columns) + '\n')
        print(len(full), 'rows in DF')
        confirm = auto or input("Continue with push? (YES/*)\n").strip().lower() == 'yes'
        if confirm:
            push_to_db(light, table, full, "etfs")
            print('ETF push DONE!!')

if __name__ == "__main__":
    update_tables()