#!/usr/bin/env python3
"""
Test script for Backblaze B2 configuration
"""

import os
import sys
import uuid
from pprint import pprint

# Add the realism-enhancement directory to the path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'realism-enhancement'))

# Import B2 configuration
from b2_config import get_b2_config

# Import the custom upload function from app_local.py
from app_local import upload_to_b2

def main():
    """Test B2 configuration and upload functionality"""
    print("Testing Backblaze B2 Configuration")
    print("---------------------------------")
    
    # Get and display B2 configuration
    b2_config = get_b2_config()
    print("B2 Configuration:")
    # Print config with masked secret key
    masked_config = b2_config.copy()
    if "B2_SECRET_ACCESS_KEY" in masked_config:
        masked_config["B2_SECRET_ACCESS_KEY"] = masked_config["B2_SECRET_ACCESS_KEY"][:5] + "..." + masked_config["B2_SECRET_ACCESS_KEY"][-3:]
    pprint(masked_config)
    print()
    
    # Create a test file
    test_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_upload.txt')
    with open(test_file_path, 'w') as f:
        f.write(f"B2 test file - {uuid.uuid4()}")
    
    print(f"Created test file: {test_file_path}")
    
    # Test upload
    try:
        print("Attempting to upload test file to B2...")
        object_name = f"test_{uuid.uuid4().hex}.txt"
        url = upload_to_b2(test_file_path, object_name)
        print(f"Upload successful! URL: {url}")
    except Exception as e:
        print(f"Upload failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Clean up
    try:
        os.remove(test_file_path)
        print(f"Removed test file: {test_file_path}")
    except Exception as e:
        print(f"Error removing test file: {str(e)}")

if __name__ == "__main__":
    main() 