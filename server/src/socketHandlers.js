import { v4 as uuidv4 } from 'uuid';
import * as store from './sessionStore.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Create a new session
    socket.on('create-session', ({ name }, callback) => {
      const sessionId = uuidv4().slice(0, 8);
      const participantId = uuidv4();
      
      store.createSession(sessionId);
      
      const participant = {
        id: participantId,
        name,
        socketId: socket.id
      };
      
      store.addParticipant(sessionId, participant);
      socket.join(sessionId);
      
      const session = store.getSession(sessionId);
      callback({ 
        success: true, 
        sessionId, 
        participantId,
        session 
      });
    });

    // Join an existing session
    socket.on('join-session', ({ sessionId, name, participantId }, callback) => {
      const session = store.getSession(sessionId);
      
      if (!session) {
        callback({ success: false, error: 'Session not found' });
        return;
      }

      const newParticipantId = participantId || uuidv4();
      const participant = {
        id: newParticipantId,
        name,
        socketId: socket.id
      };
      
      store.addParticipant(sessionId, participant);
      socket.join(sessionId);
      
      // Notify others that someone joined
      socket.to(sessionId).emit('participant-joined', { participant });
      
      callback({ 
        success: true, 
        participantId: newParticipantId,
        session: store.getSession(sessionId)
      });
    });

    // Add a card
    socket.on('add-card', ({ sessionId, columnId, content }, callback) => {
      const result = store.findSessionBySocketId(socket.id);
      if (!result) {
        callback({ success: false, error: 'Not in a session' });
        return;
      }

      const card = {
        id: uuidv4(),
        content,
        authorId: result.participant.id,
        revealed: false
      };

      const added = store.addCard(sessionId, columnId, card);
      if (added) {
        io.to(sessionId).emit('card-added', { columnId, card });
        callback({ success: true, card });
      } else {
        callback({ success: false, error: 'Failed to add card' });
      }
    });

    // Update a card
    socket.on('update-card', ({ sessionId, columnId, cardId, content }, callback) => {
      const result = store.findSessionBySocketId(socket.id);
      if (!result) {
        callback({ success: false, error: 'Not in a session' });
        return;
      }

      const updated = store.updateCard(sessionId, columnId, cardId, { content });
      if (updated) {
        io.to(sessionId).emit('card-updated', { columnId, cardId, content });
        callback({ success: true });
      } else {
        callback({ success: false, error: 'Failed to update card' });
      }
    });

    // Delete a card
    socket.on('delete-card', ({ sessionId, columnId, cardId }, callback) => {
      const deleted = store.deleteCard(sessionId, columnId, cardId);
      if (deleted) {
        io.to(sessionId).emit('card-deleted', { columnId, cardId });
        callback({ success: true });
      } else {
        callback({ success: false, error: 'Failed to delete card' });
      }
    });

    // Reveal a single card
    socket.on('reveal-card', ({ sessionId, columnId, cardId }, callback) => {
      const revealed = store.revealCard(sessionId, columnId, cardId);
      if (revealed) {
        io.to(sessionId).emit('card-revealed', { columnId, cardId });
        callback({ success: true });
      } else {
        callback({ success: false, error: 'Failed to reveal card' });
      }
    });

    // Reveal all cards
    socket.on('reveal-all', ({ sessionId }, callback) => {
      const session = store.revealAllCards(sessionId);
      if (session) {
        io.to(sessionId).emit('all-cards-revealed');
        callback({ success: true });
      } else {
        callback({ success: false, error: 'Failed to reveal all cards' });
      }
    });

    // Add a column
    socket.on('add-column', ({ sessionId, name }, callback) => {
      const column = {
        id: uuidv4(),
        name,
        cards: []
      };

      const added = store.addColumn(sessionId, column);
      if (added) {
        io.to(sessionId).emit('column-added', { column });
        callback({ success: true, column });
      } else {
        callback({ success: false, error: 'Failed to add column' });
      }
    });

    // Update a column
    socket.on('update-column', ({ sessionId, columnId, name }, callback) => {
      const updated = store.updateColumn(sessionId, columnId, { name });
      if (updated) {
        io.to(sessionId).emit('column-updated', { columnId, name });
        callback({ success: true });
      } else {
        callback({ success: false, error: 'Failed to update column' });
      }
    });

    // Delete a column
    socket.on('delete-column', ({ sessionId, columnId }, callback) => {
      const deleted = store.deleteColumn(sessionId, columnId);
      if (deleted) {
        io.to(sessionId).emit('column-deleted', { columnId });
        callback({ success: true });
      } else {
        callback({ success: false, error: 'Failed to delete column' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      const result = store.findSessionBySocketId(socket.id);
      if (result) {
        const { session, participant } = result;
        store.removeParticipant(session.id, participant.id);
        io.to(session.id).emit('participant-left', { participantId: participant.id });
      }
    });
  });
}
