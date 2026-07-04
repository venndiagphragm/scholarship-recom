import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Building, Book, GraduationCap, ArrowLeft, Save,
  Camera, X, Check, Palette, Frame, Eye, EyeOff, FileText, Sparkles
} from 'lucide-react';

const THEME_OPTIONS = [
  { key: 'blue',   label: 'Ocean Blue',    color: '#2E7CF6', bg: 'bg-blue-500'   },
  { key: 'purple', label: 'Royal Purple',  color: '#7C3AED', bg: 'bg-purple-600' },
  { key: 'green',  label: 'Emerald',       color: '#059669', bg: 'bg-emerald-600'},
  { key: 'orange', label: 'Sunset',        color: '#EA580C', bg: 'bg-orange-500' },
  { key: 'rose',   label: 'Rose Gold',     color: '#E11D48', bg: 'bg-rose-600'   },
];

const FRAME_OPTIONS = [
  { key: 'rounded', label: 'Rounded',  preview: 'rounded-2xl' },
  { key: 'circle',  label: 'Circle',   preview: 'rounded-full' },
  { key: 'square',  label: 'Square',   preview: 'rounded-md'  },
];

const GRADIENT_OPTIONS = [
  { key: 'from-blue-600 to-blue-400',      label: 'Blue' },
  { key: 'from-purple-600 to-purple-400',  label: 'Purple' },
  { key: 'from-emerald-600 to-emerald-400',label: 'Green' },
  { key: 'from-orange-500 to-amber-400',   label: 'Sunset' },
  { key: 'from-rose-600 to-rose-400',      label: 'Rose' },
];

const InputField = ({ label, icon: Icon, children, hint }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon size={14} className="text-gray-400" />}
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    nama: '', universitas: '', jurusan: '', jenjang: '', ipk: '', deskripsi_diri: '', theme_color: 'blue'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Personalization state (stored in localStorage)
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [frameStyle, setFrameStyle] = useState('rounded');
  const [showIpk, setShowIpk] = useState(true);
  const [bannerGrad, setBannerGrad] = useState('from-blue-600 to-blue-400');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await axios.get(`http://localhost:8000/api/auth/me?token=${token}`);
        setProfile({
          nama: res.data.nama || '',
          universitas: res.data.universitas || '',
          jurusan: res.data.jurusan || '',
          jenjang: res.data.jenjang || '',
          ipk: res.data.ipk || '',
          deskripsi_diri: res.data.deskripsi_diri || '',
          theme_color: res.data.theme_color || 'blue'
        });
        if (res.data.foto_profil) {
          setAvatarPreview(`http://localhost:8000${res.data.foto_profil}`);
        }
        // Load localStorage prefs
        const prefs = JSON.parse(localStorage.getItem('userPrefs') || '{}');
        if (prefs.frameStyle) setFrameStyle(prefs.frameStyle);
        if (prefs.showIpk !== undefined) setShowIpk(prefs.showIpk);
        if (prefs.bannerGrad) setBannerGrad(prefs.bannerGrad);
        const themeKey = res.data.theme_color || 'blue';
        const matched = GRADIENT_OPTIONS.findIndex(g =>
          g.key.includes(themeKey === 'orange' ? 'orange' : themeKey === 'green' ? 'emerald' : themeKey === 'rose' ? 'rose' : themeKey === 'purple' ? 'purple' : 'blue')
        );
        if (matched >= 0 && !prefs.bannerGrad) setBannerGrad(GRADIENT_OPTIONS[matched].key);
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const savePrefsToLocalStorage = (themeColor) => {
    const prefs = JSON.parse(localStorage.getItem('userPrefs') || '{}');
    prefs.frameStyle = frameStyle;
    prefs.showIpk = showIpk;
    prefs.bannerGrad = bannerGrad;
    if (themeColor) prefs.themeColor = themeColor;
    if (avatarPreview && !avatarFile) prefs.avatarUrl = avatarPreview; // keep existing
    localStorage.setItem('userPrefs', JSON.stringify(prefs));
    window.dispatchEvent(new Event('prefsChange'));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    const token = localStorage.getItem('token');
    try {
      // 1. Upload photo if changed
      if (avatarFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', avatarFile);
        const photoRes = await axios.post(
          `http://localhost:8000/api/auth/upload-photo?token=${token}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        const newAvatarUrl = `http://localhost:8000${photoRes.data.foto_profil}`;
        setAvatarPreview(newAvatarUrl);
        setAvatarFile(null);
        // Update navbar
        const prefs = JSON.parse(localStorage.getItem('userPrefs') || '{}');
        prefs.avatarUrl = newAvatarUrl;
        localStorage.setItem('userPrefs', JSON.stringify(prefs));
        window.dispatchEvent(new Event('prefsChange'));
        setUploadingPhoto(false);
      }

      // 2. Save profile data
      await axios.put(`http://localhost:8000/api/auth/profile?token=${token}`, profile);

      // 3. Save prefs to localStorage
      savePrefsToLocalStorage(profile.theme_color);

      setMsg({ text: 'Profil berhasil disimpan! 🎉', type: 'success' });

      // Redirect to profile view after short delay
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setMsg({ text: 'Gagal menyimpan profil. Coba lagi.', type: 'error' });
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  const themeOption = THEME_OPTIONS.find(t => t.key === profile.theme_color) || THEME_OPTIONS[0];
  const frameClass = FRAME_OPTIONS.find(f => f.key === frameStyle)?.preview || 'rounded-2xl';
  const initials = profile.nama ? profile.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-10 px-4 pb-24">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/profile"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={15} /> Kembali ke Profil
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Profil</h1>
            <p className="text-xs text-gray-400">Perbarui informasi dan personalisasi tampilanmu</p>
          </div>
        </div>

        {msg.text && (
          <div className={`mb-5 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            msg.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-100'
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {msg.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">

          {/* === PHOTO & PREVIEW === */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg">
                <Camera size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-700">Foto Profil</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Preview */}
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className={`w-28 h-28 object-cover ${frameClass} ring-4 ring-white shadow-lg border-2`}
                    style={{ borderColor: themeOption.color }}
                  />
                ) : (
                  <div
                    className={`w-28 h-28 ${frameClass} bg-gradient-to-br flex items-center justify-center ring-4 ring-white shadow-lg`}
                    style={{ background: `linear-gradient(135deg, ${themeOption.color}, ${themeOption.color}aa)` }}
                  >
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ borderRadius: frameClass.includes('full') ? '50%' : frameClass.includes('2xl') ? '1rem' : '0.375rem' }}
                >
                  <Camera size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                >
                  <Camera size={15} /> {avatarPreview ? 'Ganti Foto' : 'Upload Foto'}
                </button>
                {avatarPreview && (
                  <button type="button" onClick={removeAvatar} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors">
                    <X size={15} /> Hapus Foto
                  </button>
                )}
                <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF. Maks 5MB.</p>
              </div>
            </div>
          </div>

          {/* === PERSONAL INFO === */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg">
                <User size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-700">Informasi Pribadi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Nama Lengkap" icon={User}>
                <input
                  type="text" name="nama" value={profile.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap kamu"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                />
              </InputField>

              <InputField label="Universitas" icon={Building}>
                <input
                  type="text" name="universitas" value={profile.universitas}
                  onChange={handleChange}
                  placeholder="Contoh: Universitas Indonesia"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                />
              </InputField>

              <InputField label="Jurusan / Prodi" icon={Book}>
                <input
                  type="text" name="jurusan" value={profile.jurusan}
                  onChange={handleChange}
                  placeholder="Contoh: Teknik Informatika"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                />
              </InputField>

              <InputField label="Jenjang" icon={GraduationCap}>
                <select
                  name="jenjang" value={profile.jenjang}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all bg-white"
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="S1">S1 – Sarjana</option>
                  <option value="S2">S2 – Magister</option>
                  <option value="S3">S3 – Doktoral</option>
                </select>
              </InputField>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    IPK
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowIpk(!showIpk)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    title={showIpk ? 'Sembunyikan IPK di profil' : 'Tampilkan IPK di profil'}
                  >
                    {showIpk ? <Eye size={12} /> : <EyeOff size={12} />}
                    {showIpk ? 'Ditampilkan' : 'Disembunyikan'}
                  </button>
                </div>
                <input
                  type="text" name="ipk" value={profile.ipk}
                  onChange={handleChange}
                  placeholder="Contoh: 3.85"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                />
                <p className="text-xs text-gray-400">Skala 0.00 – 4.00</p>
              </div>
            </div>

            <div className="mt-5">
              <InputField label="Bio / Deskripsi Diri" icon={FileText} hint="Tampil sebagai kutipan di halaman profilmu">
                <textarea
                  name="deskripsi_diri" value={profile.deskripsi_diri}
                  onChange={handleChange}
                  placeholder="Ceritakan sedikit tentang dirimu, minat, dan tujuanmu..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all resize-none"
                />
              </InputField>
            </div>
          </div>

          {/* === PERSONALIZATION === */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Personalisasi</h2>
                <p className="text-xs text-gray-400">Kustomisasi tampilan profilmu</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Theme Color */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Warna Tema</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {THEME_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setProfile({ ...profile, theme_color: opt.key })}
                      className={`group flex flex-col items-center gap-1.5 transition-all duration-200`}
                      title={opt.label}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${opt.bg} shadow-md transition-all duration-200 ${
                          profile.theme_color === opt.key
                            ? 'ring-2 ring-offset-2 scale-110'
                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                        style={{ '--tw-ring-color': opt.color }}
                      >
                        {profile.theme_color === opt.key && (
                          <div className="w-full h-full flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Frame */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Frame size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Bentuk Avatar</span>
                </div>
                <div className="flex gap-4">
                  {FRAME_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setFrameStyle(opt.key)}
                      className={`flex flex-col items-center gap-2 transition-all duration-200`}
                    >
                      <div
                        className={`w-14 h-14 ${opt.preview} flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                          frameStyle === opt.key
                            ? 'ring-2 ring-offset-1 scale-110 shadow-md'
                            : 'opacity-60 hover:opacity-90 hover:scale-105'
                        }`}
                        style={{
                          background: frameStyle === opt.key ? `linear-gradient(135deg, ${themeOption.color}, ${themeOption.color}bb)` : '#e5e7eb',
                          color: frameStyle === opt.key ? 'white' : '#9ca3af',
                          '--tw-ring-color': themeOption.color,
                        }}
                      >
                        {frameStyle === opt.key ? <Check size={18} /> : initials}
                      </div>
                      <span className="text-xs text-gray-500">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Gradient */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Banner Profil</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {GRADIENT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setBannerGrad(opt.key)}
                      className={`relative w-16 h-8 rounded-lg bg-gradient-to-r ${opt.key} transition-all duration-200 ${
                        bannerGrad === opt.key ? 'ring-2 ring-offset-1 scale-110 shadow-md' : 'opacity-60 hover:opacity-90 hover:scale-105'
                      }`}
                      style={{ '--tw-ring-color': themeOption.color }}
                      title={opt.label}
                    >
                      {bannerGrad === opt.key && (
                        <Check size={12} className="absolute inset-0 m-auto text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${themeOption.color}, ${themeOption.color}cc)` }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {uploadingPhoto ? 'Mengupload foto...' : 'Menyimpan...'}
                </>
              ) : (
                <><Save size={16} /> Simpan Perubahan</>
              )}
            </button>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} /> Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
