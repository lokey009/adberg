import os
from typing import Dict, Optional
import boto3
from botocore.client import Config

# Disable boto3 automatic checksums for B2 compatibility
os.environ['AWS_S3_DISABLE_MULTIPART_CHECKSUMS'] = '1'

def get_b2_config() -> Dict[str, str]:
    """
    Returns a dictionary with B2 configuration loaded from hardcoded values.
    """
    return {
        "B2_ACCESS_KEY_ID": "005f4d8d41e8f820000000006",
        "B2_SECRET_ACCESS_KEY": "K005DxzrqL8fABsGzLNsKVQEn+p8TfM",
        "B2_ENDPOINT": "s3.us-east-005.backblazeb2.com",
        "B2_IMAGE_BUCKET_NAME": "shortshive",
        "B2_IMAGE_BUCKET_ID": "7f34cd981dd4016e986f0812",
        "VITE_B2_IMAGE_BUCKET_NAME": "shortshive",
        "VITE_B2_IMAGE_BUCKET_ID": "7f34cd981dd4016e986f0812",
    }


def get_b2_s3_client():
    """
    Returns a boto3 S3 client configured for Backblaze B2, or raises ImportError if boto3 is not installed.
    """
    config = get_b2_config()

    # Create a minimal configuration for maximum B2 compatibility
    client_config = Config(
        signature_version='s3v4',
        s3={
            'addressing_style': 'path',
            'payload_signing_enabled': False,
            'use_accelerate_endpoint': False,
            'use_dualstack_endpoint': False
        },
        parameter_validation=False,
        retries={'max_attempts': 3}
    )

    # Set environment variable to disable checksums
    os.environ['AWS_S3_DISABLE_MULTIPART_CHECKSUMS'] = '1'
    
    return boto3.client(
        's3',
        endpoint_url=f'https://{config["B2_ENDPOINT"]}',
        aws_access_key_id=config["B2_ACCESS_KEY_ID"],
        aws_secret_access_key=config["B2_SECRET_ACCESS_KEY"],
        config=client_config,
        region_name='us-east-005',  # Match the endpoint region
    )


def upload_file_to_b2(file_path: str, object_name: Optional[str] = None) -> str:
    """
    Uploads a file to the configured B2 bucket.

    Args:
        file_path (str): Local path to the file to upload.
        object_name (Optional[str]): S3 object name. If not specified, file name is used.

    Returns:
        str: The URL of the uploaded object.
    """
    config = get_b2_config()
    bucket_name = config["B2_IMAGE_BUCKET_NAME"]
    if object_name is None:
        object_name = os.path.basename(file_path)
    s3_client = get_b2_s3_client()
    
    # Use put_object instead of upload_file to avoid checksum headers
    with open(file_path, 'rb') as file_data:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=object_name,
            Body=file_data
        )
    
    # Construct the object URL
    endpoint = config["B2_ENDPOINT"]
    url = f"https://{endpoint}/{bucket_name}/{object_name}"
    return url


def download_file_from_b2(object_name: str, destination_path: str) -> None:
    """
    Downloads a file from the configured B2 bucket to a local path.

    Args:
        object_name (str): S3 object name (key) in the bucket.
        destination_path (str): Local path to save the downloaded file.
    """
    config = get_b2_config()
    bucket_name = config["B2_IMAGE_BUCKET_NAME"]
    s3_client = get_b2_s3_client()

    # Use get_object method for better B2 compatibility (completely avoids transfer manager)
    try:
        print(f"Downloading {object_name} from B2 bucket {bucket_name}")

        # Use get_object with minimal parameters to avoid checksum headers
        response = s3_client.get_object(
            Bucket=bucket_name,
            Key=object_name
            # Explicitly avoid any checksum-related parameters
        )

        # Ensure destination directory exists
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)

        # Stream the content to avoid memory issues with large files
        with open(destination_path, 'wb') as f:
            for chunk in response['Body'].iter_chunks(chunk_size=8192):
                f.write(chunk)

        print(f"Successfully downloaded {object_name} to {destination_path}")

    except Exception as e:
        print(f"Primary download method failed: {e}")

        # Try with a completely new client instance with even more restrictive config
        try:
            print("Trying with ultra-minimal B2 client configuration...")

            # Create ultra-minimal client
            minimal_client = boto3.client(
                's3',
                endpoint_url=f'https://{config["B2_ENDPOINT"]}',
                aws_access_key_id=config["B2_ACCESS_KEY_ID"],
                aws_secret_access_key=config["B2_SECRET_ACCESS_KEY"],
                region_name='us-east-005',
                config=Config(
                    signature_version='s3v4',
                    s3={'addressing_style': 'path'},
                    parameter_validation=False
                )
            )

            response = minimal_client.get_object(Bucket=bucket_name, Key=object_name)
            with open(destination_path, 'wb') as f:
                f.write(response['Body'].read())

            print(f"Successfully downloaded {object_name} using minimal client")

        except Exception as e2:
            print(f"All download methods failed: {e2}")
            raise e2 