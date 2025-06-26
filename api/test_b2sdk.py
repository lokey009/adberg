#!/usr/bin/env python3
"""
Test script to check if B2 SDK is available
"""

print("Testing B2 SDK import...")

try:
    from b2sdk.v2 import B2Api, InMemoryAccountInfo
    print("✅ B2 SDK imported successfully!")
    print(f"B2Api: {B2Api}")
    print(f"InMemoryAccountInfo: {InMemoryAccountInfo}")
except ImportError as e:
    print(f"❌ B2 SDK import failed: {e}")
except Exception as e:
    print(f"❌ Other error: {e}")

print("\nTesting b2_config import...")
try:
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'realism-enhancement'))
    from b2_config import get_b2_config
    
    config = get_b2_config()
    print("✅ B2 config imported successfully!")
    print(f"Config keys: {list(config.keys())}")
except Exception as e:
    print(f"❌ B2 config import failed: {e}")
