const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { log } = require("console");

// const { getSuit, getRank } = require("./utils/cardUtils");
const { startGame, restartRound } = require("./socketHandlers/roundHandlers");
const { playCard, trumpSelected } = require("./socketHandlers/gameLogic");
const {
  createRoom,
  joinRoom,
  leaveRoom,
} = require("./socketHandlers/roomHandlers");
const { join } = require("path");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend to connect during development
    methods: ["GET", "POST"],
  },
});

// Store rooms and players in memory (for now)
const rooms = {};

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on("create-room", ({ gameType, roundTarget }, callback) => {
    // createRoom(socket, io, rooms, gameType, roundTarget);
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
  });

  socket.on("join-room", ({ roomId, username }, callback) => {
    joinRoom(socket, io, rooms, roomId, username, callback);
    console.log(`👤 ${username} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    leaveRoom(socket, io, rooms);
  });

  socket.on("start-game", ({ roomId }) => {
    console.log("🚀 Start button clicked in room", roomId);
    startGame(io, rooms, roomId); // Use shared logic
  });

  socket.on("restart-round", ({ roomId }) => {
    restartRound(io, rooms, roomId);
  });

  socket.on("play-card", ({ roomId, card }) => {
    console.log(" in index: calling playCard");
    playCard(socket, io, rooms, roomId, card);
  });

  socket.on("trump-selected", ({ roomId, suit }) => {
    console.log("in index: calling trumpSelected");
    trumpSelected(socket, io, rooms, roomId, suit);
  });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
