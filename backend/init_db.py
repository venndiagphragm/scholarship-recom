import os
import re
import pickle
import pandas as pd
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

from database import engine, Base, SessionLocal
from models import Scholarship

CSV_PATH = "../beasiswa_data.csv"
CACHE_DIR = "cache"

BI_ENCODER_MODEL = 'all-MiniLM-L6-v2'

FIELD_WEIGHTS = {
    'konten' : 0.60,
    'nama'   : 0.25,
    'jenjang': 0.10,
    'negara' : 0.05,
}

FIELD_MAX_CHARS = {
    'konten' : 800,
    'nama'   : 200,
    'jenjang': 20,
    'negara' : 50,
}

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    print(f"Loading data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    df.insert(0, 'id', [f"BEA{str(i).zfill(4)}" for i in range(len(df))])

    for field in FIELD_WEIGHTS:
        max_c = FIELD_MAX_CHARS[field]
        df[field] = df[field].fillna('').apply(clean_text).str[:max_c]

    # Save to SQLite
    db = SessionLocal()
    existing_count = db.query(Scholarship).count()
    if existing_count == 0:
        print("Inserting scholarships into database...")
        scholarships_to_insert = []
        for _, row in df.iterrows():
            sch = Scholarship(
                id=row['id'],
                url=str(row['url']) if pd.notna(row['url']) else "",
                nama=row['nama'],
                tanggal_publish=str(row['tanggal_publish']) if pd.notna(row['tanggal_publish']) else "",
                kategori=str(row['kategori']) if pd.notna(row['kategori']) else "",
                konten=row['konten'],
                deadline=str(row['deadline']) if pd.notna(row['deadline']) else "",
                negara=row['negara'],
                jenjang=row['jenjang']
            )
            scholarships_to_insert.append(sch)
        db.bulk_save_objects(scholarships_to_insert)
        db.commit()
        print("Database insertion complete.")
    else:
        print("Database already contains data, skipping insertion.")
    db.close()

    # Pre-compute Embeddings
    os.makedirs(CACHE_DIR, exist_ok=True)
    field_docs = {field: df[field].tolist() for field in FIELD_WEIGHTS}

    print(f"Loading Bi-Encoder: {BI_ENCODER_MODEL}")
    bi_encoder = SentenceTransformer(BI_ENCODER_MODEL)

    for field in FIELD_WEIGHTS:
        cache_path = os.path.join(CACHE_DIR, f'emb_{field}.pkl')
        bm25_cache_path = os.path.join(CACHE_DIR, f'bm25_{field}.pkl')
        docs = field_docs[field]

        if not os.path.exists(cache_path):
            print(f"Encoding field [{field}] ({len(docs)} docs)...")
            embs = bi_encoder.encode(docs, batch_size=64, show_progress_bar=True, convert_to_numpy=True)
            with open(cache_path, 'wb') as f:
                pickle.dump(embs, f)
            print(f"Saved embeddings to {cache_path}")
        else:
            print(f"Embeddings cache [{field}] already exists.")

        if not os.path.exists(bm25_cache_path):
            print(f"Creating BM25 index for field [{field}]...")
            tokenized = [d.lower().split() for d in docs]
            bm25 = BM25Okapi(tokenized)
            with open(bm25_cache_path, 'wb') as f:
                pickle.dump(bm25, f)
            print(f"Saved BM25 to {bm25_cache_path}")
        else:
            print(f"BM25 cache [{field}] already exists.")

if __name__ == "__main__":
    init_db()
