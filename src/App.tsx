import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Compress from './pages/Compress';
import RemoveBg from './pages/RemoveBg';
import Recognize from './pages/Recognize';
import AIGenerate from './pages/AIGenerate';
import Pricing from './pages/Pricing';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compress"
            element={
              <ProtectedRoute>
                <Compress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/remove-bg"
            element={
              <ProtectedRoute>
                <RemoveBg />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recognize"
            element={
              <ProtectedRoute>
                <Recognize />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-generate"
            element={
              <ProtectedRoute>
                <AIGenerate />
              </ProtectedRoute>
            }
          />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
