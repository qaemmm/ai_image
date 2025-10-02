import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Compress from './pages/Compress';
import RemoveBg from './pages/RemoveBg';
import Recognize from './pages/Recognize';
import AIGenerate from './pages/AIGenerate';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compress" element={<Compress />} />
        <Route path="/remove-bg" element={<RemoveBg />} />
        <Route path="/recognize" element={<Recognize />} />
        <Route path="/ai-generate" element={<AIGenerate />} />
      </Routes>
    </Router>
  );
}

export default App;
