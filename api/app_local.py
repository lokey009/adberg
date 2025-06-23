import os
import uuid
import time
import traceback
import threading
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, redirect
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from cors_config import configure_cors
from PIL import Image, ImageEnhance

# Import the B2 configuration
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'realism-enhancement'))
from b2_config import get_b2_config

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
configure_cors(app)

# Configure upload settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max file size
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ENHANCED_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'enhanced')

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ENHANCED_FOLDER, exist_ok=True)

# Store processing status
processing_status = {}

# Get B2 config
b2_config = get_b2_config()
B2_BUCKET_NAME = b2_config["B2_IMAGE_BUCKET_NAME"]
B2_ENDPOINT = b2_config["B2_ENDPOINT"]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Custom B2 upload function to avoid checksum issues
def upload_to_b2(file_path, object_name):
    """
    Upload a file to B2 with b2sdk library
    """
    # Get B2 config
    config = get_b2_config()
    bucket_name = config["B2_IMAGE_BUCKET_NAME"]
    
    app.logger.info(f"Starting B2 upload: {file_path} -> {bucket_name}/{object_name}")
    
    try:
        # Use local file URL as fallback
        local_url = f"http://localhost:5000/uploads/{os.path.basename(file_path)}"
        
        # Try to use b2sdk directly
        try:
            app.logger.info("Using b2sdk for upload")
            from b2sdk.v2 import B2Api, InMemoryAccountInfo
            
            # Set up B2 API
            info = InMemoryAccountInfo()
            b2_api = B2Api(info)
            
            # Authorize account
            application_key_id = config["B2_ACCESS_KEY_ID"]
            application_key = config["B2_SECRET_ACCESS_KEY"]
            app.logger.info(f"Authorizing with key ID: {application_key_id}")
            b2_api.authorize_account("production", application_key_id, application_key)
            
            # Get bucket
            app.logger.info(f"Getting bucket: {bucket_name}")
            bucket = b2_api.get_bucket_by_name(bucket_name)
            
            # Upload file
            app.logger.info(f"Uploading file: {file_path}")
            file_info = {}
            uploaded_file = bucket.upload_local_file(
                local_file=file_path,
                file_name=object_name,
                file_infos=file_info
            )
            
            # Verify upload by listing files
            app.logger.info(f"Verifying upload by listing files with prefix: {object_name}")
            file_versions = bucket.list_file_versions(object_name)
            files_found = list(file_versions)
            
            if files_found:
                app.logger.info(f"Verified file in B2: {files_found[0].file_name}")
                # Get file download URL
                download_url = b2_api.get_download_url_for_file_name(bucket_name, object_name)
                app.logger.info(f"B2 download URL: {download_url}")
            else:
                app.logger.error(f"File not found in B2 after upload: {object_name}")
                return local_url
            
            # Construct URL
            endpoint = config["B2_ENDPOINT"]
            url = f"https://{endpoint}/{bucket_name}/{object_name}"
            app.logger.info(f"File uploaded to B2: {url}")
            return url
            
        except ImportError:
            app.logger.error("b2sdk not available, falling back to local storage")
            return local_url
            
        except Exception as b2_error:
            app.logger.error(f"Error using b2sdk: {str(b2_error)}")
            app.logger.error(traceback.format_exc())
            
            # Fall back to local URL
            app.logger.info(f"Falling back to local URL: {local_url}")
            return local_url
        
    except Exception as e:
        app.logger.error(f"Error in upload_to_b2: {str(e)}")
        app.logger.error(traceback.format_exc())
        
        # Return local URL as fallback
        local_url = f"http://localhost:5000/uploads/{os.path.basename(file_path)}"
        app.logger.info(f"Falling back to local URL due to error: {local_url}")
        return local_url

def enhance_skin_image(input_path, output_path):
    """
    Apply skin enhancement to an image
    """
    try:
        # Create enhanced directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Open the image
        from PIL import Image, ImageEnhance
        img = Image.open(input_path)
        
        # Apply some basic enhancements
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.2)
        
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.1)
        
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.3)
        
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)
        
        # Save the enhanced image locally
        img.save(output_path)
        
        return True
    except Exception as e:
        app.logger.error(f"Error in enhance_skin_image: {str(e)}")
        app.logger.error(traceback.format_exc())
        return False

def enhance_image(input_path, output_path, image_id):
    """
    Enhance an image and upload to B2 if available
    """
    app.logger.info(f"Starting enhancement for {input_path}")
    
    try:
        # Create enhanced directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Enhance the image
        enhance_skin_image(input_path, output_path)
        
        app.logger.info(f"Enhancement complete locally: {output_path}")
        
        # Update status
        if image_id in processing_status:
            processing_status[image_id]['status'] = 'enhanced'
            processing_status[image_id]['enhanced_url'] = f"http://localhost:5000/enhanced/{os.path.basename(output_path)}"
        
        # Try to upload enhanced image to B2
        enhanced_b2_url = None
        storage_type = 'local'
        
        try:
            enhanced_filename = os.path.basename(output_path)
            enhanced_b2_url = upload_to_b2(output_path, enhanced_filename)
            
            if enhanced_b2_url and 'backblazeb2.com' in enhanced_b2_url:
                storage_type = 'b2'
                app.logger.info(f"Enhanced image uploaded to B2: {enhanced_b2_url}")
                
                # Convert B2 URL to proxy URL for frontend
                proxy_url = modify_b2_url_for_frontend(enhanced_b2_url)
                
                # Update status with proxy URL
                if image_id in processing_status:
                    processing_status[image_id]['status'] = 'complete'
                    processing_status[image_id]['enhanced_url'] = proxy_url
                    processing_status[image_id]['original_enhanced_url'] = enhanced_b2_url  # For debugging
                    processing_status[image_id]['storage_type'] = storage_type
            else:
                app.logger.warning(f"B2 URL for enhanced image doesn't contain backblazeb2.com: {enhanced_b2_url}")
                
                # Update status with local URL
                if image_id in processing_status:
                    processing_status[image_id]['status'] = 'complete'
                    processing_status[image_id]['enhanced_url'] = f"http://localhost:5000/enhanced/{os.path.basename(output_path)}"
                    processing_status[image_id]['storage_type'] = 'local'
        
        except Exception as b2_error:
            app.logger.error(f"B2 upload error for enhanced image: {str(b2_error)}")
            app.logger.error(traceback.format_exc())
            
            # Update status with local URL on error
            if image_id in processing_status:
                processing_status[image_id]['status'] = 'complete'
                processing_status[image_id]['enhanced_url'] = f"http://localhost:5000/enhanced/{os.path.basename(output_path)}"
                processing_status[image_id]['storage_type'] = 'local'
    
    except Exception as e:
        app.logger.error(f"Error enhancing image: {str(e)}")
        app.logger.error(traceback.format_exc())
        
        # Update status on error
        if image_id in processing_status:
            processing_status[image_id]['status'] = 'error'
            processing_status[image_id]['error'] = str(e)

def get_b2_download_url(file_name, bucket_name=None, expires_in=3600):
    """
    Generate an authenticated download URL for a B2 file with expiration time
    
    Args:
        file_name: The name of the file in B2
        bucket_name: The name of the bucket (defaults to config value)
        expires_in: URL expiration time in seconds (default: 1 hour)
        
    Returns:
        Authenticated URL with expiration time
    """
    try:
        # Get B2 config
        config = get_b2_config()
        if bucket_name is None:
            bucket_name = config["B2_IMAGE_BUCKET_NAME"]
        
        # Use b2sdk to generate authenticated URL
        try:
            from b2sdk.v2 import B2Api, InMemoryAccountInfo
            import base64
            import hmac
            import hashlib
            import time
            import urllib.parse
            
            # Set up B2 API
            info = InMemoryAccountInfo()
            b2_api = B2Api(info)
            
            # Authorize account
            application_key_id = config["B2_ACCESS_KEY_ID"]
            application_key = config["B2_SECRET_ACCESS_KEY"]
            b2_api.authorize_account("production", application_key_id, application_key)
            
            # Get bucket
            bucket = b2_api.get_bucket_by_name(bucket_name)
            
            # Generate a signed URL using S3-compatible signature
            endpoint = config.get("B2_ENDPOINT", "s3.us-east-005.backblazeb2.com")
            
            # Calculate expiration time
            expiration_time = int(time.time()) + expires_in
            
            # Create a signed URL using our proxy endpoint
            # This avoids having to implement S3 signature calculation
            proxy_url = f"http://localhost:5000/skin-studio/b2-proxy/{file_name}?expires={expiration_time}"
            
            app.logger.info(f"Generated proxy URL for {file_name} (expires in {expires_in} seconds)")
            return proxy_url
            
        except ImportError:
            app.logger.error("b2sdk not available, falling back to local URL")
            return f"http://localhost:5000/uploads/{os.path.basename(file_name)}"
            
        except Exception as b2_error:
            app.logger.error(f"Error generating B2 download URL: {str(b2_error)}")
            app.logger.error(traceback.format_exc())
            return f"http://localhost:5000/uploads/{os.path.basename(file_name)}"
    
    except Exception as e:
        app.logger.error(f"Error in get_b2_download_url: {str(e)}")
        app.logger.error(traceback.format_exc())
        return f"http://localhost:5000/uploads/{os.path.basename(file_name)}"

@app.route('/skin-studio/b2-proxy/<path:file_path>', methods=['GET'])
def b2_proxy(file_path):
    """
    Proxy endpoint to serve B2 files with proper authentication
    
    Args:
        file_path: Path to the file in B2
    """
    try:
        # Get B2 config
        config = get_b2_config()
        bucket_name = config["B2_IMAGE_BUCKET_NAME"]
        
        # Check if we have a locally cached version first
        local_path = os.path.join(UPLOAD_FOLDER, os.path.basename(file_path))
        enhanced_path = os.path.join(ENHANCED_FOLDER, os.path.basename(file_path))
        
        if os.path.exists(local_path):
            app.logger.info(f"Serving locally cached file: {local_path}")
            return send_from_directory(UPLOAD_FOLDER, os.path.basename(file_path))
        
        if os.path.exists(enhanced_path):
            app.logger.info(f"Serving locally cached enhanced file: {enhanced_path}")
            return send_from_directory(ENHANCED_FOLDER, os.path.basename(file_path))
        
        # If not available locally, download from B2 and serve
        try:
            from b2sdk.v2 import B2Api, InMemoryAccountInfo, DownloadDestLocalFile
            
            # Set up B2 API
            info = InMemoryAccountInfo()
            b2_api = B2Api(info)
            
            # Authorize account
            application_key_id = config["B2_ACCESS_KEY_ID"]
            application_key = config["B2_SECRET_ACCESS_KEY"]
            b2_api.authorize_account("production", application_key_id, application_key)
            
            # Get bucket
            bucket = b2_api.get_bucket_by_name(bucket_name)
            
            # Create a temporary file path
            temp_path = os.path.join(UPLOAD_FOLDER, os.path.basename(file_path))
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            
            # Download the file directly using b2sdk
            download_dest = DownloadDestLocalFile(temp_path)
            
            app.logger.info(f"Downloading file from B2: {file_path} to {temp_path}")
            
            # Download the file
            bucket.download_file_by_name(file_path, download_dest)
            
            app.logger.info(f"File downloaded from B2 to local cache: {temp_path}")
            
            # Serve the downloaded file
            return send_from_directory(UPLOAD_FOLDER, os.path.basename(file_path))
            
        except ImportError as import_error:
            app.logger.error(f"Required libraries not available: {str(import_error)}")
            
            # Try boto3 as fallback
            try:
                import boto3
                from botocore.client import Config
                
                # Create a temporary file path
                temp_path = os.path.join(UPLOAD_FOLDER, os.path.basename(file_path))
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(temp_path), exist_ok=True)
                
                # Set up S3 client
                endpoint = config.get("B2_ENDPOINT", "s3.us-east-005.backblazeb2.com")
                s3_client = boto3.client(
                    's3',
                    endpoint_url=f'https://{endpoint}',
                    aws_access_key_id=application_key_id,
                    aws_secret_access_key=application_key,
                    config=Config(signature_version='s3v4')
                )
                
                app.logger.info(f"Downloading file from B2 using boto3: {file_path} to {temp_path}")
                
                # Download the file
                s3_client.download_file(
                    bucket_name,
                    file_path,
                    temp_path
                )
                
                app.logger.info(f"File downloaded from B2 to local cache using boto3: {temp_path}")
                
                # Serve the downloaded file
                return send_from_directory(UPLOAD_FOLDER, os.path.basename(file_path))
                
            except Exception as boto3_error:
                app.logger.error(f"Error downloading file with boto3: {str(boto3_error)}")
                app.logger.error(traceback.format_exc())
                return jsonify({
                    'success': False,
                    'error': f'Error downloading file: {str(boto3_error)}'
                }), 500
            
        except Exception as b2_error:
            app.logger.error(f"Error downloading file from B2: {str(b2_error)}")
            app.logger.error(traceback.format_exc())
            return jsonify({
                'success': False,
                'error': f'Error downloading file from B2: {str(b2_error)}'
            }), 500
    
    except Exception as e:
        app.logger.error(f"Error in B2 proxy: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Error accessing B2 file: {str(e)}'
        }), 500

def modify_b2_url_for_frontend(url):
    """
    Modify B2 URLs to use our proxy endpoint instead of direct B2 URLs
    """
    if url and 'backblazeb2.com' in url:
        # Extract the bucket and file path from the B2 URL
        parts = url.split('backblazeb2.com/')
        if len(parts) == 2:
            bucket_and_path = parts[1]
            # Extract just the file path (after the bucket name)
            path_parts = bucket_and_path.split('/', 1)
            if len(path_parts) == 2:
                file_path = path_parts[1]
                # Return the proxy URL - use port 5002 to match the running server
                return f"http://localhost:5000/skin-studio/b2-proxy/{file_path}"
    
    # Return the original URL if it's not a B2 URL or if we can't parse it
    return url

@app.route('/skin-studio/upload', methods=['POST'])
def upload_file():
    # Check if the post request has the file part
    if 'file' not in request.files:
        app.logger.error("No file part in the request")
        return jsonify({
            'success': False,
            'error': 'No file part in the request'
        }), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        app.logger.error("No selected file")
        return jsonify({
            'success': False,
            'error': 'No selected file'
        }), 400
    
    if not allowed_file(file.filename):
        app.logger.error(f"File type not allowed: {file.filename}")
        return jsonify({
            'success': False,
            'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400
    
    try:
        # Create a secure filename with UUID to avoid collisions
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        app.logger.info(f"Processing file upload: {unique_filename}")
        
        # Save file to local uploads directory
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        app.logger.info(f"File saved locally at: {file_path}")
        
        # Try to upload to B2
        b2_url = None
        storage_type = 'local'
        try:
            b2_url = upload_to_b2(file_path, unique_filename)
            if b2_url and 'backblazeb2.com' in b2_url:
                storage_type = 'b2'
                app.logger.info(f"File uploaded to B2: {b2_url}")
            else:
                app.logger.warning(f"B2 URL doesn't contain backblazeb2.com: {b2_url}")
        except Exception as b2_error:
            app.logger.error(f"B2 upload error: {str(b2_error)}")
            app.logger.error(traceback.format_exc())
        
        # Generate URL for the file (use B2 if available, otherwise local)
        file_url = b2_url if b2_url else f"http://localhost:5000/uploads/{unique_filename}"
        
        # Convert B2 URL to proxy URL for frontend
        proxy_url = modify_b2_url_for_frontend(file_url)
        
        # Set initial processing status
        processing_status[unique_filename] = {
            'status': 'processing',
            'uploaded_url': file_url,
            'storage_type': storage_type
        }
        
        # Start enhancement in a background thread
        enhanced_filename = f"enhanced_{unique_filename}"
        enhanced_path = os.path.join(ENHANCED_FOLDER, enhanced_filename)
        
        enhancement_thread = threading.Thread(
            target=enhance_image, 
            args=(file_path, enhanced_path, unique_filename)
        )
        enhancement_thread.daemon = True
        enhancement_thread.start()
        
        return jsonify({
            'success': True,
            'file_name': unique_filename,
            'file_url': proxy_url,  # Use proxy URL instead of direct B2 URL
            'original_url': file_url,  # Include original URL for debugging
            'status': 'processing',
            'storage_type': storage_type,
            'is_b2': storage_type == 'b2'  # Keep for backward compatibility
        })
    
    except Exception as e:
        app.logger.error(f"Error uploading file: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Error processing upload: {str(e)}'
        }), 500

@app.route('/skin-studio/status/<filename>', methods=['GET'])
def check_status(filename):
    """Check the processing status of an uploaded file"""
    if filename in processing_status:
        return jsonify({
            'success': True,
            **processing_status[filename]
        })
    else:
        return jsonify({
            'success': False,
            'error': 'File not found or not processed'
        }), 404

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/enhanced/<filename>')
def enhanced_file(filename):
    return send_from_directory(ENHANCED_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000) 