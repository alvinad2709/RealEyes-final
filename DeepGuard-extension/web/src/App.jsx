import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import ImageDetect from './pages/ImageDetect';
import FakeNews from './pages/FakeNews';
import LiveDetect from './pages/LiveDetect';
import VideoDetect from './pages/VideoDetect';
import Awareness from './pages/Awareness';
import AIChat from './pages/AIChat';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <GoogleOAuthProvider clientId="684963872923-sri19mctkrsitioh76a4l4sisrrhdrk6.apps.googleusercontent.com">
      <AuthProvider>
      <Router>
        <div className="min-h-screen bg-deepBase text-white font-sans selection:bg-deepRed/30 flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Core Tools */}
              <Route path="/detect-image" element={
                <ProtectedRoute>
                  <ImageDetect />
                </ProtectedRoute>
              } />
              <Route path="/fake-news" element={
                <ProtectedRoute>
                  <FakeNews />
                </ProtectedRoute>
              } />
              <Route path="/live-detect" element={
                <ProtectedRoute>
                  <LiveDetect />
                </ProtectedRoute>
              } />
              
              {/* Placeholder routes for the other nav links */}
              <Route path="/detect-video" element={
                <ProtectedRoute>
                  <VideoDetect />
                </ProtectedRoute>
              } />
              <Route path="/detect-audio" element={<div className="p-20 text-center text-textMuted">Audio Detection Module Coming Soon</div>} />
              <Route path="/awareness" element={<Awareness />} />
              <Route path="/ai-chat" element={<AIChat />} />
            </Routes>
          </main>
        </div>
      </Router>

    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
