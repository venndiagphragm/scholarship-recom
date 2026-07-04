import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Bookmark, Upload, LogOut, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      const u = localStorage.getItem('user');
      if (u) {
        try { setUser(JSON.parse(u)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync avatar from localStorage prefs
  useEffect(() => {
    const prefs = localStorage.getItem('userPrefs');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        setAvatarUrl(parsed.avatarUrl || null);
      } catch { setAvatarUrl(null); }
    }
    // Listen for prefs changes
    const handlePrefsChange = () => {
      const p = localStorage.getItem('userPrefs');
      if (p) {
        try {
          const parsed = JSON.parse(p);
          setAvatarUrl(parsed.avatarUrl || null);
        } catch { setAvatarUrl(null); }
      }
    };
    window.addEventListener('prefsChange', handlePrefsChange);
    return () => window.removeEventListener('prefsChange', handlePrefsChange);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/');
    window.dispatchEvent(new Event('storage'));
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-white/20 text-white'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`;

  return (
    <nav className="bg-primary sticky top-0 z-50 shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 flex justify-between items-center py-2 h-28">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <img
            src="/logo_cropped.png"
            alt="ScholarPath Logo"
            className="h-20 w-20 md:h-24 md:w-24 object-contain drop-shadow-xl group-hover:scale-105 transition-all duration-300"
          />
          <span className="text-4xl font-display font-bold text-white tracking-tight">
            Scholar<span className="text-accent">Path</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-1 items-center">
          <Link to="/" className={navLinkClass('/')}><Home size={16} /> Home</Link>
          <Link to="/browse" className={navLinkClass('/browse')}><Search size={16} /> Browse</Link>

          {token ? (
            <>
              <Link to="/dashboard" className={navLinkClass('/dashboard')}><Bookmark size={16} /> Dashboard</Link>
              <Link to="/upload-cv" className={navLinkClass('/upload-cv')}><Upload size={16} /> Upload CV</Link>

              {/* Profile Avatar Button */}
              <Link
                to="/profile"
                className={`ml-2 flex items-center gap-2 px-2 py-1 rounded-xl transition-all duration-200 ${
                  isActive('/profile') || isActive('/profile/edit')
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center ring-2 ring-white/40">
                      <span className="text-white text-sm font-bold">
                        {user?.nama ? user.nama[0].toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary"></span>
                </div>
                <span className="text-sm font-medium text-white/90 max-w-[80px] truncate">
                  {user?.nama?.split(' ')[0] || 'Profile'}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all duration-200"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 ml-2">
              <Link to="/login" className="px-4 py-1.5 rounded-lg border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-1.5 rounded-lg bg-accent hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-md">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-primary text-white px-2 py-2 flex justify-around border-t border-white/10 z-50 backdrop-blur-md">
        <Link to="/" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${isActive('/') ? 'text-accent' : 'text-white/70'}`}>
          <Home size={20} /><span className="text-[10px]">Home</span>
        </Link>
        <Link to="/browse" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${isActive('/browse') ? 'text-accent' : 'text-white/70'}`}>
          <Search size={20} /><span className="text-[10px]">Browse</span>
        </Link>
        {token ? (
          <>
            <Link to="/dashboard" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${isActive('/dashboard') ? 'text-accent' : 'text-white/70'}`}>
              <Bookmark size={20} /><span className="text-[10px]">Saved</span>
            </Link>
            <Link to="/profile" className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${isActive('/profile') || isActive('/profile/edit') ? 'text-accent' : 'text-white/70'}`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user?.nama ? user.nama[0].toUpperCase() : 'U'}</span>
                </div>
              )}
              <span className="text-[10px]">Profile</span>
            </Link>
          </>
        ) : (
          <Link to="/login" className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-white/70">
            <Edit size={20} /><span className="text-[10px]">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
