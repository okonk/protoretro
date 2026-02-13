import { useState } from 'react';
import { useSession } from '../context/SessionContext';

export default function Card({ card, columnId }) {
  const { participantId, updateCard, deleteCard, revealCard, session } = useSession();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(card.content);

  const isOwner = card.authorId === participantId;
  const isHidden = !card.revealed && !isOwner;

  // Find author name
  const author = session?.participants?.find(p => p.id === card.authorId);
  const authorName = author?.name || 'Unknown';

  const handleUpdate = async () => {
    if (editContent.trim() && editContent !== card.content) {
      try {
        await updateCard(columnId, card.id, editContent.trim());
      } catch (err) {
        console.error('Failed to update card:', err);
      }
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this card?')) {
      try {
        await deleteCard(columnId, card.id);
      } catch (err) {
        console.error('Failed to delete card:', err);
      }
    }
  };

  const handleReveal = async () => {
    try {
      await revealCard(columnId, card.id);
    } catch (err) {
      console.error('Failed to reveal card:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="card">
        <textarea
          className="card-textarea"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) handleUpdate();
            if (e.key === 'Escape') {
              setEditContent(card.content);
              setIsEditing(false);
            }
          }}
        />
        <div className="card-form-actions">
          <button 
            className="btn btn-small btn-secondary" 
            onClick={() => {
              setEditContent(card.content);
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
          <button className="btn btn-small btn-primary" onClick={handleUpdate}>
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div className={`card-content ${isHidden ? 'card-hidden' : ''}`}>
        {card.content}
      </div>
      
      {isHidden && (
        <div className="card-hidden-overlay">
          Hidden card
        </div>
      )}

      {card.revealed && (
        <div className="card-author">
          — {authorName}
        </div>
      )}

      {/* Show actions for owner */}
      {isOwner && (
        <div className="card-actions">
          {!card.revealed && (
            <button className="btn btn-small btn-primary" onClick={handleReveal}>
              Reveal
            </button>
          )}
          <button className="btn btn-small btn-secondary" onClick={() => setIsEditing(true)}>
            Edit
          </button>
          <button className="btn btn-small btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
