#!/usr/bin/env python3
"""
Database setup script for Skin Studio
Creates tables and adds sample data
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

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

def create_tables():
    """Create the necessary tables"""
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor()
        
        print("📋 Creating tables...")
        
        # Create image_counters table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS image_counters (
                id SERIAL PRIMARY KEY,
                counter_name VARCHAR(50) UNIQUE NOT NULL,
                current_value INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Create enhancement_jobs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS enhancement_jobs (
                id SERIAL PRIMARY KEY,
                job_id VARCHAR(255) UNIQUE NOT NULL,
                image_id VARCHAR(255) NOT NULL,
                original_image_url TEXT NOT NULL,
                enhanced_image_url TEXT,
                face_parsing_config JSONB,
                status VARCHAR(50) DEFAULT 'pending',
                progress INTEGER DEFAULT 0,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_enhancement_jobs_job_id ON enhancement_jobs(job_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_enhancement_jobs_status ON enhancement_jobs(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_image_counters_name ON image_counters(counter_name)")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Tables created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

def add_sample_data():
    """Add sample data to image_counters table"""
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor()
        
        print("📊 Adding sample data...")
        
        # Insert or update the image counter
        cursor.execute("""
            INSERT INTO image_counters (counter_name, current_value, created_at, updated_at)
            VALUES ('image_upload', 1000, NOW(), NOW())
            ON CONFLICT (counter_name) 
            DO UPDATE SET 
                current_value = GREATEST(image_counters.current_value, 1000),
                updated_at = NOW()
        """)
        
        # Add some sample enhancement jobs for testing
        sample_jobs = [
            {
                'job_id': 'sample-job-1',
                'image_id': '1001_sample_image.jpg',
                'original_image_url': 'https://example.com/original1.jpg',
                'status': 'completed',
                'progress': 100
            },
            {
                'job_id': 'sample-job-2', 
                'image_id': '1002_test_photo.png',
                'original_image_url': 'https://example.com/original2.png',
                'status': 'processing',
                'progress': 75
            }
        ]
        
        for job in sample_jobs:
            cursor.execute("""
                INSERT INTO enhancement_jobs 
                (job_id, image_id, original_image_url, status, progress, created_at, updated_at)
                VALUES (%(job_id)s, %(image_id)s, %(original_image_url)s, %(status)s, %(progress)s, NOW(), NOW())
                ON CONFLICT (job_id) DO NOTHING
            """, job)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Sample data added successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

def verify_setup():
    """Verify the database setup"""
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return False
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔍 Verifying setup...")
        
        # Check image_counters table
        cursor.execute("SELECT * FROM image_counters WHERE counter_name = 'image_upload'")
        counter = cursor.fetchone()
        if counter:
            print(f"✅ Image counter: {counter['counter_name']} = {counter['current_value']}")
        else:
            print("❌ Image counter not found")
        
        # Check enhancement_jobs table
        cursor.execute("SELECT COUNT(*) as job_count FROM enhancement_jobs")
        job_count = cursor.fetchone()['job_count']
        print(f"✅ Enhancement jobs: {job_count} records")
        
        # List sample jobs
        cursor.execute("SELECT job_id, image_id, status, progress FROM enhancement_jobs ORDER BY created_at DESC LIMIT 5")
        jobs = cursor.fetchall()
        for job in jobs:
            print(f"   📝 Job: {job['job_id']} ({job['image_id']}) - {job['status']} ({job['progress']}%)")
        
        cursor.close()
        conn.close()
        
        print("✅ Database verification completed")
        return True
        
    except Exception as e:
        print(f"❌ Error verifying setup: {e}")
        if conn:
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 Setting up Skin Studio Database")
    print("=" * 40)
    
    # Test database connection
    print(f"🔌 Testing connection to: {DATABASE_URL[:50]}...")
    conn = get_db_connection()
    if conn:
        print("✅ Database connection successful")
        conn.close()
    else:
        print("❌ Database connection failed")
        exit(1)
    
    # Create tables
    if not create_tables():
        exit(1)
    
    # Add sample data
    if not add_sample_data():
        exit(1)
    
    # Verify setup
    if not verify_setup():
        exit(1)
    
    print("\n🎉 Database setup completed successfully!")
    print("You can now start the backend server.") 