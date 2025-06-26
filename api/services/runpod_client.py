import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

# RunPod API Configuration - Updated to use your exact API format
RUNPOD_API_URL = "https://api.runpod.ai/v2/wez710zm520y1v/run"
RUNPOD_STATUS_URL = "https://api.runpod.ai/v2/wez710zm520y1v/status"
RUNPOD_API_KEY = "rpa_TFC7TGD9JOAJAJFLFUG8OKEKSV2UX58ZMTBVIZFE0o5jg5"

def start_enhancement(image_id, face_parsing_config):
    """
    Start image enhancement process on RunPod using the exact API format

    Args:
        image_id (str): The unique image filename
        face_parsing_config (dict): Face parsing configuration

    Returns:
        dict: Response with job_id or error
    """
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {RUNPOD_API_KEY}'
    }

    # Use the exact payload format from your curl command
    payload = {
        "input": {
            "image_id": image_id,
            "face_parsing": face_parsing_config
        }
    }
    
    try:
        print(f"Starting enhancement for image: {image_id}")
        print(f"Face parsing config: {json.dumps(face_parsing_config, indent=2)}")
        print(f"Full payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(RUNPOD_API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Enhancement started successfully: {result}")
            
            return {
                'success': True,
                'job_id': result.get('id'),
                'status': result.get('status', 'IN_QUEUE'),
                'message': 'Enhancement process started successfully'
            }
        else:
            error_msg = f"RunPod API error: {response.status_code} - {response.text}"
            print(error_msg)
            
            return {
                'success': False,
                'error': error_msg,
                'status_code': response.status_code
            }
            
    except requests.exceptions.Timeout:
        error_msg = "RunPod API request timed out"
        print(error_msg)
        return {
            'success': False,
            'error': error_msg
        }
        
    except requests.exceptions.ConnectionError:
        error_msg = "Failed to connect to RunPod API"
        print(error_msg)
        return {
            'success': False,
            'error': error_msg
        }
        
    except Exception as e:
        error_msg = f"Unexpected error calling RunPod API: {str(e)}"
        print(error_msg)
        return {
            'success': False,
            'error': error_msg
        }

def check_enhancement_status(job_id):
    """
    Check the status of an enhancement job
    
    Args:
        job_id (str): RunPod job ID
        
    Returns:
        dict: Status information
    """
    headers = {
        'Authorization': f'Bearer {RUNPOD_API_KEY}'
    }
    
    try:
        status_url = f"{RUNPOD_STATUS_URL}/{job_id}"
        response = requests.get(status_url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"Raw RunPod response for job {job_id}: {json.dumps(result, indent=2)}")
            
            status = result.get('status', 'UNKNOWN')
            
            # Map RunPod statuses to our internal statuses
            status_mapping = {
                'IN_QUEUE': 'processing',
                'IN_PROGRESS': 'processing', 
                'COMPLETED': 'completed',
                'FAILED': 'failed',
                'CANCELLED': 'failed',
                'TIMED_OUT': 'failed'
            }
            
            mapped_status = status_mapping.get(status, 'processing')
            
            response_data = {
                'success': True,
                'status': mapped_status,
                'runpod_status': status,
                'job_id': job_id
            }
            
            # Add progress estimation based on status
            if mapped_status == 'processing':
                if status == 'IN_QUEUE':
                    response_data['progress'] = 10
                elif status == 'IN_PROGRESS':
                    response_data['progress'] = 50
            elif mapped_status == 'completed':
                response_data['progress'] = 100
                # Get the output if completed
                if 'output' in result:
                    response_data['output'] = result['output']
                    print(f"RunPod output for completed job {job_id}: {json.dumps(result['output'], indent=2)}")
            elif mapped_status == 'failed':
                response_data['progress'] = 0
                if 'error' in result:
                    response_data['error'] = result['error']
                    print(f"RunPod error for job {job_id}: {result['error']}")
            
            print(f"Status check for job {job_id}: {status} -> {mapped_status}")
            return response_data
            
        else:
            error_msg = f"Status check failed: {response.status_code} - {response.text}"
            print(error_msg)
            
            return {
                'success': False,
                'error': error_msg,
                'status': 'failed'
            }
            
    except requests.exceptions.Timeout:
        error_msg = "Status check request timed out"
        print(error_msg)
        return {
            'success': False,
            'error': error_msg,
            'status': 'processing'  # Assume still processing on timeout
        }
        
    except Exception as e:
        error_msg = f"Error checking status: {str(e)}"
        print(error_msg)
        return {
            'success': False,
            'error': error_msg,
            'status': 'processing'  # Assume still processing on error
        }

def get_enhancement_result(job_id):
    """
    Get the final result of an enhancement job
    
    Args:
        job_id (str): RunPod job ID
        
    Returns:
        dict: Result information with enhanced image URL
    """
    status_result = check_enhancement_status(job_id)
    
    if not status_result['success']:
        return status_result
    
    if status_result['status'] != 'completed':
        return {
            'success': False,
            'error': f"Job not completed yet. Current status: {status_result['status']}"
        }
    
    # Extract the enhanced image URL from the output
    if 'output' in status_result:
        output = status_result['output']
        
        # The exact structure depends on RunPod's response format
        # We'll need to adjust this based on actual API response
        enhanced_image_url = None
        
        if isinstance(output, dict):
            enhanced_image_url = output.get('image_url') or output.get('enhanced_image')
        elif isinstance(output, str):
            enhanced_image_url = output
        elif isinstance(output, list) and len(output) > 0:
            enhanced_image_url = output[0]
        
        if enhanced_image_url:
            return {
                'success': True,
                'enhanced_image_url': enhanced_image_url,
                'status': 'completed'
            }
        else:
            return {
                'success': False,
                'error': 'Enhanced image URL not found in response',
                'raw_output': output
            }
    else:
        return {
            'success': False,
            'error': 'No output found in completed job'
        }

def get_default_face_parsing_config():
    """
    Get default face parsing configuration
    
    Returns:
        dict: Default configuration
    """
    return {
        "background": False,
        "skin": True,
        "nose": True,
        "eye_g": True,
        "r_eye": True,
        "l_eye": True,
        "r_brow": True,
        "l_brow": True,
        "r_ear": False,
        "l_ear": False,
        "mouth": True,
        "u_lip": True,
        "l_lip": True,
        "hair": True,
        "hat": False,
        "ear_r": False,
        "neck_l": False,
        "neck": False,
        "cloth": False
    } 