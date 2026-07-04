import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import ScholarshipCard from '../components/ScholarshipCard';
import { Target } from 'lucide-react';

const RecommendationResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const res = await axios.get(`http://localhost:8000/api/recommendations?token=${token}`);
        setResults(res.data.results);
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.detail.includes('CV')) {
          navigate('/upload-cv');
        } else {
          setError('Gagal memuat rekomendasi.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
        <h2 className="text-xl font-medium text-text">Sistem AI sedang mencocokkan CV Anda dengan 1.140+ beasiswa...</h2>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto px-4 py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Target className="text-accent" /> Beasiswa Terbaik untuk Profilmu
          </h1>
          <p className="text-muted mt-2">Menampilkan top {results.length} rekomendasi berdasarkan analisis AI terhadap CV-mu.</p>
        </div>
        <Link to="/upload-cv" className="text-sm text-accent hover:underline">
          Upload ulang CV
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item, index) => (
          <ScholarshipCard 
            key={item.scholarship.id} 
            scholarship={item.scholarship} 
            matchScore={item.final_score}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationResults;
