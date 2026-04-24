import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection(region="central"):
    """
    Routes database connections based on region.
    - 'central': The main hub (localhost)
    - 'govelli': The remote lab node (Simulated or actual IP)
    """
    
    db_configs = {
        "central": {
            "host": "localhost",
            "database": "water_quality_db",
            "user": "postgres",
            "password": "pass12@#",
            "port": "5432"
        },
        "govelli": {
            "host": "localhost", # Adjusted for local simulation test
            "database": "lab_govelli",
            "user": "postgres",
            "password": "pass12@#",
            "port": "5432"
        },
        "thane": {
            "host": "localhost",
            "database": "lab_thane",
            "user": "postgres",
            "password": "pass12@#",
            "port": "5432"
        },
        "vasai": {
            "host": "localhost",
            "database": "lab_vasai",
            "user": "postgres",
            "password": "pass12@#",
            "port": "5432"
        }
    }

    # Get config for requested region, default to central if not found
    config = db_configs.get(region, db_configs["central"])
    
    try:
        conn = psycopg2.connect(**config)
        return conn
    except Exception as e:
        print(f"❌ Connection Error to {region} node: {e}")
        return None