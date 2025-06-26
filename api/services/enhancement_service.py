import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from runpod_client import start_enhancement, check_enhancement_status, get_enhancement_result

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

def create_enhancement_job(image_id, original_image_url, face_parsing_config):
    """
    Start a new enhancement job
    
    Args:
        image_id (str): Unique image filename
        original_image_url (str): URL of the original image
        face_parsing_config (dict): Face parsing configuration
        
    Returns:
        dict: Job information or error
    """
    try:
        # Start enhancement on RunPod
        runpod_result = start_enhancement(image_id, face_parsing_config)
        
        if not runpod_result['success']:
            return runpod_result
        
        job_id = runpod_result['job_id']
        
        # Store job in database
        conn = get_db_connection()
        if not conn:
            return {
                'success': False,
                'error': 'Database connection failed'
            }
        
        try:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO enhancement_jobs 
                (job_id, image_id, original_image_url, face_parsing_config, status, progress, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            """, (
                job_id,
                image_id,
                original_image_url,
                json.dumps(face_parsing_config),
                'processing',
                10
            ))
            
            db_job_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'success': True,
                'job_id': job_id,
                'db_job_id': db_job_id,
                'status': 'processing',
                'progress': 10,
                'message': 'Enhancement job created successfully'
            }
            
        except Exception as e:
            print(f"Database error creating enhancement job: {e}")
            if conn:
                conn.rollback()
                conn.close()
            return {
                'success': False,
                'error': f'Database error: {str(e)}'
            }
            
    except Exception as e:
        print(f"Error creating enhancement job: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def get_job_status(job_id):
    """
    Get the current status of an enhancement job
    
    Args:
        job_id (str): RunPod job ID
        
    Returns:
        dict: Current job status
    """
    try:
        # Check status with RunPod
        runpod_status = check_enhancement_status(job_id)
        
        # Update database with latest status
        if runpod_status['success']:
            update_job_status_in_db(job_id, runpod_status)
        
        # Get job info from database
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(cursor_factory=RealDictCursor)
                
                cursor.execute("""
                    SELECT * FROM enhancement_jobs 
                    WHERE job_id = %s
                """, (job_id,))
                
                job = cursor.fetchone()
                cursor.close()
                conn.close()
                
                if job:
                    return {
                        'success': True,
                        'job_id': job['job_id'],
                        'image_id': job['image_id'],
                        'original_image_url': job['original_image_url'],
                        'enhanced_image_url': job['enhanced_image_url'],
                        'status': job['status'],
                        'progress': job['progress'],
                        'error_message': job['error_message'],
                        'face_parsing_config': json.loads(job['face_parsing_config']) if job['face_parsing_config'] else None,
                        'created_at': job['created_at'].isoformat() if job['created_at'] else None,
                        'updated_at': job['updated_at'].isoformat() if job['updated_at'] else None
                    }
                else:
                    return {
                        'success': False,
                        'error': 'Job not found in database'
                    }
                    
            except Exception as e:
                print(f"Database error getting job status: {e}")
                if conn:
                    conn.close()
                return runpod_status  # Return RunPod status as fallback
        else:
            return runpod_status  # Return RunPod status as fallback
            
    except Exception as e:
        print(f"Error getting job status: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def update_job_status_in_db(job_id, status_info):
    """
    Update job status in database
    
    Args:
        job_id (str): RunPod job ID
        status_info (dict): Status information from RunPod
    """
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        
        # Prepare update values
        status = status_info.get('status', 'processing')
        progress = status_info.get('progress', 0)
        error_message = status_info.get('error')
        enhanced_image_url = None
        
        # If completed, try to get the enhanced image URL directly from output
        if status == 'completed' and 'output' in status_info:
            output = status_info['output']
            print(f"RunPod output for job {job_id}: {output}")
            
            # Extract enhanced image URL from different possible formats
            if isinstance(output, dict):
                enhanced_image_url = (output.get('image_url') or 
                                    output.get('enhanced_image') or 
                                    output.get('enhanced_image_url') or
                                    output.get('output_image') or
                                    output.get('result'))
            elif isinstance(output, str):
                enhanced_image_url = output
            elif isinstance(output, list) and len(output) > 0:
                if isinstance(output[0], str):
                    enhanced_image_url = output[0]
                elif isinstance(output[0], dict):
                    enhanced_image_url = (output[0].get('image_url') or 
                                        output[0].get('enhanced_image') or
                                        output[0].get('url'))
            
            print(f"Extracted enhanced image URL: {enhanced_image_url}")
        
        cursor.execute("""
            UPDATE enhancement_jobs 
            SET status = %s, 
                progress = %s, 
                error_message = %s,
                enhanced_image_url = %s,
                updated_at = NOW()
            WHERE job_id = %s
        """, (
            status,
            progress,
            error_message,
            enhanced_image_url,
            job_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"Updated job {job_id} status to {status} with progress {progress}%")
        if enhanced_image_url:
            print(f"Enhanced image URL stored: {enhanced_image_url}")
        
    except Exception as e:
        print(f"Error updating job status in database: {e}")
        if conn:
            conn.rollback()
            conn.close()

def get_job_result(job_id):
    """
    Get the final result of an enhancement job
    
    Args:
        job_id (str): RunPod job ID
        
    Returns:
        dict: Job result with enhanced image URL
    """
    try:
        # First, get current status
        status_info = get_job_status(job_id)
        
        if not status_info['success']:
            return status_info
        
        if status_info['status'] != 'completed':
            return {
                'success': False,
                'error': f"Job not completed yet. Current status: {status_info['status']}",
                'status': status_info['status'],
                'progress': status_info.get('progress', 0)
            }
        
        # If completed, return the result
        if status_info.get('enhanced_image_url'):
            return {
                'success': True,
                'job_id': job_id,
                'original_image_url': status_info['original_image_url'],
                'enhanced_image_url': status_info['enhanced_image_url'],
                'status': 'completed',
                'progress': 100
            }
        else:
            # Try to get result from RunPod directly
            runpod_result = get_enhancement_result(job_id)
            
            if runpod_result['success']:
                # Update database with the result
                update_job_status_in_db(job_id, {
                    'status': 'completed',
                    'progress': 100,
                    'enhanced_image_url': runpod_result['enhanced_image_url']
                })
                
                return {
                    'success': True,
                    'job_id': job_id,
                    'original_image_url': status_info['original_image_url'],
                    'enhanced_image_url': runpod_result['enhanced_image_url'],
                    'status': 'completed',
                    'progress': 100
                }
            else:
                return runpod_result
                
    except Exception as e:
        print(f"Error getting job result: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def list_user_enhancement_jobs(limit=10):
    """
    List recent enhancement jobs (for debugging/admin purposes)
    
    Args:
        limit (int): Maximum number of jobs to return
        
    Returns:
        dict: List of jobs
    """
    conn = get_db_connection()
    if not conn:
        return {
            'success': False,
            'error': 'Database connection failed'
        }
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT job_id, image_id, status, progress, created_at, updated_at
            FROM enhancement_jobs 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (limit,))
        
        jobs = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            'success': True,
            'jobs': [dict(job) for job in jobs]
        }
        
    except Exception as e:
        print(f"Error listing enhancement jobs: {e}")
        if conn:
            conn.close()
        return {
            'success': False,
            'error': str(e)
        } 