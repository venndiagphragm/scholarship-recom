import { useState, useEffect } from 'react';
import axios from 'axios';
import ScholarshipCard from '../components/ScholarshipCard';
import { Search } from 'lucide-react';

const Browse = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [negara, setNegara] = useState('');
  
  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/scholarships/`, {
        params: { search, jenjang, negara, limit: 30 }
      });
      setScholarships(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchScholarships();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">Jelajahi Beasiswa</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-border mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-3 text-muted" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama atau keyword..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          <select 
            value={jenjang}
            onChange={(e) => setJenjang(e.target.value)}
            className="md:w-48 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
          >
            <option value="">Semua Jenjang</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
            <option value="S3">S3</option>
            <option value="Short Course">Short Course</option>
          </select>
          <input 
            type="text"
            placeholder="Negara (opsional)"
            value={negara}
            onChange={(e) => setNegara(e.target.value)}
            className="md:w-48 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none"
          />
          <button type="submit" className="bg-accent hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Cari
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Memuat data...</div>
      ) : scholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map(s => (
            <ScholarshipCard key={s.id} scholarship={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted bg-surface rounded-xl border border-dashed border-border">
          Tidak ada beasiswa yang cocok dengan pencarian Anda.
        </div>
      )}
    </div>
  );
};

export default Browse;
