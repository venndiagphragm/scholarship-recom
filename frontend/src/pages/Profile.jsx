import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Building, Book, GraduationCap, Star, Edit3,
  MapPin, FileText, Award, CheckCircle, Upload, ExternalLink
} from 'lucide-react';

const THEME_COLORS = {
  blue:   { accent: '#2E7CF6', grad: 'from-blue-600 to-blue-400',   ring: 'ring-blue-400',   badge: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-500' },
  purple: { accent: '#7C3AED', grad: 'from-purple-600 to-purple-400', ring: 'ring-purple-400', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500' },
  green:  { accent: '#059669', grad: 'from-emerald-600 to-emerald-400', ring: 'ring-emerald-400', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  orange: { accent: '#EA580C', grad: 'from-orange-500 to-amber-400', ring: 'ring-orange-400', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
  rose:   { accent: '#E11D48', grad: 'from-rose-600 to-rose-400',   ring: 'ring-rose-400',   badge: 'bg-rose-100 text-rose-700',   bar: 'bg-rose-500' },
};

const jenjangLabel = { S1: 'Sarjana (S1)', S2: 'Magister (S2)', S3: 'Doktoral (S3)' };

const GpaBar = ({ ipk, themeColor }) => {
  const max = 4.0;
  const val = parseFloat(ipk) || 0;
  const pct = Math.min((val / max) * 100, 100);
  const color = THEME_COLORS[themeColor] || THEME_COLORS.blue;
  const label = val >= 3.75 ? 'Cumlaude' : val >= 3.5 ? 'Sangat Baik' : val >= 3.0 ? 'Baik' : val >= 2.5 ? 'Cukup' : 'Perlu Ditingkatkan';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-gray-500 font-medium">IPK</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-800">{val.toFixed(2)}</span>
          <span className="text-xs text-gray-400">/ 4.00</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${color.badge}`}>
        {label}
      </span>
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, themeColor }) => {
  const color = THEME_COLORS[themeColor] || THEME_COLORS.blue;
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl px-4 py-3 border border-gray-100">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color.grad} text-white`}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await axios.get(`http://localhost:8000/api/auth/me?token=${token}`);
        setProfile(res.data);
        // Sync avatar to navbar via localStorage
        const prefs = JSON.parse(localStorage.getItem('userPrefs') || '{}');
        if (res.data.foto_profil) {
          prefs.avatarUrl = `http://localhost:8000${res.data.foto_profil}`;
        }
        if (res.data.theme_color) prefs.themeColor = res.data.theme_color;
        localStorage.setItem('userPrefs', JSON.stringify(prefs));
        window.dispatchEvent(new Event('prefsChange'));
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const themeColor = profile.theme_color || 'blue';
  const color = THEME_COLORS[themeColor] || THEME_COLORS.blue;
  const avatarUrl = profile.foto_profil ? `http://localhost:8000${profile.foto_profil}` : null;
  const initials = profile.nama ? profile.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
  const isComplete = profile.universitas && profile.jurusan && profile.jenjang && profile.ipk;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover Banner */}
          <div className={`h-28 bg-gradient-to-r ${color.grad} relative`}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
            {/* Edit Button top-right */}
            <Link
              to="/profile/edit"
              className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-lg border border-white/30 transition-all duration-200"
            >
              <Edit3 size={14} /> Edit Profil
            </Link>
          </div>

          {/* Avatar & Name */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
              <div className="relative w-fit">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile.nama}
                    className={`w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg border-2 border-white`}
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${color.grad} flex items-center justify-center ring-4 ring-white shadow-lg`}>
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  </div>
                )}
                {isComplete && (
                  <div className="absolute -bottom-1.5 -right-1.5 bg-green-500 rounded-full p-0.5 shadow">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {profile.cv_uploaded && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                    <FileText size={12} /> CV Terupload
                  </span>
                )}
                <Link
                  to="/upload-cv"
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                >
                  <Upload size={12} /> Update CV
                </Link>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.nama || '—'}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-3">
                <MapPin size={13} /> {profile.email}
              </p>
              {profile.deskripsi_diri && (
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 italic">
                  "{profile.deskripsi_diri}"
                </p>
              )}
              {!profile.deskripsi_diri && (
                <Link to="/profile/edit" className="text-sm text-gray-400 hover:text-accent transition-colors italic flex items-center gap-1">
                  <Edit3 size={12} /> Tambahkan bio...
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Info Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Academic Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${color.grad}`}>
                <GraduationCap size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-700">Informasi Akademik</h2>
            </div>
            <div className="space-y-3">
              <StatBadge icon={Building} label="Universitas" value={profile.universitas} themeColor={themeColor} />
              <StatBadge icon={Book} label="Jurusan / Prodi" value={profile.jurusan} themeColor={themeColor} />
              <StatBadge icon={GraduationCap} label="Jenjang" value={jenjangLabel[profile.jenjang] || profile.jenjang} themeColor={themeColor} />
            </div>
            {!profile.universitas && !profile.jurusan && (
              <Link to="/profile/edit" className="text-sm text-accent hover:underline flex items-center gap-1 pt-1">
                <Edit3 size={12} /> Lengkapi informasi akademik
              </Link>
            )}
          </div>

          {/* IPK Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${color.grad}`}>
                <Star size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-700">Prestasi Akademik</h2>
            </div>
            {profile.ipk ? (
              <GpaBar ipk={profile.ipk} themeColor={themeColor} />
            ) : (
              <div className="text-center py-6">
                <Star size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">IPK belum diisi</p>
                <Link to="/profile/edit" className="text-accent text-sm hover:underline mt-1 inline-block">Isi sekarang →</Link>
              </div>
            )}

            {/* Profile Completeness */}
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-2">Kelengkapan profil</p>
              <div className="space-y-1">
                {[
                  { label: 'Nama', done: !!profile.nama },
                  { label: 'Universitas', done: !!profile.universitas },
                  { label: 'Jurusan', done: !!profile.jurusan },
                  { label: 'Jenjang', done: !!profile.jenjang },
                  { label: 'IPK', done: !!profile.ipk },
                  { label: 'CV Uploaded', done: profile.cv_uploaded },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                    <span className={`text-xs ${item.done ? 'text-gray-600' : 'text-gray-400'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
                <div
                  className={`h-full rounded-full ${color.bar} transition-all duration-700`}
                  style={{
                    width: `${([!!profile.nama, !!profile.universitas, !!profile.jurusan, !!profile.jenjang, !!profile.ipk, profile.cv_uploaded].filter(Boolean).length / 6) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/profile/edit"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${color.grad} text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
          >
            <Edit3 size={16} /> Edit Profil & Personalisasi
          </Link>
          <Link
            to="/recommendations"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <Award size={16} /> Lihat Rekomendasi
          </Link>
          <Link
            to="/browse"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={16} /> Jelajahi Beasiswa
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
