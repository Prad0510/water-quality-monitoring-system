import pandas as pd
import psycopg2
import os
import glob

def import_kaggle_data():
    # Attempt to find the CSV in the Downloads folder automatically
    downloads_path = os.path.expanduser('~\\Downloads\\water_potability.csv')
    
    # Fallback to general search if exact name differs
    if not os.path.exists(downloads_path):
        search_path = os.path.expanduser('~\\Downloads\\*water*.csv')
        files = glob.glob(search_path)
        if not files:
            print("ERROR: Could not find water_potability.csv in your Downloads folder.")
            return
        downloads_path = files[0]
        
    print(f"Loading dataset from: {downloads_path}")
    
    # Read the dataset
    df = pd.read_csv(downloads_path)
    
    # Kaggle dataset often has NaNs, we need to handle them (convert to None for Postgres NULL)
    df = df.where(pd.notnull(df), None)

    conn = psycopg2.connect(host='localhost', database='water_quality_db', user='postgres', password='pass12@#')
    cur = conn.cursor()

    inserted_count = 0
    print("Beginning database import... This may take a minute.")
    
    for index, row in df.iterrows():
        # The CSV Potability is 1 (Safe) or 0 (Unsafe). Let's convert it to match our UI badges.
        potability_label = "Unknown"
        if row['Potability'] == 1:
            potability_label = "Safe"
        elif row['Potability'] == 0:
            potability_label = "Unsafe"
            
        def safe_float(val):
            return float(val) if val is not None else None
            
        sample_id = 5000 + index 
        
        cur.execute("""
            INSERT INTO testresult (
                sample_id, ph, hardness, solids, chloramines, 
                sulfate, conductivity, organic_carbon, trihalomethanes, 
                turbidity, potability, test_date
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, (
            sample_id, 
            safe_float(row['ph']), 
            safe_float(row['Hardness']), 
            safe_float(row['Solids']), 
            safe_float(row['Chloramines']),
            safe_float(row['Sulfate']), 
            safe_float(row['Conductivity']), 
            safe_float(row['Organic_carbon']), 
            safe_float(row['Trihalomethanes']),
            safe_float(row['Turbidity']), 
            potability_label
        ))
        
        inserted_count += 1

    conn.commit()
    cur.close()
    conn.close()
    
    print(f"Successfully inserted {inserted_count} rows into water_quality_db!")

if __name__ == '__main__':
    import_kaggle_data()
