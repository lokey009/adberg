# DEPRECATED: Use app_local.py instead
# This file is kept for reference only

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def deprecated_notice():
    return jsonify({
        'message': '⚠️  DEPRECATED: This simple backend is no longer used',
        'status': 'deprecated',
        'recommendation': 'Please use app_local.py for full features',
        'instructions': [
            'Stop this server (Ctrl+C)',
            'Run: python app_local.py',
            'Or use: ./start_backend.sh from project root'
        ],
        'app_local_features': [
            'Image upload to B2 cloud storage',
            'Automatic image enhancement',
            'Real-time status updates',
            'Secure B2 proxy serving',
            'Local storage fallback'
        ],
        'note': 'app_local.py runs on port 5001 with all features enabled'
    })

@app.route('/skin-studio/upload', methods=['POST'])
def deprecated_upload():
    return jsonify({
        'error': 'This endpoint is deprecated',
        'message': 'Please use app_local.py instead',
        'success': False,
        'redirect_to': 'http://localhost:5001/skin-studio/upload'
    }), 410  # 410 Gone

if __name__ == '__main__':
    print("=" * 60)
    print("⚠️  WARNING: This is the DEPRECATED simple backend")
    print("=" * 60)
    print("🔥 Please use app_local.py for full features:")
    print("   - B2 cloud storage")
    print("   - Image enhancement")
    print("   - Real-time status updates")
    print("   - Secure file serving")
    print("")
    print("🚀 To start the full backend:")
    print("   python app_local.py")
    print("   OR")
    print("   ./start_backend.sh (from project root)")
    print("=" * 60)
    print("")
    
    app.run(debug=True, port=5001) 