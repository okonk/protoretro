import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import Header from './Header';
import Column from './Column';

export default function Board() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { 
    session, 
    isConnected, 
    joinSession, 
    participantName,
    addColumn,
    revealAll
  } = useSession();
  
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  useEffect(() => {
    // If we have no session but have a sessionId in URL, try to join
    if (!session && sessionId && isConnected && !isJoining) {
      // Check if we have a saved name
      const savedName = localStorage.getItem('participantName');
      if (savedName) {
        setIsJoining(true);
        joinSession(sessionId, savedName)
          .catch(err => {
            setError(err.message);
            // Redirect to join page with session ID
            navigate(`/?join=${sessionId}`);
          })
          .finally(() => setIsJoining(false));
      } else {
        // Redirect to join page with session ID
        navigate(`/?join=${sessionId}`);
      }
    }
  }, [session, sessionId, isConnected, joinSession, navigate, isJoining]);

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    
    try {
      await addColumn(newColumnName.trim());
      setNewColumnName('');
      setShowAddColumn(false);
    } catch (err) {
      console.error('Failed to add column:', err);
    }
  };

  const handleRevealAll = async () => {
    if (window.confirm('Are you sure you want to reveal all cards?')) {
      try {
        await revealAll();
      } catch (err) {
        console.error('Failed to reveal all:', err);
      }
    }
  };

  if (!session) {
    return (
      <div className="join-container">
        <div className="join-card">
          <h1>Loading...</h1>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
      <div className="board">
        <div className="board-actions">
          <div className="board-actions-left">
            <button 
              className="btn btn-secondary btn-small"
              onClick={() => setShowAddColumn(true)}
            >
              + Add Column
            </button>
          </div>
          <button 
            className="btn btn-primary btn-small"
            onClick={handleRevealAll}
          >
            Reveal All Cards
          </button>
        </div>

        <div className="columns-container">
          {session.columns.map(column => (
            <Column key={column.id} column={column} />
          ))}

          {showAddColumn && (
            <div className="column">
              <div className="column-header">
                <input
                  type="text"
                  className="column-title-input"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Column name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') setShowAddColumn(false);
                  }}
                />
                <div className="column-actions">
                  <button className="btn btn-small btn-primary" onClick={handleAddColumn}>
                    Add
                  </button>
                  <button className="btn btn-small btn-secondary" onClick={() => setShowAddColumn(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
