from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
from models import Scholarship
from ml_engine import hybrid_match

router = APIRouter()

@router.get("/")
def get_recommendations(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    
    if not user.cv_text:
        raise HTTPException(status_code=400, detail="CV not uploaded yet")
        
    scholarships = db.query(Scholarship).all()
    metadata_list = [
        {
            "id": s.id,
            "nama": s.nama,
            "jenjang": s.jenjang,
            "negara": s.negara
        } for s in scholarships
    ]
    
    # Calculate scores
    results = hybrid_match(user.cv_text, metadata_list, top_k=20)
    
    return {"results": results}
