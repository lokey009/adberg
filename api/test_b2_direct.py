#!/usr/bin/env python3
"""
Test script to directly check if a file exists in the B2 bucket using authenticated URLs
"""

import os
import sys
import traceback
import requests
from urllib.parse import urlparse
import time

# Import B2 configuration
from b2_config import get_b2_config

def get_authenticated_url(file_name, bucket_name=None, expires_in=3600):
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
            
            # Set up B2 API
            info = InMemoryAccountInfo()
            b2_api = B2Api(info)
            
            # Authorize account
            application_key_id = config["B2_ACCESS_KEY_ID"]
            application_key = config["B2_SECRET_ACCESS_KEY"]
            b2_api.authorize_account("production", application_key_id, application_key)
            
            # Get bucket
            bucket = b2_api.get_bucket_by_name(bucket_name)
            
            # Generate download URL with auth token
            # Check the method signature to see what parameters are available
            print(f"Generating authenticated URL for {file_name}...")
            
            # Try different method signatures based on b2sdk version
            try:
                # First try with get_download_authorization_by_file_name
                download_auth = b2_api.get_download_authorization(
                    bucket_id=bucket.id_,
                    file_name=file_name,
                    valid_duration_in_seconds=expires_in
                )
                
                # Construct the URL with the authorization token
                download_url = f"https://{b2_api.get_download_url()}/file/{bucket_name}/{file_name}?Authorization={download_auth}"
                print(f"Generated authenticated URL using download authorization (expires in {expires_in} seconds)")
                return download_url
                
            except Exception as auth_error:
                print(f"Error with download authorization: {str(auth_error)}")
                
                # Try with direct download URL
                try:
                    # Get file info first
                    file_info = bucket.get_file_info_by_name(file_name)
                    
                    # Get download URL
                    download_url = b2_api.get_download_url_by_id(
                        file_id=file_info.id_
                    )
                    
                    print(f"Generated direct download URL (no expiration)")
                    return download_url
                    
                except Exception as direct_error:
                    print(f"Error with direct download URL: {str(direct_error)}")
                    
                    # Last resort: try constructing URL manually
                    endpoint = config.get("B2_ENDPOINT", "s3.us-east-005.backblazeb2.com")
                    download_url = f"https://{endpoint}/{bucket_name}/{file_name}"
                    print(f"Generated manual URL (no authentication)")
                    return download_url
            
        except ImportError:
            print("Error: b2sdk not available")
            return None
            
        except Exception as b2_error:
            print(f"Error generating B2 download URL: {str(b2_error)}")
            traceback.print_exc()
            return None
    
    except Exception as e:
        print(f"Error in get_authenticated_url: {str(e)}")
        traceback.print_exc()
        return None

def check_file_exists(url):
    """Check if a file exists at the given URL using a HEAD request"""
    try:
        response = requests.head(url, timeout=10)
        if response.status_code == 200:
            print(f"File exists at {url}")
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            print(f"Content-Length: {response.headers.get('Content-Length', 'unknown')} bytes")
            return True
        else:
            print(f"File does not exist at {url} (status code: {response.status_code})")
            print(f"Response headers: {response.headers}")
            return False
    except Exception as e:
        print(f"Error checking URL: {str(e)}")
        return False

def list_bucket_files(bucket_name=None, max_files=10):
    """List files in the B2 bucket"""
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
                
                # Generate and test authenticated URL
                auth_url = get_authenticated_url(file_info.file_name, bucket_name)
                if auth_url:
                    print(f"   Authenticated URL: {auth_url}")
                    check_file_exists(auth_url)
                
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
        print(f"Error in list_bucket_files: {str(e)}")
        traceback.print_exc()
        return False

def verify_b2_config():
    """Verify B2 configuration"""
    try:
        # Get B2 config
        config = get_b2_config()
        
        # Check required fields
        required_fields = ["B2_ACCESS_KEY_ID", "B2_SECRET_ACCESS_KEY", "B2_IMAGE_BUCKET_NAME"]
        missing_fields = [field for field in required_fields if field not in config or not config[field]]
        
        if missing_fields:
            print(f"Error: Missing required B2 configuration fields: {', '.join(missing_fields)}")
            return False
        
        # Print masked config
        print("\nB2 Configuration:")
        print("=" * 60)
        masked_config = config.copy()
        if "B2_SECRET_ACCESS_KEY" in masked_config:
            masked_config["B2_SECRET_ACCESS_KEY"] = masked_config["B2_SECRET_ACCESS_KEY"][:5] + "..." + masked_config["B2_SECRET_ACCESS_KEY"][-3:]
        
        for key, value in masked_config.items():
            print(f"{key}: {value}")
        
        # Test connection
        print("\nTesting B2 connection:")
        print("=" * 60)
        
        try:
            from b2sdk.v2 import B2Api, InMemoryAccountInfo
            
            # Set up B2 API
            info = InMemoryAccountInfo()
            b2_api = B2Api(info)
            
            # Authorize account
            application_key_id = config["B2_ACCESS_KEY_ID"]
            application_key = config["B2_SECRET_ACCESS_KEY"]
            
            print("Authorizing with B2...")
            b2_api.authorize_account("production", application_key_id, application_key)
            print("Authorization successful!")
            
            # Get account ID
            account_id = b2_api.get_account_id()
            print(f"Account ID: {account_id}")
            
            # Check if bucket exists
            bucket_name = config["B2_IMAGE_BUCKET_NAME"]
            print(f"\nChecking bucket '{bucket_name}'...")
            
            bucket = b2_api.get_bucket_by_name(bucket_name)
            bucket_info = bucket.bucket_dict
            
            print(f"Bucket ID: {bucket_info['bucketId']}")
            print(f"Bucket Type: {bucket_info['bucketType']}")
            print(f"Bucket Info: {bucket_info}")
            
            # Check if bucket is public or private
            if bucket_info['bucketType'] == 'allPublic':
                print("\n⚠️ WARNING: Bucket is set to PUBLIC. Anyone can access files without authentication.")
                print("If this is not intended, change the bucket to PRIVATE in the B2 console.")
            else:
                print("\n✅ Bucket is PRIVATE. Files require authentication to access.")
                print("You must use authenticated URLs or the B2 browser UI to view files.")
            
            return True
            
        except ImportError:
            print("Error: b2sdk not available. Install with: pip install b2sdk")
            return False
            
        except Exception as b2_error:
            print(f"Error testing B2 connection: {str(b2_error)}")
            traceback.print_exc()
            return False
    
    except Exception as e:
        print(f"Error verifying B2 config: {str(e)}")
        traceback.print_exc()
        return False

def main():
    """Test B2 access and authenticated URLs"""
    print("Testing Backblaze B2 Access and Authentication")
    print("=" * 60)
    
    # Verify B2 configuration
    if not verify_b2_config():
        print("\n❌ B2 configuration verification failed.")
        return
    
    # List bucket files
    print("\n\nListing bucket files and testing authenticated URLs:")
    print("=" * 60)
    list_bucket_files()
    
    # Test with specific file if provided
    if len(sys.argv) > 1:
        file_name = sys.argv[1]
        print(f"\n\nTesting specific file: {file_name}")
        print("=" * 60)
        
        # Get authenticated URL
        auth_url = get_authenticated_url(file_name)
        if auth_url:
            check_file_exists(auth_url)

if __name__ == "__main__":
    main() 