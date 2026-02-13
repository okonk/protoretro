import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState(null);
  const [participantId, setParticipantId] = useState(() => {
    return localStorage.getItem('participantId') || null;
  });
  const [participantName, setParticipantName] = useState(() => {
    return localStorage.getItem('participantName') || '';
  });

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SERVER_URL, {
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // Session events
    socketRef.current.on('card-added', ({ columnId, card }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map(col =>
            col.id === columnId
              ? { ...col, cards: [...col.cards, card] }
              : col
          )
        };
      });
    });

    socketRef.current.on('card-updated', ({ columnId, cardId, content }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map(col =>
            col.id === columnId
              ? {
                  ...col,
                  cards: col.cards.map(card =>
                    card.id === cardId ? { ...card, content } : card
                  )
                }
              : col
          )
        };
      });
    });

    socketRef.current.on('card-deleted', ({ columnId, cardId }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map(col =>
            col.id === columnId
              ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
              : col
          )
        };
      });
    });

    socketRef.current.on('card-revealed', ({ columnId, cardId }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map(col =>
            col.id === columnId
              ? {
                  ...col,
                  cards: col.cards.map(card =>
                    card.id === cardId ? { ...card, revealed: true } : card
                  )
                }
              : col
          )
        };
      });
    });

    socketRef.current.on('all-cards-revealed', () => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map(col => ({
            ...col,
            cards: col.cards.map(card => ({ ...card, revealed: true }))
          }))
        };
      });
    });

    socketRef.current.on('column-added', ({ column }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: [...prev.columns, column]
        };
      });
    });

    socketRef.current.on('column-updated', ({ columnId, name }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map(col =>
            col.id === columnId ? { ...col, name } : col
          )
        };
      });
    });

    socketRef.current.on('column-deleted', ({ columnId }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.filter(col => col.id !== columnId)
        };
      });
    });

    socketRef.current.on('participant-joined', ({ participant }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: [...prev.participants.filter(p => p.id !== participant.id), participant]
        };
      });
    });

    socketRef.current.on('participant-left', ({ participantId }) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.filter(p => p.id !== participantId)
        };
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const createSession = useCallback((name) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('create-session', { name }, (response) => {
        if (response.success) {
          setSession(response.session);
          setParticipantId(response.participantId);
          setParticipantName(name);
          localStorage.setItem('participantId', response.participantId);
          localStorage.setItem('participantName', name);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const joinSession = useCallback((sessionId, name) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit('join-session', { sessionId, name, participantId }, (response) => {
        if (response.success) {
          setSession(response.session);
          setParticipantId(response.participantId);
          setParticipantName(name);
          localStorage.setItem('participantId', response.participantId);
          localStorage.setItem('participantName', name);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [participantId]);

  const addCard = useCallback((columnId, content) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !session) {
        reject(new Error('Not in a session'));
        return;
      }

      socketRef.current.emit('add-card', { sessionId: session.id, columnId, content }, (response) => {
        if (response.success) {
          resolve(response.card);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [session]);

  const updateCard = useCallback((columnId, cardId, content) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !session) {
        reject(new Error('Not in a session'));
        return;
      }

      socketRef.current.emit('update-card', { sessionId: session.id, columnId, cardId, content }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [session]);

  const deleteCard = useCallback((columnId, cardId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !session) {
        reject(new Error('Not in a session'));
        return;
      }

      socketRef.current.emit('delete-card', { sessionId: session.id, columnId, cardId }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [session]);

  const revealCard = useCallback((columnId, cardId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !session) {
        reject(new Error('Not in a session'));
        return;
      }

      socketRef.current.emit('reveal-card', { sessionId: session.id, columnId, cardId }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [session]);

  const revealAll = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !session) {
        reject(new Error('Not in a session'));
        return;
      }

      socketRef.current.emit('reveal-all', { sessionId: session.id }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [session]);

  const addColumn = useCallback((name) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !session) {
        reject(new Error('Not in a session'));
        return;
      }

      socketRef.current.emit('add-column', { sessionId: session.id, name }, (response) => {
        if (response.success) {
          resolve(response.column);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [session]);

  const updateColumn = useCallback((columnId, name) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !session) {
        reject(new Error('Not in a session'));
        return;
      }

      socketRef.current.emit('update-column', { sessionId: session.id, columnId, name }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [session]);

  const deleteColumn = useCallback((columnId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !session) {
        reject(new Error('Not in a session'));
        return;
      }

      socketRef.current.emit('delete-column', { sessionId: session.id, columnId }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [session]);

  const leaveSession = useCallback(() => {
    setSession(null);
  }, []);

  const value = {
    isConnected,
    session,
    participantId,
    participantName,
    createSession,
    joinSession,
    leaveSession,
    addCard,
    updateCard,
    deleteCard,
    revealCard,
    revealAll,
    addColumn,
    updateColumn,
    deleteColumn,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
