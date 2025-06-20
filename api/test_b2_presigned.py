#!/usr/bin/env python3
"""
Test script to generate presigned URLs for B2 files using boto3
"""

import os
import sys
import traceback
import requests
import time

# Import B2 configuration
from b2_config import get_b2_config

def generate_presigned_url(file_name, bucket_name=None, expires_in=3600):
    """
    Generate a presigned URL for a B2 file using boto3
    
    Args:
        file_name: The name of the file in B2
        bucket_name: The name of the bucket (defaults to config value)
        expires_in: URL expiration time in seconds (default: 1 hour)
        
    Returns:
        Presigned URL with expiration time
    """
    try:
        # Get B2 config
        config = get_b2_config()
        if bucket_name is None:
            bucket_name = config["B2_IMAGE_BUCKET_NAME"]
        
        # Use boto3 to generate presigned URL
        try:
            import boto3
            from botocore.client import Config
            
            # Get endpoint from config
            endpoint = config.get("B2_ENDPOINT", "s3.us-east-005.backblazeb2.com")
            
            # Set up S3 client
            s3_client = boto3.client(
                's3',
                endpoint_url=f'https://{endpoint}',
                aws_access_key_id=config["B2_ACCESS_KEY_ID"],
                aws_secret_access_key=config["B2_SECRET_ACCESS_KEY"],
                config=Config(signature_version='s3v4')
            )
            
            # Generate a pre-signed URL
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': file_name
                },
                ExpiresIn=expires_in
            )
            
            print(f"Generated presigned URL for {file_name} (expires in {expires_in} seconds)")
            print(f"URL: {presigned_url}")
            return presigned_url
            
        except ImportError:
            print("Error: boto3 not available. Install with: pip install boto3")
            return None
            
        except Exception as boto3_error:
            print(f"Error generating presigned URL: {str(boto3_error)}")
            traceback.print_exc()
            return None
    
    except Exception as e:
        print(f"Error in generate_presigned_url: {str(e)}")
        traceback.print_exc()
        return None

def check_url(url):
    """Check if a URL is accessible"""
    try:
        response = requests.head(url, timeout=10)
        if response.status_code == 200:
            print(f"✅ URL is accessible: {url}")
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            print(f"Content-Length: {response.headers.get('Content-Length', 'unknown')} bytes")
            return True
        else:
            print(f"❌ URL is not accessible: {url} (status code: {response.status_code})")
            print(f"Response headers: {response.headers}")
            return False
    except Exception as e:
        print(f"Error checking URL: {str(e)}")
        return False

def list_and_test_files(bucket_name=None, max_files=5):
    """List files in the B2 bucket and test presigned URLs"""
    try:
        # Get B2 config
        config = get_b2_config()
        if bucket_name is None:
            bucket_name = config["B2_IMAGE_BUCKET_NAME"]
        
        # Use b2sdk to list files
        try:
            from b2sdk.v2 import B2Api, InMemoryAccountInfo
            
            # Set up B2 API
            info = InMemoryAccountInfo()
            b2_api = B2Api(info)
            
            # Authorize account
            application_key_id = config["B2_ACCESS_KEY_ID"]
            application_key = config["B2_SECRET_ACCESS_KEY"]
            b2_api.authorize_account("production", application_key_id, application_key)
            
            # Get bucket
            bucket = b2_api.get_bucket_by_name(bucket_name)
            
            # List files
            print(f"\nListing files in bucket '{bucket_name}':")
            print("=" * 60)
            
            file_count = 0
            for file_info, _ in bucket.ls(recursive=True, latest_only=True):
                file_count += 1
                if file_count > max_files:
                    print(f"... and more files (limited to {max_files})")
                    break
                
                print(f"{file_count}. {file_info.file_name} ({file_info.size} bytes)")
                
                # Generate and test presigned URL
                presigned_url = generate_presigned_url(file_info.file_name, bucket_name)
                if presigned_url:
                    check_url(presigned_url)
                
                print()
            
            if file_count == 0:
                print("No files found in bucket.")
            
            return True
            
        except ImportError:
            print("Error: b2sdk not available")
            return False
            
        except Exception as b2_error:
            print(f"Error listing B2 files: {str(b2_error)}")
            traceback.print_exc()
            return False
    
    except Exception as e:
        print(f"Error in list_and_test_files: {str(e)}")
        traceback.print_exc()
        return False

def main():
    """Test presigned URL generation for B2 files"""
    print("Testing Presigned URL Generation for B2 Files")
    print("=" * 60)
    
    # Print B2 configuration
    config = get_b2_config()
    print("\nB2 Configuration:")
    masked_config = config.copy()
    if "B2_SECRET_ACCESS_KEY" in masked_config:
        masked_config["B2_SECRET_ACCESS_KEY"] = masked_config["B2_SECRET_ACCESS_KEY"][:5] + "..." + masked_config["B2_SECRET_ACCESS_KEY"][-3:]
    
    for key, value in masked_config.items():
        print(f"{key}: {value}")
    
    # List and test files
    list_and_test_files()
    
    # Test with specific file if provided
    if len(sys.argv) > 1:
        file_name = sys.argv[1]
        print(f"\n\nTesting specific file: {file_name}")
        print("=" * 60)
        
        # Generate presigned URL
        presigned_url = generate_presigned_url(file_name)
        if presigned_url:
            check_url(presigned_url)

if __name__ == "__main__":
    main() 