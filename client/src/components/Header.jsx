import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export default function Header() {
  const navigate = useNavigate();
  const { session, isConnected, participantName, leaveSession } = useSession();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?join=${session?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    leaveSession();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>Retrospective</h1>
        {session && (
          <span className="session-id">#{session.id}</span>
        )}
      </div>

      <div className="header-right">
        <div className="participants">
          <span>Participants:</span>
          <span className="participants-count">{session?.participants?.length || 0}</span>
        </div>

        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : ''}`}></span>
          <span>{participantName}</span>
        </div>

        <button className="btn btn-secondary btn-small" onClick={handleCopyLink}>
          {copied ? 'Copied!' : 'Share Link'}
        </button>

        <button className="btn btn-secondary btn-small" onClick={handleLeave}>
          Leave
        </button>
      </div>
    </header>
  );
}
