# Skin Studio Upload API

This is a Flask API that handles file uploads for the Skin Studio feature. It integrates with Backblaze B2 for cloud storage using the configuration from the `realism-enhancement` repository.

## Setup

1. Create a virtual environment and activate it:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install the required packages:

```bash
pip install -r requirements.txt
```

3. Copy the example environment file and configure it (if needed):

```bash
cp .env.example .env
```

Note: The B2 configuration is already provided in the `b2_config.py` file imported from the `realism-enhancement` repository.

## Running the API

To run the API in development mode:

```bash
flask run --port 5000
```

For production, use a WSGI server like Gunicorn:

```bash
gunicorn wsgi:app
```

## API Endpoints

### Upload Image

**URL**: `/skin-studio/upload`
**Method**: `POST`
**Content-Type**: `multipart/form-data`

**Request Body**:
- `file`: The image file to upload (required)

**Response**:
```json
{
  "success": true,
  "file_name": "<uploaded_filename>",
  "file_url": "<public or signed URL>"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "<error message>"
}
```

## Integration with React Frontend

To call this API from your React frontend, use the `/skin-studio/upload` endpoint with a `multipart/form-data` request. 