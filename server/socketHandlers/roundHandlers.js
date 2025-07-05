const { createDeck, shuffle } = require("../utils/deckUtils");
const { rooms } = require("../state/roomStore");

function startGame(io, roomId) {
  console.log("🚀 Starting game in room ", roomId);
  const room = rooms[roomId];
  if (!room) return;

  if (room.players.length !== 4) {
    return;
  }

  room.roundsWon = room.roundsWon ?? [0, 0];
  room.roundTarget = room.roundTarget ?? 5;

  console.log("🎯 Starting game. Trump chooser index:", room.trumpChooserIndex);
  const trumpChooser = room.players[room.trumpChooserIndex];
  const chooserId = trumpChooser.id;

  let deck = shuffle(createDeck());
  const hands = {};
  for (const player of room.players) {
    hands[player.id] = deck.slice(
      player.position * 13,
      (player.position + 1) * 13
    );
  }

  room.hands = hands;
  room.deck = deck;
  room.currentTurn = room.trumpChooserIndex;
  room.trickLeader = room.trumpChooserIndex;
  room.trick = [];
  room.teamTricks = [0, 0];
  room.teamTens = [0, 0];
  room.trickCount = 0;
  room.trumpSuit = null;

  io.to(chooserId).emit("trump-select-start", hands[chooserId].slice(0, 5));
  io.to(roomId).emit(
    "waiting-for-trump",
    trumpChooser.username || chooserId.slice(0, 5)
  );
  io.to(roomId).emit("turn-update", chooserId);
  io.to(roomId).emit("game-started");

  room.players.forEach((p) =>
    console.log(
      `🧍 Player: ${p.username}, Position: ${p.position}, ID: ${p.id}`
    )
  );
}

function restartRound(io, roomId) {
  const room = rooms[roomId];
  if (!room) return;

  // Rotate trump chooser
  // room.trumpChooserIndex = ((room.trumpChooserIndex ?? -1) + 1) % 4;
  // room.trumpChooserIndex = (room.trumpChooserIndex + 1) % 4;

  // Reset scores/tricks
  room.trickCount = 0;
  room.teamTens = [0, 0];
  room.teamTricks = [0, 0];
  room.trick = [];
  room.trumpSuit = null;
  room.deck = null;

  io.to(roomId).emit("round-restarting");

  // ✅ Start game immediately
  startGame(io, roomId);
}

module.exports = { startGame, restartRound };
