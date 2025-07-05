const { getSuit, getRank } = require("../utils/cardUtils");
const { rooms } = require("../state/roomStore"); // Import rooms from shared state

function playCard(socket, io, roomId, card) {
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
}

function trumpSelected(socket, io, roomId, suit) {
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
}

module.exports = { playCard, trumpSelected };
