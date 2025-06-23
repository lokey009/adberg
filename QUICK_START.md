# 🚀 Quick Start Reference

## Essential Commands (Copy & Paste Ready)

### Start Backend (Full-Featured)
```bash
# Option 1: Using startup script (Recommended)
./start_backend.sh

# Option 2: Manual start
cd api && source venv/bin/activate && python app_local.py
```

### Start Frontend
```bash
npm run dev
```

### Access Application
- **Frontend**: http://localhost:3000
- **Skin Studio**: http://localhost:3000/skin-studio
- **Backend API**: http://localhost:5001

---

## 🔧 Troubleshooting Commands

### Kill Backend Process
```bash
pkill -f "python.*app"
```

### Check What's Running
```bash
# Check backend
curl http://localhost:5001/

# Check frontend  
curl http://localhost:3000/

# Check processes
ps aux | grep python
```

### Test Upload
```bash
curl -X POST -F "file=@path/to/image.png" http://localhost:5001/skin-studio/upload
```

---

## 📁 Key Files
- `api/app_local.py` - **Main backend** (use this one)
- `api/app.py` - Deprecated simple backend
- `start_backend.sh` - Backend startup script
- `SETUP_GUIDE.md` - Complete documentation

---

## ⚡ Daily Workflow
1. **Terminal 1**: `./start_backend.sh`
2. **Terminal 2**: `npm run dev`  
3. **Browser**: `http://localhost:3000/skin-studio`
4. **Upload images** and watch automatic enhancement!

---

**✅ System Status**: app_local.py is now the default backend with full B2 integration and image enhancement capabilities. 