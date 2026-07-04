from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt
import jwt
import os
import uuid
import shutil
from datetime import datetime, timedelta

from database import get_db
from models import User

router = APIRouter()

AVATAR_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)

SECRET_KEY = "scholarpath_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

class UserCreate(BaseModel):
    nama: str
    email: str
    password: str
    
class UserLogin(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    nama: str | None = None
    universitas: str | None = None
    jurusan: str | None = None
    jenjang: str | None = None
    ipk: str | None = None
    deskripsi_diri: str | None = None
    theme_color: str | None = None

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(nama=user.nama, email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": new_user.id, "nama": new_user.nama, "email": new_user.email}}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "nama": db_user.nama, "email": db_user.email, "cv_uploaded": bool(db_user.cv_text)}}

@router.put("/profile")
def update_profile(profile: ProfileUpdate, token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    if profile.nama is not None: user.nama = profile.nama
    if profile.universitas is not None: user.universitas = profile.universitas
    if profile.jurusan is not None: user.jurusan = profile.jurusan
    if profile.jenjang is not None: user.jenjang = profile.jenjang
    if profile.ipk is not None: user.ipk = profile.ipk
    if profile.deskripsi_diri is not None: user.deskripsi_diri = profile.deskripsi_diri
    if profile.theme_color is not None: user.theme_color = profile.theme_color
    
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "user": {
        "id": user.id, "nama": user.nama, "universitas": user.universitas,
        "jurusan": user.jurusan, "jenjang": user.jenjang, "ipk": user.ipk,
        "deskripsi_diri": user.deskripsi_diri, "foto_profil": user.foto_profil,
        "theme_color": user.theme_color
    }}

@router.post("/upload-photo")
async def upload_photo(token: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    
    # Validate file type
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, or GIF images are allowed")
    
    # Delete old avatar if exists
    if user.foto_profil:
        old_path = os.path.join(AVATAR_DIR, os.path.basename(user.foto_profil))
        if os.path.exists(old_path):
            os.remove(old_path)
    
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "png"
    filename = f"{user.id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(AVATAR_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    user.foto_profil = f"/static/avatars/{filename}"
    db.commit()
    db.refresh(user)
    return {"foto_profil": user.foto_profil}

@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    return {
        "id": user.id, 
        "nama": user.nama, 
        "email": user.email, 
        "universitas": user.universitas, 
        "jurusan": user.jurusan, 
        "jenjang": user.jenjang, 
        "ipk": user.ipk,
        "deskripsi_diri": user.deskripsi_diri,
        "foto_profil": user.foto_profil,
        "theme_color": getattr(user, 'theme_color', None),
        "cv_uploaded": bool(user.cv_text)
    }
