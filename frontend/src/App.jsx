import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadCV from './pages/UploadCV';
import RecommendationResults from './pages/RecommendationResults';
import ScholarshipDetail from './pages/ScholarshipDetail';
import Browse from './pages/Browse';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-bg">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload-cv" element={<UploadCV />} />
            <Route path="/recommendations" element={<RecommendationResults />} />
            <Route path="/scholarship/:id" element={<ScholarshipDetail />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
