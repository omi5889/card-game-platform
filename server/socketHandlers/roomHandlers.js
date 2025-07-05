function createRoom() {}
function joinRoom(socket, io, rooms, roomId, username, callback) {
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
function leaveRoom(socket, io, rooms) {
  console.log(`❌ User disconnected: ${socket.id}`);
  // Remove player from all rooms
  for (const roomId in rooms) {
    const room = rooms[roomId];
    room.players = room.players.filter((p) => p.id !== socket.id);
    io.to(roomId).emit("room-update", room.players);
  }
}

module.exports = { createRoom, joinRoom, leaveRoom };
