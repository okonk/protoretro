import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import Card from './Card';

export default function Column({ column }) {
  const { updateColumn, deleteColumn, addCard, participantId } = useSession();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardContent, setNewCardContent] = useState('');

  const handleUpdateName = async () => {
    if (editName.trim() && editName !== column.name) {
      try {
        await updateColumn(column.id, editName.trim());
      } catch (err) {
        console.error('Failed to update column:', err);
      }
    }
    setIsEditing(false);
  };

  const handleDeleteColumn = async () => {
    if (window.confirm(`Delete "${column.name}" and all its cards?`)) {
      try {
        await deleteColumn(column.id);
      } catch (err) {
        console.error('Failed to delete column:', err);
      }
    }
  };

  const handleAddCard = async () => {
    if (!newCardContent.trim()) return;
    
    try {
      await addCard(column.id, newCardContent.trim());
      setNewCardContent('');
      setIsAddingCard(false);
    } catch (err) {
      console.error('Failed to add card:', err);
    }
  };

  const hiddenCount = column.cards.filter(
    card => !card.revealed && card.authorId !== participantId
  ).length;

  return (
    <div className="column">
      <div className="column-header">
        {isEditing ? (
          <input
            type="text"
            className="column-title-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleUpdateName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateName();
              if (e.key === 'Escape') {
                setEditName(column.name);
                setIsEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <h3 className="column-title" onClick={() => setIsEditing(true)}>
            {column.name}
          </h3>
        )}
        
        {hiddenCount > 0 && (
          <span className="hidden-count">{hiddenCount} hidden</span>
        )}
        
        <div className="column-actions">
          <button 
            className="btn-icon" 
            onClick={() => setIsEditing(true)}
            title="Edit column name"
          >
            ✏️
          </button>
          <button 
            className="btn-icon" 
            onClick={handleDeleteColumn}
            title="Delete column"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="column-cards">
        {column.cards.map(card => (
          <Card key={card.id} card={card} columnId={column.id} />
        ))}

        {isAddingCard && (
          <div className="card">
            <textarea
              className="card-textarea"
              value={newCardContent}
              onChange={(e) => setNewCardContent(e.target.value)}
              placeholder="Enter your thoughts..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleAddCard();
                if (e.key === 'Escape') {
                  setNewCardContent('');
                  setIsAddingCard(false);
                }
              }}
            />
            <div className="card-form-actions">
              <button className="btn btn-small btn-secondary" onClick={() => {
                setNewCardContent('');
                setIsAddingCard(false);
              }}>
                Cancel
              </button>
              <button className="btn btn-small btn-primary" onClick={handleAddCard}>
                Add Card
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="column-footer">
        <button 
          className="add-card-btn"
          onClick={() => setIsAddingCard(true)}
        >
          + Add a card
        </button>
      </div>
    </div>
  );
}
