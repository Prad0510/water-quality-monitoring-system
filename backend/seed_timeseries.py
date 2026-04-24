import psycopg2
import random
from datetime import datetime, timedelta

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="water_quality_db",
        user="postgres",
        password="pass12@#",
        port="5432"
    )

def seed_data():
    conn = get_connection()
    cur = conn.cursor()
    
    # 1. Clear old dummy data avoiding foreign keys
    cur.execute("DELETE FROM testresult;")
    
    # 2. Setup Markov Probabilities
    # Safe -> Safe = 0.8, Safe -> Unsafe = 0.2
    # Unsafe -> Unsafe = 0.6, Unsafe -> Safe = 0.4
    
    current_state = "Safe"
    num_days = 150
    start_date = datetime.now() - timedelta(days=num_days)
    
    print(f"Generating {num_days} days of historical Markov data...")

    for i in range(num_days):
        # Determine transition
        r = random.random()
        if current_state == "Safe":
            if r < 0.2:
                current_state = "Not Potable"  # Notice schema variation. Kaggle model uses Unsafe or Not Potable. Using "Safe" and "Unsafe"
        else:
            if r < 0.4:
                current_state = "Safe"
        
        # In our db 'potability' is 'Safe' or 'Unsafe' according to earlier API fallback
        db_state = "Safe" if current_state == "Safe" else "Unsafe"
        
        # Generate metrics
        if db_state == "Safe":
            ph = round(random.uniform(6.5, 8.5), 2)
            hardness = round(random.uniform(150, 200), 2)
            solids = round(random.uniform(100, 500), 2)
            sulfate = round(random.uniform(100, 250), 2)
            turbidity = round(random.uniform(1, 4), 2)
        else:
            # Unsafe properties
            ph = round(random.choice([random.uniform(4.0, 6.0), random.uniform(9.0, 11.0)]), 2)
            hardness = round(random.uniform(220, 300), 2)
            solids = round(random.uniform(1000, 2500), 2)
            sulfate = round(random.uniform(300, 500), 2)
            turbidity = round(random.uniform(6, 10), 2)
            
        chloramines = round(random.uniform(0, 10), 2)
        conductivity = round(random.uniform(300, 600), 2)
        organic_carbon = round(random.uniform(10, 20), 2)
        trihalomethanes = round(random.uniform(40, 80), 2)
        
        # Current simulated timestamp
        current_date_ts = start_date + timedelta(days=i)
        
        # Insert
        cur.execute("""
            INSERT INTO testresult (
                sample_id, ph, hardness, solids, chloramines, 
                sulfate, conductivity, organic_carbon, trihalomethanes, 
                turbidity, potability, test_date
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            random.randint(1000, 9999), ph, hardness, solids, chloramines,
            sulfate, conductivity, organic_carbon, trihalomethanes,
            turbidity, db_state, current_date_ts
        ))

    conn.commit()
    cur.close()
    conn.close()
    print("Database seeded with synthetic Markov-ready historical data!")

if __name__ == '__main__':
    seed_data()
