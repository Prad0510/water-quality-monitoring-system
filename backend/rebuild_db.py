import psycopg2

def rebuild_schema():
    # Schema definition
    CREATE_TABLE_SQL = """
        CREATE TABLE testresult (
            result_id serial primary key,
            sample_id integer,
            ph numeric,
            hardness numeric,
            solids numeric,
            chloramines numeric,
            sulfate numeric,
            conductivity numeric,
            organic_carbon numeric,
            trihalomethanes numeric,
            turbidity numeric,
            potability varchar(50),
            test_date timestamp without time zone
        );

        CREATE TABLE IF NOT EXISTS ai_pollution_log (
            log_id serial primary key,
            plastic_count integer,
            severity_score numeric,
            pollution_level varchar(50),
            scan_date timestamp without time zone default NOW()
        );

        CREATE INDEX idx_testresult_potability ON testresult(potability);
        CREATE INDEX idx_testresult_test_date ON testresult(test_date);
    """

    # 1. Rebuild L2 Labs (govelli, thane, vasai)
    l2_labs = ['lab_govelli', 'lab_thane', 'lab_vasai']
    for lab in l2_labs:
        try:
            conn = psycopg2.connect(host='localhost', database=lab, user='postgres', password='pass12@#')
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("DROP TABLE IF EXISTS testresult CASCADE;")
            cur.execute("DROP TABLE IF EXISTS ai_pollution_log CASCADE;")
            cur.execute(CREATE_TABLE_SQL)
            print(f"Rebuilt schemas natively in {lab}")
            cur.close()
            conn.close()
        except Exception as e:
            print(f"Error rebuilding {lab}: {e}")

    # 2. Rebuild water_quality_db (Central)
    conn = psycopg2.connect(host='localhost', database='water_quality_db', user='postgres', password='pass12@#')
    conn.autocommit = True
    cur = conn.cursor()
    
    # Drop existing view and foreign tables before dropping original table
    cur.execute("DROP VIEW IF EXISTS national_testresults_view CASCADE;")
    cur.execute("DROP FOREIGN TABLE IF EXISTS remote_govelli_testresult CASCADE;")
    cur.execute("DROP FOREIGN TABLE IF EXISTS remote_thane_testresult CASCADE;")
    cur.execute("DROP FOREIGN TABLE IF EXISTS remote_vasai_testresult CASCADE;")
    cur.execute("DROP TABLE IF EXISTS testresult CASCADE;")
    cur.execute("DROP TABLE IF EXISTS ai_pollution_log CASCADE;")

    # Recreate primary table in central
    cur.execute(CREATE_TABLE_SQL)
    print("Rebuilt schemas natively in water_quality_db")

    # Recreate foreign tables mapped to L2 labs
    nodes = [('govelli_node', 'remote_govelli_testresult'), ('thane_node', 'remote_thane_testresult'), ('vasai_node', 'remote_vasai_testresult')]
    for server_name, table_name in nodes:
        try:
            cur.execute(f"""
                CREATE FOREIGN TABLE {table_name} (
                    result_id serial,
                    sample_id integer,
                    ph numeric,
                    hardness numeric,
                    solids numeric,
                    chloramines numeric,
                    sulfate numeric,
                    conductivity numeric,
                    organic_carbon numeric,
                    trihalomethanes numeric,
                    turbidity numeric,
                    potability varchar(50),
                    test_date timestamp without time zone
                ) SERVER {server_name} OPTIONS (schema_name 'public', table_name 'testresult');
            """)
            print(f"Re-mapped {table_name} FDW to {server_name}")
        except Exception as e:
            print(f"Skipping {server_name} mapping, maybe server not setup yet: {e}")

    # Recreate Unified View
    try:
        cur.execute("""
            CREATE OR REPLACE VIEW national_testresults_view AS 
            SELECT result_id, sample_id, ph, hardness, solids, 
                   chloramines, sulfate, conductivity, organic_carbon, 
                   trihalomethanes, turbidity, potability as status, test_date, 'central' as node_origin 
            FROM testresult 
            UNION ALL 
            SELECT result_id, sample_id, ph, hardness, solids, 
                   chloramines, sulfate, conductivity, organic_carbon, 
                   trihalomethanes, turbidity, potability as status, test_date, 'govelli' as node_origin 
            FROM remote_govelli_testresult
            UNION ALL
            SELECT result_id, sample_id, ph, hardness, solids, 
                   chloramines, sulfate, conductivity, organic_carbon, 
                   trihalomethanes, turbidity, potability as status, test_date, 'thane' as node_origin 
            FROM remote_thane_testresult
            UNION ALL
            SELECT result_id, sample_id, ph, hardness, solids, 
                   chloramines, sulfate, conductivity, organic_carbon, 
                   trihalomethanes, turbidity, potability as status, test_date, 'vasai' as node_origin 
            FROM remote_vasai_testresult;
        """)
        print("Re-created national_testresults_view with 4-way UNION ALL")
    except Exception as e:
        print(f"Error creating unified view: {e}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    rebuild_schema()
