import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Globe, GraduationCap, Link as LinkIcon, Bookmark, ChevronLeft } from 'lucide-react';
import { API_URL } from '../config';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/scholarships/${id}`);
        setScholarship(res.data);
        
        if (token) {
          const bookRes = await axios.get(`${API_URL}/api/scholarships/user/bookmarks?token=${token}`);
          const isBookmarked = bookRes.data.some(b => b.id === id);
          setBookmarked(isBookmarked);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, token]);

  const handleBookmark = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/scholarships/${id}/bookmark?token=${token}`);
      setBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-12">Memuat detail...</div>;
  if (!scholarship) return <div className="text-center p-12 text-red-500">Beasiswa tidak ditemukan</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted hover:text-primary mb-6 transition-colors">
        <ChevronLeft size={20} /> Kembali
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-border">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-display font-bold text-primary max-w-2xl">{scholarship.nama}</h1>
          <button 
            onClick={handleBookmark}
            className={`p-3 rounded-full border transition-colors ${bookmarked ? 'bg-blue-50 border-accent text-accent' : 'border-border text-gray-400 hover:text-accent'}`}
            title={bookmarked ? "Hapus dari simpanan" : "Simpan beasiswa"}
          >
            <Bookmark size={24} className={bookmarked ? "fill-accent" : ""} />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 border-b border-border pb-6">
          <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg text-sm font-medium">
            <Globe size={18} className="text-accent"/> {scholarship.negara || 'Tidak spesifik'}
          </div>
          <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg text-sm font-medium">
            <GraduationCap size={18} className="text-accent"/> Jenjang {scholarship.jenjang}
          </div>
        </div>

        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold mb-4">Informasi Beasiswa</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {scholarship.konten || 'Tidak ada deskripsi detail.'}
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex justify-between items-center">
          <div className="text-sm text-muted font-mono bg-gray-100 px-3 py-1 rounded">
            ID: {scholarship.id}
          </div>
          {scholarship.link && scholarship.link !== "null" && scholarship.link !== "" && (
            <a 
              href={scholarship.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <LinkIcon size={18} /> Kunjungi Situs Resmi
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;
