#!/usr/bin/env python3
"""
Test script for the upload API
"""

import os
import sys
import requests
import json
from pprint import pprint
from PIL import Image, ImageDraw

def create_test_image(path, size=(100, 100), color=(255, 0, 0)):
    """Create a simple test image"""
    img = Image.new('RGB', size, color=color)
    draw = ImageDraw.Draw(img)
    draw.rectangle([(25, 25), (75, 75)], fill=(0, 0, 255))
    img.save(path)
    return path

def main():
    """Test the upload API"""
    print("Testing Upload API")
    print("------------------")
    
    # API URL
    api_url = "http://localhost:5002/skin-studio/upload"
    
    # Create a test image
    test_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_image.jpg')
    create_test_image(test_file_path)
    
    print(f"Created test image: {test_file_path}")
    
    # Test upload
    try:
        print(f"Uploading to {api_url}...")
        
        files = {'file': ('test_image.jpg', open(test_file_path, 'rb'), 'image/jpeg')}
        
        response = requests.post(api_url, files=files)
        
        print(f"Response status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response data:")
            pprint(data)
            
            if data.get('success'):
                print(f"\nFile URL: {data.get('file_url')}")
                print(f"Is B2: {data.get('is_b2')}")
                
                # Check status
                if data.get('file_name'):
                    status_url = f"http://localhost:5002/skin-studio/status/{data.get('file_name')}"
                    print(f"\nChecking status at: {status_url}")
                    
                    # Wait a bit for processing
                    import time
                    time.sleep(5)
                    
                    status_response = requests.get(status_url)
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        print("Status data:")
                        pprint(status_data)
                    else:
                        print(f"Failed to get status: {status_response.status_code}")
                        print(status_response.text)
            else:
                print(f"Upload failed: {data.get('error')}")
        else:
            print(f"Request failed with status code: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error: {str(e)}")
    
    # Clean up
    try:
        os.remove(test_file_path)
        print(f"Removed test file: {test_file_path}")
    except Exception as e:
        print(f"Error removing test file: {str(e)}")

if __name__ == "__main__":
    main() 