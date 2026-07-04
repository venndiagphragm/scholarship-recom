import { Link } from 'react-router-dom';
import { Calendar, Globe, GraduationCap, ChevronRight, Bookmark } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';

const MatchScoreBadge = ({ score }) => {
  if (!score && score !== 0) return null;
  const percentage = Math.round(score * 100);
  let colorClass = 'bg-gray-100 text-gray-700';
  if (percentage > 70) colorClass = 'bg-green-100 text-green-700';
  else if (percentage >= 40) colorClass = 'bg-yellow-100 text-yellow-700';
  
  return (
    <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center ${colorClass}`}>
      Match: {percentage}%
    </div>
  );
};

const ScholarshipCard = ({ scholarship, matchScore, bookmarked: initialBookmarked = false }) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  
  const handleBookmark = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.post(`http://localhost:8000/api/scholarships/${scholarship.id}/bookmark?token=${token}`);
      setBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link to={`/scholarship/${scholarship.id}`} className="group block bg-white border border-border rounded-xl p-5 hover:border-accent hover:shadow-md transition-all relative">
      <div className="absolute top-4 right-4">
        <button onClick={handleBookmark} className="text-gray-400 hover:text-accent transition-colors">
          <Bookmark size={20} className={bookmarked ? "fill-accent text-accent" : ""} />
        </button>
      </div>
      
      <div className="pr-8">
        <h3 className="text-lg font-semibold font-display text-primary group-hover:text-accent transition-colors line-clamp-2 mb-3">
          {scholarship.nama}
        </h3>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-muted gap-2">
          <Globe size={16} /> {scholarship.negara}
        </div>
        <div className="flex items-center text-sm text-muted gap-2">
          <GraduationCap size={16} /> Jenjang {scholarship.jenjang}
        </div>
        {scholarship.deadline && (
          <div className="flex items-center text-sm text-muted gap-2">
            <Calendar size={16} /> Deadline: {scholarship.deadline}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-border">
        {matchScore !== undefined ? (
          <MatchScoreBadge score={matchScore} />
        ) : (
          <div className="text-xs text-muted font-medium bg-surface px-2 py-1 rounded">
            {scholarship.id}
          </div>
        )}
        <div className="text-accent text-sm font-medium flex items-center gap-1 group-hover:underline">
          Detail <ChevronRight size={16} />
        </div>
      </div>
    </Link>
  );
};

export default ScholarshipCard;
