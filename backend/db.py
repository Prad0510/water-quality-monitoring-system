import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="water_quality_db",
        user="postgres",
        password="pass12@#",
        port="5432"
    )