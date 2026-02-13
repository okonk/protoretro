import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export default function JoinSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isConnected, createSession, joinSession, participantName } = useSession();
  
  const [name, setName] = useState(participantName || '');
  const [sessionId, setSessionId] = useState(searchParams.get('join') || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(searchParams.get('join') ? 'join' : 'create');

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await createSession(name.trim());
      navigate(`/session/${response.sessionId}`);
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await joinSession(sessionId.trim(), name.trim());
      navigate(`/session/${sessionId.trim()}`);
    } catch (err) {
      setError(err.message || 'Failed to join session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="join-container">
      <div className="join-card">
        <h1>Retrospective</h1>
        <p className="subtitle">Collaborate with your team in real-time</p>

        <div className="connection-status" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <span className={`status-dot ${isConnected ? 'connected' : ''}`}></span>
          <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreateSession}>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={!isConnected || isLoading}
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!isConnected || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create New Retrospective'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinSession}>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={!isConnected || isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sessionId">Session ID</label>
              <input
                type="text"
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
                disabled={!isConnected || isLoading}
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!isConnected || isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Retrospective'}
            </button>
          </form>
        )}

        <div className="divider">
          <span>or</span>
        </div>

        <button 
          className="btn btn-secondary" 
          style={{ width: '100%' }}
          onClick={() => {
            setMode(mode === 'create' ? 'join' : 'create');
            setError('');
          }}
        >
          {mode === 'create' ? 'Join Existing Session' : 'Create New Session'}
        </button>
      </div>
    </div>
  );
}
