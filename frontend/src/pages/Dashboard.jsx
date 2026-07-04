import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, ChevronRight, Bookmark } from 'lucide-react';
import ScholarshipCard from '../components/ScholarshipCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:8000/api/auth/me?token=${token}`);
        setUser(userRes.data);
        
        const bookRes = await axios.get(`http://localhost:8000/api/scholarships/user/bookmarks?token=${token}`);
        setBookmarks(bookRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  if (loading) return <div className="text-center p-12">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Halo, {user?.nama?.split(' ')[0]}!</h1>
        <p className="text-muted mt-2">Selamat datang kembali di ScholarPath. Siap mencari beasiswa hari ini?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* CV Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <FileText className="text-accent" /> Status CV
            </h3>
            {user?.cv_uploaded ? (
              <p className="text-green-600 bg-green-50 p-3 rounded-lg inline-block text-sm font-medium">
                ✅ CV aktif dan telah dianalisis oleh AI
              </p>
            ) : (
              <p className="text-red-500 bg-red-50 p-3 rounded-lg inline-block text-sm font-medium">
                ❌ Anda belum mengupload CV
              </p>
            )}
            <p className="text-muted mt-4 text-sm max-w-md">
              Sistem kami membutuhkan CV Anda untuk mencocokkan profil dengan 1.140+ beasiswa menggunakan teknologi AI.
            </p>
          </div>
          <div className="mt-6 flex gap-4">
            <Link to="/upload-cv" className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-max">
              <Upload size={18} /> {user?.cv_uploaded ? 'Upload Ulang CV' : 'Upload CV Sekarang'}
            </Link>
            {user?.cv_uploaded && (
              <Link to="/recommendations" className="bg-surface text-primary hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-max">
                Lihat Rekomendasi <ChevronRight size={18} />
              </Link>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-primary text-white p-6 rounded-xl shadow-sm border border-secondary flex flex-col justify-center">
          <h3 className="text-lg font-medium mb-1">Beasiswa Disimpan</h3>
          <div className="text-5xl font-mono font-bold text-accent mb-4">{bookmarks.length}</div>
          <Link to="#bookmarks" className="text-sm text-gray-300 hover:text-white flex items-center gap-1">
            Lihat daftar lengkap <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Bookmarks Section */}
      <h2 id="bookmarks" className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
        <Bookmark className="text-accent" /> Beasiswa Tersimpan
      </h2>
      
      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map(scholarship => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} bookmarked={true} />
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border border-dashed rounded-xl p-8 text-center text-muted">
          Belum ada beasiswa yang disimpan. <Link to="/browse" className="text-accent hover:underline">Mulai telusuri</Link> atau dapatkan rekomendasi.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
