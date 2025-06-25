import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

# Database connection using environment variables
# Use DIRECT_URL to avoid pgbouncer parameter issues
DATABASE_URL = os.getenv('DIRECT_URL') or os.getenv('DATABASE_URL')

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def initialize_image_counter():
    """Initialize the image counter if it doesn't exist"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Check if counter exists
        cursor.execute("""
            SELECT current_value FROM image_counters 
            WHERE counter_name = 'image_upload'
        """)
        
        result = cursor.fetchone()
        
        if not result:
            # Create the initial counter
            cursor.execute("""
                INSERT INTO image_counters (counter_name, current_value, created_at, updated_at)
                VALUES ('image_upload', 0, NOW(), NOW())
            """)
            conn.commit()
            print("Image counter initialized successfully")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error initializing image counter: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

def get_next_image_counter():
    """Get the next unique image counter value atomically"""
    conn = get_db_connection()
    if not conn:
        # Fallback to timestamp-based counter if DB is unavailable
        import time
        return int(time.time())
    
    try:
        cursor = conn.cursor()
        
        # Atomic increment and return - this ensures thread safety
        cursor.execute("""
            UPDATE image_counters 
            SET current_value = current_value + 1, 
                updated_at = NOW()
            WHERE counter_name = 'image_upload'
            RETURNING current_value
        """)
        
        result = cursor.fetchone()
        
        if result:
            counter_value = result[0]
            conn.commit()
            cursor.close()
            conn.close()
            return int(counter_value)
        else:
            # Counter doesn't exist, initialize it
            cursor.close()
            conn.close()
            if initialize_image_counter():
                return get_next_image_counter()  # Recursive call after initialization
            else:
                # Final fallback
                import time
                return int(time.time())
                
    except Exception as e:
        print(f"Error getting next image counter: {e}")
        if conn:
            conn.rollback()
            conn.close()
        
        # Fallback to timestamp-based counter
        import time
        return int(time.time())

def generate_unique_filename(original_filename):
    """Generate unique filename with counter prefix"""
    counter = get_next_image_counter()
    
    # Handle edge cases
    if not original_filename:
        original_filename = "image.jpg"
    
    # Create unique filename: counter_originalname.extension
    unique_filename = f"{counter}_{original_filename}"
    
    return unique_filename, counter 