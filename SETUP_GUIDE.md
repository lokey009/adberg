# Skin Studio Setup Guide

## 🚀 Complete Setup Instructions

This guide covers how to run the **full-featured** Skin Studio application with B2 cloud storage integration.

---

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **Backblaze B2 account** (for cloud storage)

---

## 🔧 Initial Setup (One-time only)

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd /Users/loki/Documents/GitHub/adberg

# Install frontend dependencies
npm install

# Set up Python virtual environment
cd api
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies with specific versions (B2 compatible)
pip install Flask==2.3.3
pip install boto3==1.26.137
pip install botocore==1.29.137
pip install b2sdk==1.19.0
pip install Pillow==10.0.1
pip install flask-cors==4.0.0
pip install python-dotenv==1.0.0
```

### 2. Verify B2 Configuration

The backend is pre-configured with B2 credentials in `api/app_local.py`:
- **Bucket**: `shortshive`
- **Endpoint**: `s3.us-east-005.backblazeb2.com`
- **Region**: `us-east-005`

---

## 🏃‍♂️ Daily Usage - Step by Step

### Step 1: Start the Backend Server (app_local.py)

```bash
# From the main project directory
cd /Users/loki/Documents/GitHub/adberg

# Navigate to API directory and activate virtual environment
cd api && source venv/bin/activate

# Start the full-featured backend server
python app_local.py
```

**Expected Output:**
```
 * Serving Flask app 'app_local'
 * Debug mode: on
 * Running on http://127.0.0.1:5001
 * Press CTRL+C to quit
```

**✅ Backend Features Available:**
- Image upload to B2 cloud storage
- Automatic image enhancement (contrast, brightness, color, sharpness)
- Status checking with real-time updates
- B2 proxy for secure file serving
- Local file fallback if B2 fails

### Step 2: Start the Frontend Server

```bash
# Open a NEW terminal window/tab
cd /Users/loki/Documents/GitHub/adberg

# Start the Next.js frontend
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.3s
```

### Step 3: Access the Application

1. **Open your browser** and go to: `http://localhost:3000`
2. **Navigate to Skin Studio**: Click on "Skin Studio" or go to `http://localhost:3000/skin-studio`

---

## 📸 Image Upload Process

### How to Upload Images:

1. **Go to Skin Studio page** (`http://localhost:3000/skin-studio`)
2. **Click "Upload Image"** or drag & drop files
3. **Select image files** (PNG, JPG, JPEG, GIF, WEBP - max 10MB)
4. **Watch the upload process**:
   - File uploads to B2 cloud storage
   - Automatic enhancement processing begins
   - Status updates in real-time

### What Happens Behind the Scenes:

1. **Upload to B2**: Original image uploaded to `shortshive` bucket
2. **Enhancement Processing**: 
   - Contrast enhancement (1.2x)
   - Brightness boost (1.1x)
   - Color saturation (1.3x)
   - Sharpness increase (1.5x)
3. **Enhanced Upload**: Enhanced version uploaded to B2
4. **Status Updates**: Real-time processing status
5. **Secure Serving**: Images served through backend proxy

---

## 🔍 API Endpoints

### Backend Server (http://localhost:5001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and status |
| `/skin-studio/upload` | POST | Upload images (returns processing status) |
| `/skin-studio/status/<filename>` | GET | Check enhancement status |
| `/skin-studio/b2-proxy/<path>` | GET | Secure B2 file proxy |
| `/uploads/<filename>` | GET | Serve local files |
| `/enhanced/<filename>` | GET | Serve enhanced files |

### Example Upload Response:
```json
{
  "success": true,
  "file_name": "unique_id_filename.png",
  "file_url": "http://localhost:5001/skin-studio/b2-proxy/unique_id_filename.png",
  "original_url": "https://s3.us-east-005.backblazeb2.com/shortshive/unique_id_filename.png",
  "status": "processing",
  "storage_type": "b2",
  "is_b2": true
}
```

### Example Status Response:
```json
{
  "success": true,
  "status": "complete",
  "uploaded_url": "https://s3.us-east-005.backblazeb2.com/shortshive/original.png",
  "enhanced_url": "http://localhost:5001/skin-studio/b2-proxy/enhanced_original.png",
  "original_enhanced_url": "https://s3.us-east-005.backblazeb2.com/shortshive/enhanced_original.png",
  "storage_type": "b2"
}
```

---

## 🛠️ Troubleshooting

### Common Issues:

#### 1. Port 5001 Already in Use
```bash
# Kill any existing processes
pkill -f "python.*app"
# Wait 2 seconds and restart
cd api && source venv/bin/activate && python app_local.py
```

#### 2. Virtual Environment Not Found
```bash
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # if you create one
```

#### 3. B2 Upload Failures
- Check internet connection
- Verify B2 credentials in `app_local.py`
- Check B2 bucket permissions

#### 4. Frontend Not Connecting to Backend
- Ensure backend is running on port 5001
- Check frontend API_URL in `src/components/skin-logic/UploadPanel.tsx`
- Verify CORS settings

### Checking System Status:

```bash
# Check if backend is running
curl http://localhost:5001/

# Check if frontend is running
curl http://localhost:3000/

# Test upload endpoint
curl -X POST -F "file=" http://localhost:5001/skin-studio/upload
```

---

## 📁 File Structure

```
adberg/
├── api/
│   ├── venv/                 # Python virtual environment
│   ├── app_local.py         # Full-featured backend (USE THIS)
│   ├── app.py              # Simple backend (deprecated)
│   ├── uploads/            # Local file storage
│   └── enhanced/           # Enhanced images
├── src/
│   ├── components/
│   │   └── skin-logic/
│   │       └── UploadPanel.tsx  # Main upload component
│   └── pages/
│       └── skin-studio/
│           └── page.tsx     # Skin studio page
└── SETUP_GUIDE.md          # This file
```

---

## 🎯 Quick Start Commands

### Terminal 1 (Backend):
```bash
cd /Users/loki/Documents/GitHub/adberg/api && source venv/bin/activate && python app_local.py
```

### Terminal 2 (Frontend):
```bash
cd /Users/loki/Documents/GitHub/adberg && npm run dev
```

### Browser:
```
http://localhost:3000/skin-studio
```

---

## ⚡ Features Summary

- ✅ **Full B2 Integration**: Direct upload to Backblaze B2
- ✅ **Image Enhancement**: Automatic processing with PIL
- ✅ **Real-time Status**: Live updates during processing
- ✅ **Secure Proxy**: Backend-proxied file serving
- ✅ **Local Fallback**: Works even if B2 fails
- ✅ **Multiple Formats**: PNG, JPG, JPEG, GIF, WEBP
- ✅ **Large Files**: Up to 10MB supported
- ✅ **Unique Naming**: Prevents filename conflicts
- ✅ **Error Handling**: Comprehensive error management

---

## 🔒 Security Notes

- B2 credentials are hardcoded for development
- Files are served through backend proxy (not direct B2 links)
- CORS is configured for localhost development
- File type validation prevents malicious uploads

---

**🎉 You're all set! The system is now ready for daily use with full B2 cloud storage and image enhancement capabilities.** 