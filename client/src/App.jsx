import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import JoinSession from './components/JoinSession';
import Board from './components/Board';
import './App.css';

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<JoinSession />} />
          <Route path="/session/:sessionId" element={<Board />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
