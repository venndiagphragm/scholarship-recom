from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    universitas = Column(String, nullable=True)
    jurusan = Column(String, nullable=True)
    jenjang = Column(String, nullable=True) # S1, S2, S3
    ipk = Column(String, nullable=True)
    deskripsi_diri = Column(Text, nullable=True)
    foto_profil = Column(String, nullable=True)
    theme_color = Column(String, nullable=True, default='blue')
    cv_text = Column(Text, nullable=True)

    bookmarks = relationship("Bookmark", back_populates="user")


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(String, primary_key=True, index=True) # BEA0001
    url = Column(String)
    nama = Column(String, index=True)
    tanggal_publish = Column(String, nullable=True)
    kategori = Column(String, nullable=True)
    konten = Column(Text)
    deadline = Column(String, nullable=True)
    negara = Column(String, index=True)
    jenjang = Column(String, index=True)
    
    bookmarks = relationship("Bookmark", back_populates="scholarship")


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scholarship_id = Column(String, ForeignKey("scholarships.id"))

    user = relationship("User", back_populates="bookmarks")
    scholarship = relationship("Scholarship", back_populates="bookmarks")
