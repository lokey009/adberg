#!/usr/bin/env python3
"""
Test script to verify B2 credentials and bucket access
"""

import os
import sys
import traceback
from pprint import pprint

# Add the realism-enhancement directory to the path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'realism-enhancement'))

# Import B2 configuration
from b2_config import get_b2_config

def main():
    """Test B2 credentials and bucket access"""
    print("Testing Backblaze B2 Access")
    print("---------------------------")
    
    # Get and display B2 configuration
    b2_config = get_b2_config()
    print("B2 Configuration:")
    # Print config with masked secret key
    masked_config = b2_config.copy()
    if "B2_SECRET_ACCESS_KEY" in masked_config:
        masked_config["B2_SECRET_ACCESS_KEY"] = masked_config["B2_SECRET_ACCESS_KEY"][:5] + "..." + masked_config["B2_SECRET_ACCESS_KEY"][-3:]
    pprint(masked_config)
    print()
    
    try:
        # Try using b2sdk directly
        try:
            from b2sdk.v2 import B2Api, InMemoryAccountInfo
            
            print("Using b2sdk to access B2")
            
            # Set up B2 API
            info = InMemoryAccountInfo()
            b2_api = B2Api(info)
            
            # Authorize account
            application_key_id = b2_config["B2_ACCESS_KEY_ID"]
            application_key = b2_config["B2_SECRET_ACCESS_KEY"]
            print(f"Authorizing with key ID: {application_key_id}")
            b2_api.authorize_account("production", application_key_id, application_key)
            
            # Get account ID
            account_id = b2_api.get_account_id()
            print(f"Account ID: {account_id}")
            
            # List buckets
            print("\nListing buckets:")
            buckets = b2_api.list_buckets()
            for bucket in buckets:
                print(f"- {bucket.name} (ID: {bucket.id_})")
            
            # Get bucket
            bucket_name = b2_config["B2_IMAGE_BUCKET_NAME"]
            print(f"\nGetting bucket: {bucket_name}")
            bucket = b2_api.get_bucket_by_name(bucket_name)
            
            # List files in bucket (with empty string to list all files)
            print(f"\nListing files in bucket {bucket_name}:")
            file_versions = bucket.list_file_versions(file_name="", max_entries=100)
            files = list(file_versions)
            
            if files:
                print(f"Found {len(files)} files:")
                for i, file_version in enumerate(files[:10]):  # Show first 10 files
                    print(f"- {file_version.file_name} ({file_version.size} bytes)")
                
                if len(files) > 10:
                    print(f"... and {len(files) - 10} more")
                    
                # Get download URL for the first file
                first_file = files[0].file_name
                download_url = b2_api.get_download_url_for_file_name(bucket_name, first_file)
                print(f"\nDownload URL for {first_file}: {download_url}")
            else:
                print("No files found in bucket")
            
        except ImportError:
            print("b2sdk not available, please install it with 'pip install b2sdk'")
            
        except Exception as b2_error:
            print(f"Error using b2sdk: {str(b2_error)}")
            traceback.print_exc()
    
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    main() 