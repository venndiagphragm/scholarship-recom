import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, File, AlertCircle, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const UploadCV = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    setError('');
    setSuccess(false);
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Hanya format PDF yang didukung');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }
    
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await axios.post(`${API_URL}/api/cv/upload?token=${token}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess(true);
      // Update user cache in local storage
      const user = JSON.parse(localStorage.getItem('user'));
      user.cv_uploaded = true;
      localStorage.setItem('user', JSON.stringify(user));
      
      setTimeout(() => {
        navigate('/recommendations');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengupload CV. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold mb-4">Upload CV Akademikmu</h1>
        <p className="text-muted">
          Sistem AI ScholarPath akan mengekstrak data dari CV kamu untuk mencari beasiswa yang paling cocok. Pastikan CV berisi informasi pendidikan, jenjang, dan keahlianmu.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          CV berhasil dianalisis! Mengarahkan ke halaman rekomendasi...
        </div>
      )}

      <div 
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragging ? 'border-accent bg-blue-50' : 'border-border bg-white hover:border-accent'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="application/pdf"
          onChange={handleFileSelect}
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 text-accent rounded-full flex items-center justify-center mb-4">
              <File size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-1">{file.name}</h3>
            <p className="text-muted text-sm mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button 
              className="text-sm text-red-500 hover:underline"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              Hapus File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 bg-surface text-accent rounded-full flex items-center justify-center mb-4">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pilih file PDF atau tarik ke sini</h3>
            <p className="text-muted text-sm">Maksimal ukuran file: 5MB</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleUpload}
          disabled={!file || loading || success}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${!file || loading || success ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-blue-600 shadow-lg'}`}
        >
          {loading ? 'Menganalisis dengan AI...' : 'Mulai Analisis CV'}
        </button>
      </div>
    </div>
  );
};

export default UploadCV;
