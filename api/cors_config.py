from flask_cors import CORS

def configure_cors(app):
    """
    Configure CORS for the Flask application to allow cross-origin requests from the frontend.
    
    Args:
        app: Flask application instance
    """
    # Allow all origins temporarily for debugging
    CORS(app, resources={
        r"/skin-studio/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }) 