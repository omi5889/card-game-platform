const { rooms } = require("../state/roomStore");

function createRoom(gameType, roundTarget, callback) {
  const roomId = Math.random().toString(36).substring(2, 6);
  rooms[roomId] = {
    gameType,
    players: [],
    roundTarget: roundTarget || 5, // Default to best of 5
    trickCount: 0,
    teamTens: [0, 0], // Team 0 and Team 1
    teamTricks: [0, 0], // Team 0 and Team 1
    trumpSuit: null,
    trick: [],
    deck: null,
    trumpChooserIndex: 0, // Index of player who chooses trump
    currentTurn: 0, // Index of current player in room.players
    trickLeader: 0, // Index of player who leads the trick
    roundsWon: [0, 0], // Team 0, Team 1 rounds won
    hands: {}, // Player hands will be stored here
  };
  callback({ roomId });
  console.log(`✅ Room created: ${roomId} (${gameType})`);
}
function joinRoom(socket, io, roomId, username, callback) {
  const room = rooms[roomId];
  if (!room) return callback({ error: "Room not found" });
  if (room.players.length >= 4) return callback({ error: "Room is full" });

  const player = {
    id: socket.id,
    username,
    position: room.players.length, // Assign fixed position 0,1,2,3 in order of joining
  };

  room.players.push(player);
  socket.join(roomId);
  io.to(roomId).emit("room-update", room.players);
  callback({ success: true, players: room.players });
}
function leaveRoom(socket, io) {
  console.log(`❌ User disconnected: ${socket.id}`);
  // Remove player from all rooms
  for (const roomId in rooms) {
    const room = rooms[roomId];
    room.players = room.players.filter((p) => p.id !== socket.id);
    io.to(roomId).emit("room-update", room.players);
  }
}

module.exports = { createRoom, joinRoom, leaveRoom };
