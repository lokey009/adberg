#!/usr/bin/env python3
"""
Test script to manually test the enhancement API endpoint
"""
import requests
import json

# Test data
test_data = {
    "image_id": "1014_mark.jpg",
    "original_image_url": "http://localhost:5001/uploads/1014_mark.jpg",
    "face_parsing_config": {
        "skin": True,
        "eye_general": True,
        "left_eye": True,
        "right_eye": True,
        "left_brow": True,
        "right_brow": True,
        "hair": True,
        "left_ear": True,
        "right_ear": True,
        "neck": True,
        "neck_line": True,
        "clothing": True,
        "background": True
    }
}

def test_enhancement_endpoint():
    """Test the enhancement endpoint"""
    url = "http://localhost:5001/skin-studio/enhance"
    
    print("🧪 Testing Enhancement API Endpoint")
    print("=" * 50)
    print(f"URL: {url}")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    print()
    
    try:
        response = requests.post(url, json=test_data, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"Response: {json.dumps(result, indent=2)}")
            
            if result.get('success') and result.get('job_id'):
                job_id = result['job_id']
                print(f"\n🔍 Testing status check for job: {job_id}")
                
                # Test status endpoint
                status_url = f"http://localhost:5001/skin-studio/enhance/status/{job_id}"
                status_response = requests.get(status_url)
                print(f"Status Response: {json.dumps(status_response.json(), indent=2)}")
                
        else:
            print("❌ FAILED!")
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    test_enhancement_endpoint()
