import os
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import fitz
import re

CACHE_DIR = "cache"
BI_ENCODER_MODEL = 'all-MiniLM-L6-v2'

FIELD_WEIGHTS = {
    'konten' : 0.60,
    'nama'   : 0.25,
    'jenjang': 0.10,
    'negara' : 0.05,
}

print(f"Loading Bi-Encoder: {BI_ENCODER_MODEL}")
bi_encoder = SentenceTransformer(BI_ENCODER_MODEL)

doc_embeddings_per_field = {}
bm25_per_field = {}

def load_cache():
    global doc_embeddings_per_field, bm25_per_field
    for field in FIELD_WEIGHTS:
        cache_path = os.path.join(CACHE_DIR, f'emb_{field}.pkl')
        bm25_cache_path = os.path.join(CACHE_DIR, f'bm25_{field}.pkl')
        
        if os.path.exists(cache_path):
            with open(cache_path, 'rb') as f:
                doc_embeddings_per_field[field] = pickle.load(f)
        
        if os.path.exists(bm25_cache_path):
            with open(bm25_cache_path, 'rb') as f:
                bm25_per_field[field] = pickle.load(f)

# Load cache on startup
load_cache()

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ''
        for page in doc:
            text += page.get_text()
        doc.close()
        return clean_text(text)
    except Exception as e:
        print(f"Failed to read PDF: {e}")
        return ""

def normalize_scores(scores):
    arr = np.array(scores, dtype=float)
    mn, mx = arr.min(), arr.max()
    if mx > mn:
        return (arr - mn) / (mx - mn)
    return np.zeros_like(arr)

def hybrid_match(cv_text: str, scholarships_metadata: list, top_k: int = 10, alpha: float = 0.3):
    if not doc_embeddings_per_field or not bm25_per_field:
        load_cache()

    beta = 1.0 - alpha
    cv_emb = bi_encoder.encode([cv_text], convert_to_numpy=True)
    
    final_scores = np.zeros(len(scholarships_metadata))
    field_score_map = {}

    for field, weight in FIELD_WEIGHTS.items():
        if field not in bm25_per_field or field not in doc_embeddings_per_field:
            continue
            
        bm25_raw = bm25_per_field[field].get_scores(cv_text.lower().split())
        bm25_norm = normalize_scores(bm25_raw)

        sem_raw = cosine_similarity(cv_emb, doc_embeddings_per_field[field])[0]
        sem_norm = normalize_scores(sem_raw)

        field_score = alpha * bm25_norm + beta * sem_norm
        final_scores += weight * field_score
        field_score_map[field] = field_score

    results = []
    for i, sch in enumerate(scholarships_metadata):
        results.append({
            'scholarship': sch,
            'final_score': round(float(final_scores[i]), 4),
            'score_konten': round(float(field_score_map.get('konten', [0]*len(final_scores))[i]), 4),
            'score_nama': round(float(field_score_map.get('nama', [0]*len(final_scores))[i]), 4),
            'score_jenjang': round(float(field_score_map.get('jenjang', [0]*len(final_scores))[i]), 4),
            'score_negara': round(float(field_score_map.get('negara', [0]*len(final_scores))[i]), 4),
        })

    results.sort(key=lambda x: x['final_score'], reverse=True)
    return results[:top_k]
