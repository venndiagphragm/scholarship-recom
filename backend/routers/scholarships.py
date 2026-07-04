from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models import Scholarship, Bookmark
from routers.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_scholarships(
    search: str = "",
    jenjang: str = "",
    negara: str = "",
    kategori: str = "",
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Scholarship)
    
    if search:
        query = query.filter(or_(Scholarship.nama.ilike(f"%{search}%"), Scholarship.konten.ilike(f"%{search}%")))
    if jenjang:
        query = query.filter(Scholarship.jenjang == jenjang)
    if negara:
        query = query.filter(Scholarship.negara == negara)
    if kategori:
        query = query.filter(Scholarship.kategori.ilike(f"%{kategori}%"))
        
    total = query.count()
    scholarships = query.offset(skip).limit(limit).all()
    
    return {"total": total, "items": scholarships}

@router.get("/{scholarship_id}")
def get_scholarship(scholarship_id: str, db: Session = Depends(get_db)):
    scholarship = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    return scholarship

@router.post("/{scholarship_id}/bookmark")
def toggle_bookmark(scholarship_id: str, token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    
    bookmark = db.query(Bookmark).filter(Bookmark.user_id == user.id, Bookmark.scholarship_id == scholarship_id).first()
    if bookmark:
        db.delete(bookmark)
        db.commit()
        return {"message": "Bookmark removed", "bookmarked": False}
    else:
        new_bookmark = Bookmark(user_id=user.id, scholarship_id=scholarship_id)
        db.add(new_bookmark)
        db.commit()
        return {"message": "Bookmark added", "bookmarked": True}

@router.get("/user/bookmarks")
def get_bookmarks(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    bookmarks = db.query(Bookmark).filter(Bookmark.user_id == user.id).all()
    scholarships = [b.scholarship for b in bookmarks]
    return scholarships
