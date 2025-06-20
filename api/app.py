import os
import tempfile
import uuid
import traceback
from pathlib import Path
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from b2_config import upload_file_to_b2
from cors_config import configure_cors

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
configure_cors(app)

# Configure upload settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        
        # Save the file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
            
            app.logger.info(f"File saved temporarily at: {temp_path}")
        
        try:
            # Upload to B2
            app.logger.info("Attempting to upload to B2...")
            file_url = upload_file_to_b2(temp_path, unique_filename)
            app.logger.info(f"File uploaded to B2: {file_url}")
            
            # Clean up the temporary file
            os.unlink(temp_path)
            
            return jsonify({
                'success': True,
                'file_name': unique_filename,
                'file_url': file_url
            })
        except Exception as b2_error:
            app.logger.error(f"B2 upload error: {str(b2_error)}")
            app.logger.error(traceback.format_exc())
            
            # Clean up the temporary file
            os.unlink(temp_path)
            
            return jsonify({
                'success': False,
                'error': f'Error uploading to cloud storage: {str(b2_error)}'
            }), 500
    
    except Exception as e:
        app.logger.error(f"General error uploading file: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Error processing upload: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True) 