import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Group from './pages/Group';
import NotFound from './pages/NotFound';
import { SoundProvider } from './components/SoundManager';
import { TerminalProvider } from './components/TerminalContext';

function App() {
  return (
    <SoundProvider>
      <TerminalProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/group/:groupId" element={<Group />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TerminalProvider>
    </SoundProvider>
  );
}

export default App;
