from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
from ml_engine import extract_text_from_pdf_bytes

router = APIRouter()

@router.post("/upload")
async def upload_cv(token: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    user = get_current_user(token, db)
    
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
    extracted_text = extract_text_from_pdf_bytes(content)
    
    if len(extracted_text) < 50:
        raise HTTPException(status_code=400, detail="Could not extract enough text from PDF. Please ensure it's a text-based PDF.")
        
    # Limit to 3000 chars as in notebook
    user.cv_text = extracted_text[:3000]
    db.commit()
    
    return {"message": "CV uploaded and analyzed successfully", "extracted_length": len(user.cv_text)}
