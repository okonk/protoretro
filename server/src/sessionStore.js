// In-memory session store for retrospective sessions

const sessions = new Map();

export function createSession(id, creatorName) {
  const session = {
    id,
    columns: [
      { id: 'col-1', name: 'What went well', cards: [] },
      { id: 'col-2', name: 'What could improve', cards: [] },
      { id: 'col-3', name: 'Action items', cards: [] }
    ],
    participants: [],
    createdAt: new Date()
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id) {
  return sessions.get(id);
}

export function deleteSession(id) {
  sessions.delete(id);
}

export function addParticipant(sessionId, participant) {
  const session = sessions.get(sessionId);
  if (session) {
    // Check if participant already exists (reconnecting)
    const existingIndex = session.participants.findIndex(p => p.id === participant.id);
    if (existingIndex >= 0) {
      session.participants[existingIndex] = participant;
    } else {
      session.participants.push(participant);
    }
    return session;
  }
  return null;
}

export function removeParticipant(sessionId, participantId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.participants = session.participants.filter(p => p.id !== participantId);
    return session;
  }
  return null;
}

export function addCard(sessionId, columnId, card) {
  const session = sessions.get(sessionId);
  if (session) {
    const column = session.columns.find(c => c.id === columnId);
    if (column) {
      column.cards.push(card);
      return card;
    }
  }
  return null;
}

export function updateCard(sessionId, columnId, cardId, updates) {
  const session = sessions.get(sessionId);
  if (session) {
    const column = session.columns.find(c => c.id === columnId);
    if (column) {
      const card = column.cards.find(c => c.id === cardId);
      if (card) {
        Object.assign(card, updates);
        return card;
      }
    }
  }
  return null;
}

export function deleteCard(sessionId, columnId, cardId) {
  const session = sessions.get(sessionId);
  if (session) {
    const column = session.columns.find(c => c.id === columnId);
    if (column) {
      const index = column.cards.findIndex(c => c.id === cardId);
      if (index >= 0) {
        column.cards.splice(index, 1);
        return true;
      }
    }
  }
  return false;
}

export function revealCard(sessionId, columnId, cardId) {
  return updateCard(sessionId, columnId, cardId, { revealed: true });
}

export function revealAllCards(sessionId) {
  const session = sessions.get(sessionId);
  if (session) {
    session.columns.forEach(column => {
      column.cards.forEach(card => {
        card.revealed = true;
      });
    });
    return session;
  }
  return null;
}

export function addColumn(sessionId, column) {
  const session = sessions.get(sessionId);
  if (session) {
    session.columns.push(column);
    return column;
  }
  return null;
}

export function updateColumn(sessionId, columnId, updates) {
  const session = sessions.get(sessionId);
  if (session) {
    const column = session.columns.find(c => c.id === columnId);
    if (column) {
      Object.assign(column, updates);
      return column;
    }
  }
  return null;
}

export function deleteColumn(sessionId, columnId) {
  const session = sessions.get(sessionId);
  if (session) {
    const index = session.columns.findIndex(c => c.id === columnId);
    if (index >= 0) {
      session.columns.splice(index, 1);
      return true;
    }
  }
  return false;
}

export function getParticipantBySocketId(sessionId, socketId) {
  const session = sessions.get(sessionId);
  if (session) {
    return session.participants.find(p => p.socketId === socketId);
  }
  return null;
}

export function findSessionBySocketId(socketId) {
  for (const [sessionId, session] of sessions) {
    const participant = session.participants.find(p => p.socketId === socketId);
    if (participant) {
      return { session, participant };
    }
  }
  return null;
}
