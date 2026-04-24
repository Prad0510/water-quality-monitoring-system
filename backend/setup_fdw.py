import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def setup_fdw():
    # 1. Ensure all L2 labs have the required schema
    l2_labs = ['lab_govelli', 'lab_thane', 'lab_vasai']
    for lab in l2_labs:
        try:
            conn = psycopg2.connect(host='localhost', database=lab, user='postgres', password='pass12@#', port='5432')
            conn.autocommit = True
            cur = conn.cursor()
            print(f"Connected to {lab}.")
            
            # Create testresult table if it doesn't exist
            cur.execute("""
                CREATE TABLE IF NOT EXISTS testresult (
                    result_id serial primary key,
                    sample_id integer,
                    parameter_id integer,
                    value numeric,
                    status varchar(50),
                    test_date timestamp without time zone
                );
            """)
            
            # Insert a dummy record if empty
            cur.execute("SELECT COUNT(*) FROM testresult;")
            if cur.fetchone()[0] == 0:
                cur.execute("INSERT INTO testresult (sample_id, parameter_id, value, status, test_date) VALUES (999, 1, 7.5, 'Safe', NOW());")
                print(f"Inserted dummy data into {lab}.")
                
            cur.close()
            conn.close()
            print(f"Schema ensured on {lab}.")
        except Exception as e:
            print(f"Error setting up {lab} schema: {e}")

    # 2. Setup FDW in water_quality_db
    try:
        conn = psycopg2.connect(host='localhost', database='water_quality_db', user='postgres', password='pass12@#', port='5432')
        conn.autocommit = True
        cur = conn.cursor()
        print("Connected to water_quality_db.")
        
        cur.execute("CREATE EXTENSION IF NOT EXISTS postgres_fdw;")
        print("Extension postgres_fdw enabled.")
        # Create Servers and User Mappings for all L2 Labs
        l2_servers = [('govelli_node', 'lab_govelli'), ('thane_node', 'lab_thane'), ('vasai_node', 'lab_vasai')]
        for server_name, db_name in l2_servers:
            cur.execute(f"DROP SERVER IF EXISTS {server_name} CASCADE;")
            cur.execute(f"CREATE SERVER {server_name} FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'localhost', dbname '{db_name}', port '5432');")
            cur.execute(f"CREATE USER MAPPING FOR postgres SERVER {server_name} OPTIONS (user 'postgres', password 'pass12@#');")
            print(f"FOREIGN SERVER and USER MAPPING created for {server_name}.")
        conn.close()
        print("FDW Setup Completed Successfully.")
    except Exception as e:
        print(f"Error setting up FDW in water_quality_db: {e}")

if __name__ == '__main__':
    setup_fdw()
