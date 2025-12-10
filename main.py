import os
import sys
import uuid
import asyncio
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


import os
import shutil
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

# ---------------------------------------------
# IMPORT YOUR HTML GENERATOR
# ---------------------------------------------
from src.p01_dummy_pages_generator.Dummy_web_creator import generate_all_pages

# ---------------------------------------------
# IMPORT THE SNAPSHOT PROCESSOR (Playwright)
# ---------------------------------------------
from src.p02_screenshoter.Screenhoter import run_snapshot_processing

# -------------------------------------------------------
# IMPORT VIDEO COMPILER
# -------------------------------------------------------
from src.p03_video_creator.Video_creator import compile_snapshots_to_video

# ======================================================
# FASTAPI APP
# ======================================================
app = FastAPI(title="Multi-User Dummy Generator API")

# Get absolute path to app directory
BASE_DIR = Path(__file__).parent  # This gets D:\19_SAAS\01_build\app

# Mount static files
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "storage")), name="static")
print(f"📂 Static files mounted: /static → {BASE_DIR / 'storage'}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Next.js dev server
        "http://127.0.0.1:3000",      # Alternative localhost
        "http://localhost:8000",       # FastAPI itself
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================================
# REQUEST MODEL (UPDATED)
# ======================================================
class GenerateRequest(BaseModel):
    keyword: str
    num_pages: int = 10
    duration_per_snapshot: float = 0.2
    use_varied_fonts: bool = True  # NEW: Font variety toggle

# ======================================================
# CRONJOB DELETE USER FOLDERS OLDER THAN 24 HOURS
# ======================================================

def cleanup_old_users():
    """Delete user folders older than 24 hours"""
    storage_path = Path("storage/users")
    
    if not storage_path.exists():
        return
    
    cutoff_time = datetime.now() - timedelta(hours=24)
    print(f"🧹 Running cleanup, deleting folders older than {cutoff_time}")
    
    deleted_count = 0
    for user_folder in storage_path.iterdir():
        if user_folder.is_dir():
            try:
                # Get folder creation/modification time
                folder_time = datetime.fromtimestamp(user_folder.stat().st_mtime)
                
                if folder_time < cutoff_time:
                    # Delete the entire user folder
                    shutil.rmtree(user_folder, ignore_errors=True)
                    print(f"🗑️ Deleted old folder: {user_folder.name}")
                    deleted_count += 1
            except Exception as e:
                print(f"⚠️ Could not delete {user_folder.name}: {e}")
    
    print(f"✅ Cleanup complete. Deleted {deleted_count} old folders")

# Start scheduler when FastAPI starts
@app.on_event("startup")
def startup_event():
    scheduler = BackgroundScheduler()
    
    # Run every 6 hours
    scheduler.add_job(
        cleanup_old_users,
        trigger=IntervalTrigger(hours=6),
        id="cleanup_job",
        name="Cleanup old user folders",
        replace_existing=True
    )
    
    scheduler.start()
    print("⏰ Cleanup scheduler started (runs every 6 hours)")
    
    # Also run immediately on startup
    cleanup_old_users()

@app.on_event("shutdown")
def shutdown_event():
    print("🛑 Shutting down cleanup scheduler")


# ======================================================
# DEBUG & HEALTH ENDPOINTS
# ======================================================
@app.get("/")
def root():
    return {
        "message": "Dummy Pages Generator API",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "documentation": "/docs",
        "endpoints": {
            "generate": "/generate (POST)",
            "health": "/health",
            "test": "/test-connection",
            "env": "/env (debug)"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "Dummy Generator API",
        "timestamp": datetime.now().isoformat(),
        "python_version": sys.version.split()[0],
        "working_directory": os.getcwd()
    }

@app.get("/test-connection")
def test_connection():
    return {
        "message": "Backend is working!",
        "timestamp": datetime.now().isoformat(),
        "frontend_url": "http://localhost:3000"
    }

@app.get("/env")
def show_environment():
    """Debug endpoint to check environment"""
    template_path = Path("src/p01_dummy_pages_generator/01_Text_base_tail_templates.txt")
    css_path = Path("src/p01_dummy_pages_generator/templates/01_medium_headline.css")
    images_path = Path("src/p01_dummy_pages_generator/unsplash_images")
    
    return {
        "python": {
            "version": sys.version,
            "executable": sys.executable
        },
        "paths": {
            "current": os.getcwd(),
            "storage": str(Path("storage").absolute()),
            "src": str(Path("src").absolute())
        },
        "files": {
            "storage_exists": os.path.exists("storage"),
            "src_exists": os.path.exists("src"),
            "template_exists": template_path.exists(),
            "template_content": template_path.read_text()[:100] + "..." if template_path.exists() else "NOT FOUND",
            "css_exists": css_path.exists(),
            "images_exist": images_path.exists(),
            "image_count": len(list(images_path.glob("*.jpg"))) + len(list(images_path.glob("*.png"))) if images_path.exists() else 0
        },
        "imports": {
            "html_generator": "Dummy_web_creator" in sys.modules,
            "screenshoter": "Screenhoter" in sys.modules,
            "video_creator": "Video_creator" in sys.modules
        }
    }


# Add this function - it creates a direct download link
@app.get("/download-video/{user_id}")
def download_video(user_id: str):
    """Direct video download endpoint"""
    from pathlib import Path
    from fastapi.responses import FileResponse
    
    # Path to the video file
    video_path = Path(f"storage/users/{user_id}/video/final_video.mp4")
    
    # Check if file exists
    if not video_path.exists():
        return {"error": "Video not found", "path": str(video_path)}
    
    # Return the video file
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename="your_video.mp4"
    )

# ======================================================
# GENERATE ENDPOINT (UPDATED)
# ======================================================
@app.post("/generate")
def create_generation_task(req: GenerateRequest):
    """Main endpoint to generate dummy pages, take screenshots, and create video"""
    
    print(f"🚀 Starting generation for keyword: {req.keyword}")
    print(f"📄 Pages: {req.num_pages}, Duration: {req.duration_per_snapshot}s")
    print(f"🔤 Fonts: {'Varied' if req.use_varied_fonts else 'Poppins only'}")

    # --------------------------------------------------
    # CREATE USER SESSION FOLDER
    # --------------------------------------------------
    user_id = str(uuid.uuid4())
    print(f"👤 User ID: {user_id}")

    user_root = Path(f"storage/users/{user_id}")
    pages_dir = user_root / "pages"
    images_dir = user_root / "images"
    snapshots_dir = user_root / "snapshots"
    video_dir = user_root / "video"    

    for d in [pages_dir, images_dir, snapshots_dir, video_dir]:
        os.makedirs(d, exist_ok=True)
        print(f"📁 Created: {d}")

    # --------------------------------------------------
    # SOURCE (shared/global) DIRECTORIES
    # --------------------------------------------------
    shared_images = Path("src/p01_dummy_pages_generator/unsplash_images")
    template_file = Path("src/p01_dummy_pages_generator/01_Text_base_tail_templates.txt")
    css_file = Path("src/p01_dummy_pages_generator/templates/01_medium_headline.css")

    # Validate source files exist
    if not template_file.exists():
        raise HTTPException(status_code=500, detail=f"Template file not found: {template_file}")
    if not css_file.exists():
        raise HTTPException(status_code=500, detail=f"CSS file not found: {css_file}")
    if not shared_images.exists():
        raise HTTPException(status_code=500, detail=f"Images directory not found: {shared_images}")

    print(f"✅ Source files validated")

    # --------------------------------------------------
    # STEP 1 — GENERATE HTML PAGES
    # --------------------------------------------------
    try:
        print("🔄 Step 1: Generating HTML pages...")
        html_files = generate_all_pages(
            keyword=req.keyword,
            num_pages=req.num_pages,
            pages_dir=str(pages_dir),
            images_dir=str(images_dir),
            shared_image_dir=str(shared_images),
            template_file=str(template_file),
            css_file=str(css_file),
            use_varied_fonts=req.use_varied_fonts
        )
        print(f"✅ Generated {len(html_files)} HTML pages")
    except Exception as e:
        print(f"❌ HTML generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"HTML generation failed: {str(e)}")

    # --------------------------------------------------
    # STEP 2 — PLAYWRIGHT SNAPSHOT PROCESSING
    # --------------------------------------------------
    try:
        print("🔄 Step 2: Taking screenshots with Playwright...")
        snapshot_results = asyncio.run(
            run_snapshot_processing(
                pages_dir=str(pages_dir),
                output_dir=str(snapshots_dir),
                keyword=req.keyword
            )
        )
        print(f"✅ Captured {len(snapshot_results)} screenshots")
    except Exception as e:
        print(f"❌ Screenshot capture failed: {e}")
        raise HTTPException(status_code=500, detail=f"Snapshot processing failed: {str(e)}")

    # --------------------------------------------------
    # STEP 3 — VIDEO COMPILATION
    # --------------------------------------------------
    try:
        print("🔄 Step 3: Compiling video...")
        final_video_path = compile_snapshots_to_video(
            snapshot_folder=str(snapshots_dir),
            output_video=str(video_dir / "final_video.mp4"),
            snap_sound="src/p03_video_creator/camera_shutter.mp3",
            duration=req.duration_per_snapshot,
        )
        print(f"✅ Video created: {final_video_path}")
    except Exception as e:
        print(f"❌ Video compilation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Video compilation failed: {str(e)}")
    
    video_filename = "final_video.mp4"
    video_relative_path = f"users/{user_id}/video/{video_filename}"
    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------
    response = {
        "user_id": user_id,
        "keyword": req.keyword,
        "use_varied_fonts": req.use_varied_fonts,
        "generated_html": html_files,
        "generated_snapshots": snapshot_results,
        "html_count": len(html_files),
        "snapshot_count": len(snapshot_results),
        "pages_dir": str(pages_dir),
        "snapshots_dir": str(snapshots_dir),
        "images_dir": str(images_dir),
        "video_dir": str(video_dir),
        "video_path": str(video_dir / "final_video.mp4"),
        "video_url": f"http://localhost:8000/static/users/{user_id}/video/final_video.mp4", 
        "timestamp": datetime.now().isoformat(),
        "status": "success"
    }
    
    print(f"🎉 Generation complete for user {user_id}")
    return response