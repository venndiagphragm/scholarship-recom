from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import auth, scholarships, cv, recommendations
from database import Base, engine
import os

# Base.metadata.create_all(bind=engine) # Handled by init_db.py

app = FastAPI(title="ScholarPath API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(scholarships.router, prefix="/api/scholarships", tags=["Scholarships"])
app.include_router(cv.router, prefix="/api/cv", tags=["CV"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])

# Serve static files (avatars, etc.)
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to ScholarPath API"}
