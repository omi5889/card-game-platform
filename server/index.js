const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { log } = require("console");

// const { getSuit, getRank } = require("./utils/cardUtils");
const {
  startGame,
  restartRound,
  restartGame,
} = require("./socketHandlers/roundHandlers");
const { playCard, trumpSelected } = require("./socketHandlers/gameLogic");
const {
  createRoom,
  joinRoom,
  leaveRoom,
} = require("./socketHandlers/roomHandlers");
const { join } = require("path");

const app = express();
app.use(cors());

app.get("/backendHealth", (req, res) => {
  res.send("Card game backend is running.");
});

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
    createRoom(gameType, roundTarget, callback);
  });

  socket.on("join-room", ({ roomId, username }, callback) => {
    joinRoom(socket, io, roomId, username, callback);
    console.log(`👤 ${username} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    leaveRoom(socket, io);
  });

  socket.on("start-game", ({ roomId, teamMap }) => {
    console.log("🚀 Start button clicked in room", roomId);
    startGame(io, roomId, teamMap); // Use shared logic
  });

  socket.on("restart-round", ({ roomId, teamMap }) => {
    restartRound(io, roomId, teamMap);
  });

  socket.on("restart-game", ({ roomId }) => {
    restartGame(io, roomId);
  });

  socket.on("play-card", ({ roomId, card }) => {
    console.log(" in index: calling playCard");
    playCard(socket, io, roomId, card);
  });

  socket.on("trump-selected", ({ roomId, suit }) => {
    console.log("in index: calling trumpSelected");
    trumpSelected(socket, io, roomId, suit);
  });
});

const { PORT } = require("./config");
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
