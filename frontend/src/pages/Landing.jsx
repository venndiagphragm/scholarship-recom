import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Cpu, CheckCircle, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

const carouselImages = [
  "/images/depositphotos_122104490-stock-photo-smiing-female-college-student.jpg",
  "/images/istockphoto-1351445530-612x612.jpg",
  "/images/istockphoto-1874702491-612x612.jpg",
  "/images/istockphoto-2105091005-612x612.jpg"
];

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Ganti foto setiap 5 detik
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white leading-tight">
            Temukan Beasiswa yang Paling Sesuai dengan Profilmu dalam Hitungan Detik
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10">
            Upload CV kamu, biarkan AI kami menganalisisnya, dan dapatkan rekomendasi terpersonalisasi dari 1.140+ program beasiswa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-accent hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors text-lg">
              Mulai Cari Beasiswa
            </Link>
            <Link to="/browse" className="bg-transparent border border-white hover:bg-white hover:text-primary text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg">
              Lihat Beasiswa
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-bg">
        <div className="container mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Cara Kerja ScholarPath</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-border">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-accent">
                <Upload size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload CV</h3>
              <p className="text-muted">Upload dokumen CV akademikmu dalam format PDF.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-border">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-accent">
                <Cpu size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analisis</h3>
              <p className="text-muted">Sistem mengekstrak kata kunci, jenjang, dan keahlianmu secara otomatis.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-border">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-accent">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Temukan Match</h3>
              <p className="text-muted">Dapatkan ranking beasiswa dengan skor kecocokan tertinggi.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-border">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-accent">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Apply</h3>
              <p className="text-muted">Daftar ke program beasiswa impianmu tanpa buang waktu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Galeri Mahasiswa Carousel */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold mb-4">Bersama Menuju Masa Depan</h2>
            <p className="text-muted max-w-2xl mx-auto">Temukan inspirasi dari ribuan mahasiswa yang telah memanfaatkan ScholarPath untuk mengejar impian akademis mereka di seluruh dunia.</p>
          </div>

          <div className="max-w-4xl mx-auto relative rounded-2xl overflow-hidden shadow-2xl group">
            {/* Aspect Ratio Container */}
            <div className="relative aspect-[16/9] w-full bg-gray-100">
              {carouselImages.map((src, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                  <img
                    src={src}
                    alt={`Mahasiswa inspiratif ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle Gradient Overlay for Text Readability if needed later */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-50"></div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-surface">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-mono font-bold text-primary mb-2">1,140+</div>
              <div className="text-muted font-medium">Program Beasiswa</div>
            </div>
            <div>
              <div className="text-4xl font-mono font-bold text-primary mb-2">10+</div>
              <div className="text-muted font-medium">Negara Tujuan</div>
            </div>
            <div>
              <div className="text-4xl font-mono font-bold text-primary mb-2">S1, S2, S3</div>
              <div className="text-muted font-medium">Jenjang Tersedia</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-display font-bold mb-6">Jangan Lewatkan Kesempatan Emas</h2>
        <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">Bergabung dengan ScholarPath sekarang dan temukan beasiswa yang selama ini kamu cari.</p>
        <Link to="/register" className="bg-accent hover:bg-blue-600 text-white font-semibold py-3 px-10 rounded-lg shadow-lg transition-colors text-lg">
          Daftar Sekarang Gratis
        </Link>
      </section>
    </div>
  );
};

export default Landing;
