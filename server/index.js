const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { log } = require("console");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend to connect during development
    methods: ["GET", "POST"],
  },
});

const rankOrder = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

function getSuit(card) {
  return card.slice(-1); // last character: S, H, D, C
}

function getRank(card) {
  const rank = card.slice(0, -1); // everything except last char
  return rankOrder[rank];
}

function startGame(roomId) {
  console.log("🚀 Starting game in room", roomId);
  const room = rooms[roomId];
  if (!room) return;

  if (room.players.length !== 4) {
    io.to(socket.id).emit("error", "Need exactly 4 players to start");
    return;
  }

  // Ensure persistent round state
  room.roundsWon = room.roundsWon ?? [0, 0];
  room.roundTarget = room.roundTarget ?? 5;

  console.log("🎯 Starting game. Trump chooser index:", room.trumpChooserIndex);

  // 🔁 Use position to find trump chooser
  // const trumpChooser = room.players.find(
  //   (p) => p.position === room.trumpChooserIndex
  // );
  // if (!trumpChooser) {
  //   console.error(
  //     "❌ No trump chooser found for index",
  //     room.trumpChooserIndex
  //   );
  //   return;
  // }

  const trumpChooser = room.players[room.trumpChooserIndex];

  const chooserId = trumpChooser.id;

  // Build and deal deck
  let deck = createDeck();
  deck = shuffle(deck);
  const hands = {};
  for (const player of room.players) {
    hands[player.id] = deck.slice(
      player.position * 13,
      (player.position + 1) * 13
    );
  }
  room.hands = hands;
  room.deck = deck;

  // Reset round state
  room.currentTurn = room.trumpChooserIndex;
  room.trick = [];
  room.trickLeader = room.trumpChooserIndex;
  room.teamTricks = [0, 0];
  room.teamTens = [0, 0];
  room.trickCount = 0;
  room.trumpSuit = null;

  // Deal 5 cards to trump chooser
  io.to(chooserId).emit("trump-select-start", hands[chooserId].slice(0, 5));

  // Inform everyone who is choosing
  io.to(roomId).emit(
    "waiting-for-trump",
    trumpChooser.username || chooserId.slice(0, 5)
  );

  // Notify turn and game start
  const currentPlayerId = trumpChooser.id;
  io.to(roomId).emit("turn-update", currentPlayerId);
  io.to(roomId).emit("game-started");

  // ✅ Log positions for debugging
  room.players.forEach((p) =>
    console.log(
      `🧍 Player: ${p.username}, Position: ${p.position}, ID: ${p.id}`
    )
  );
}

// Store rooms and players in memory (for now)
const rooms = {};

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on("create-room", ({ gameType, roundTarget }, callback) => {
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

    console.log(`👤 ${username} joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    // Remove player from all rooms
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter((p) => p.id !== socket.id);
      io.to(roomId).emit("room-update", room.players);
    }
  });

  socket.on("restart-round", ({ roomId }) => {
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
    startGame(roomId);
  });

  socket.on("indexTest", ({ roomId }) => {
    console.log("Index test received for room:", roomId);
    console.log("Socket id:", socket.id);
    io.in(roomId)
      .fetchSockets()
      .then((sockets) => {
        console.log(
          "🔍 Sockets in room",
          roomId,
          sockets.map((s) => s.id)
        );
      });
    // io.to(socket.id).emit("test-event");
    // socket.emit("test-event");
    io.emit("test-event");
  });

  socket.on("start-game", ({ roomId }) => {
    console.log("🚀 Start button clicked in room", roomId);
    startGame(roomId); // Use shared logic
  });

  socket.on("play-card", ({ roomId, card }) => {
    const room = rooms[roomId];
    if (!room) return;

    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex !== room.currentTurn) return; // Not this player's turn

    const hand = room.hands[socket.id];
    // const cardIndex = hand.findIndex(
    //   (c) => c.suit === card.suit && c.rank === card.rank
    // );
    // if (cardIndex === -1) return; // Card not found in hand

    // // ✅ Remove card from hand
    // hand.splice(cardIndex, 1);

    const cardIndex = hand.indexOf(card);
    if (cardIndex === -1) return;
    hand.splice(cardIndex, 1);
    io.to(socket.id).emit("update-hand", hand);

    // ✅ Add to current trick
    room.trick.push({ playerId: socket.id, playerIndex, card });

    // ✅ Broadcast played card to all players
    io.to(roomId).emit("card-played", {
      playerName: room.players[playerIndex].username || socket.id.slice(0, 5),
      playerId: socket.id,
      card,
    });

    // ✅ Move to next turn or evaluate trick
    if (room.trick.length < 4) {
      // 🔁 Next player's turn
      room.currentTurn = (room.currentTurn + 1) % 4;
      const nextId = room.players[room.currentTurn].id;
      io.to(roomId).emit("turn-update", nextId);
    } else {
      // 🧠 Evaluate trick
      const trick = room.trick;
      const leadSuit = getSuit(trick[0].card);
      const trump = room.trumpSuit;

      let winningPlay = trick[0];

      for (let i = 1; i < trick.length; i++) {
        const card = trick[i].card;
        const suit = getSuit(card);
        const rank = getRank(card);

        const winningCard = winningPlay.card;
        const winningSuit = getSuit(winningCard);
        const winningRank = getRank(winningCard);

        const isTrump = suit === trump;
        const winningIsTrump = winningSuit === trump;

        const isLeadSuit = suit === leadSuit;
        const winningIsLeadSuit = winningSuit === leadSuit;

        const beatsCurrent =
          (isTrump && !winningIsTrump) ||
          (isTrump && winningIsTrump && rank > winningRank) ||
          (!isTrump && isLeadSuit && winningIsLeadSuit && rank > winningRank);

        if (beatsCurrent) {
          winningPlay = trick[i];
        }
      }

      const winnerId = winningPlay.playerId;
      const winner = room.players.find((p) => p.id === winnerId);
      const winnerIndex = room.players.findIndex((p) => p.id === winnerId);
      room.currentTurn = winnerIndex;
      room.trickLeader = winnerIndex;
      room.trick = [];

      // Optional: team & 10s tracking
      const winningTeam = winnerIndex % 2 === 0 ? 0 : 1;
      room.teamTricks[winningTeam]++;
      room.trickCount++;

      const tensInTrick = trick.filter((play) => getRank(play.card) === 10);
      room.teamTens[winningTeam] += tensInTrick.length;
      console.log("-------------");
      console.log(tensInTrick);

      io.to(roomId).emit("trick-winner", {
        winnerId,
        winnerUsername: winner.username,
        card: winningPlay.card,
        tensCaptured: tensInTrick,
      });

      io.to(roomId).emit("score-update", {
        teamTens: room.teamTens,
        teamTricks: room.teamTricks,
      });

      // End round after 13 tricks
      if (room.trickCount === 1) {
        const [team0, team1] = room.teamTens;
        let result;
        let winningTeam = null;

        if (team0 > team1) {
          result = "Team 0 wins!";
          room.roundsWon[0]++;
          winningTeam = 0;
        } else if (team1 > team0) {
          result = "Team 1 wins!";
          room.roundsWon[1]++;
          winningTeam = 1;
        } else result = "Draw!";

        const matchComplete = room.roundsWon.some(
          (wins) => wins > Math.floor(room.roundTarget / 2)
        );

        io.to(roomId).emit("round-end", {
          //   teamTens: room.teamTens,
          //   teamTricks: room.teamTricks,
          //   result,
          result:
            winningTeam !== null
              ? `Team ${winningTeam} wins the round!`
              : "Round is a draw!",
          teamTens: room.teamTens,
          teamTricks: room.teamTricks,
          roundsWon: room.roundsWon,
          roundTarget: room.roundTarget,
          matchComplete,
          matchWinner: matchComplete ? winningTeam : null,
        });

        room.trumpChooserIndex = (room.trumpChooserIndex + 1) % 4;
      } else {
        io.to(roomId).emit("turn-update", room.players[room.currentTurn].id);
      }
    }
  });

  socket.on("trump-selected", ({ roomId, suit }) => {
    const room = rooms[roomId];
    if (!room || room.trumpSuit) return;

    room.trumpSuit = suit;
    const chooser = room.players.find((p) => p.id === socket.id);

    // Reveal full hand to trump chooser
    io.to(socket.id).emit("deal-cards", room.hands[socket.id]);

    // Reveal full hands to all other players
    for (const player of room.players) {
      if (player.id !== socket.id) {
        io.to(player.id).emit("deal-cards", room.hands[player.id]);
      }
    }

    // Notify all players of the trump
    console.log(chooser);

    io.to(roomId).emit("trump-set", {
      suit,
      chooserName: chooser.username || socket.id.slice(0, 5),
    });

    // Start game — chooser plays first
    room.currentTurn = room.trumpChooserIndex;
    room.trick = [];
    room.trickLeader = room.currentTurn;

    const starterId = room.players[room.currentTurn].id;
    io.to(roomId).emit("turn-update", starterId);
  });
});

function createDeck() {
  const suits = ["S", "H", "D", "C"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  const deck = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push(rank + suit);
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const PORT = 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
