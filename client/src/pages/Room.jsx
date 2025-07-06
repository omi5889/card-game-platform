// // src/pages/Room.jsx
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket";

import PlayerList from "../components/PlayerList";
import Hand from "../components/Hand";
import TrumpChooser from "../components/TrumpChooser";
import TrickDisplay from "../components/TrickDisplay";
import TeamScores from "../components/TeamScores";
import LastTrickWinner from "../components/LastTrickWinner";
import RoundResult from "../components/RoundResult";

export default function Room() {
  const { roomId } = useParams();
  const { state } = useLocation();

  const [players, setPlayers] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [isTrumpChooser, setIsTrumpChooser] = useState(false);
  const [trumpSuit, setTrumpSuit] = useState(null);
  const [trumpChooserName, setTrumpChooserName] = useState(null);
  const [testFlag, setTestFlag] = useState(false);
  const [trick, setTrick] = useState([]);
  const [teamScores, setTeamScores] = useState({
    teamTens: [0, 0],
    teamTricks: [0, 0],
  });
  const [lastTrickWinner, setLastTrickWinner] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [trumpChooserId, setTrumpChooserId] = useState(null);
  const [myId, setMyId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null); // you used this in round-restarting

  // Join room
  useEffect(() => {
    if (!state?.username) return;

    socket.emit("join-room", { roomId, username: state.username }, (res) => {
      if (res.error) {
        alert(res.error);
        return;
      }
      setPlayers(res.players);
    });

    socket.on("room-update", setPlayers);

    return () => {
      socket.off("room-update");
    };
  }, [roomId, state?.username]);

  // Deal cards, game started, test event
  useEffect(() => {
    socket.on("deal-cards", setHand);

    socket.on("game-started", () => {
      alert("Game has started!");
    });

    socket.on("test-event", () => {
      alert("Test event received------");
      setTestFlag((prev) => !prev);
    });

    return () => {
      socket.off("deal-cards");
      socket.off("game-started");
      socket.off("test-event");
    };
  }, []);

  // Turn update
  useEffect(() => {
    socket.on("turn-update", setCurrentTurnId);

    return () => {
      socket.off("turn-update");
    };
  }, []);

  // Card played and trick completion
  useEffect(() => {
    socket.on("card-played", ({ playerName, playerId, card }) => {
      setTrick((prev) => [...prev, { playerName, playerId, card }]);
    });

    socket.on("trick-complete", (trickData) => {
      setTrick(trickData);
    });

    return () => {
      socket.off("card-played");
      socket.off("trick-complete");
    };
  }, []);

  // Trick winner resets trick display
  useEffect(() => {
    socket.on("trick-winner", () => {
      setTrick([]);
    });

    return () => {
      socket.off("trick-winner");
    };
  }, []);

  // Trump selection
  useEffect(() => {
    socket.on("trump-select-start", (fiveCards) => {
      setHand(fiveCards);
      setIsTrumpChooser(true);
    });

    socket.on("trump-set", ({ suit, chooserName }) => {
      setTrumpSuit(suit);
      setTrumpChooserName(chooserName);
    });

    return () => {
      socket.off("trump-select-start");
      socket.off("trump-set");
    };
  }, []);

  // Connect and waiting for trump chooser
  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("waiting-for-trump", (chooserId) => {
      setTrumpChooserId(chooserId);
    });

    return () => {
      socket.off("waiting-for-trump");
      socket.off("connect");
    };
  }, []);

  // Update hand
  useEffect(() => {
    socket.on("update-hand", setHand);

    return () => {
      socket.off("update-hand");
    };
  }, []);

  // Score updates
  useEffect(() => {
    socket.on("score-update", ({ teamTens, teamTricks }) => {
      setTeamScores({ teamTens, teamTricks });
    });

    return () => socket.off("score-update");
  }, []);

  // Last trick winner display
  useEffect(() => {
    socket.on("trick-winner", ({ winnerUsername, card, tensCaptured }) => {
      setLastTrickWinner({
        winner: winnerUsername,
        card,
        tensCaptured,
      });
    });

    return () => socket.off("trick-winner");
  }, []);

  // Round end and round restarting
  useEffect(() => {
    socket.on("round-end", (data) => {
      console.log("🖥️ round-end received:", data);
      setRoundResult(data);
    });

    socket.on("round-restarting", () => {
      console.log("🔄 Round is restarting, resetting UI state");
      setTrick([]);
      setHand([]);
      setLastTrickWinner(null);
      setSelectedCard(null);
      // setRoundResult(null);
      setRoundResult((prev) => ({
        ...prev,
        result: null,
      }));
      setTeamScores({ teamTens: [0, 0], teamTricks: [0, 0] });
      setTrumpSuit(null);
      setTrumpChooserName(null);
    });

    return () => {
      socket.off("round-end");
      socket.off("round-restarting");
    };
  }, []);

  // Start game log
  useEffect(() => {
    socket.on("start-game", ({ roomId }) => {
      console.log("🎯 Received start-game for", roomId);
      // You can add any UI reset here if needed
    });

    return () => socket.off("start-game");
  }, []);

  // Play card helper
  function playCard(card) {
    if (socket.id !== currentTurnId) return;
    socket.emit("play-card", { roomId, card });
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Room ID: {roomId}</h2>
      <h3>User: {state.username}</h3>

      <PlayerList players={players} />

      {/* Hide Start Game button during active round */}
      {players.length === 4 && !roundResult && (
        <button onClick={() => socket.emit("start-game", { roomId })}>
          Start Game
        </button>
      )}

      {trumpChooserId && (
        <p>
          Trump will be selected by:{" "}
          {trumpChooserId === myId ? "You" : trumpChooserId.slice(0, 5)}
        </p>
      )}

      {trumpSuit && trumpChooserName && (
        <p>
          <strong>Trump Suit:</strong> {trumpSuit} (chosen by {trumpChooserName}
          )
        </p>
      )}

      <Hand
        hand={hand}
        onPlayCard={playCard}
        isTurn={socket.id === currentTurnId}
      />

      {isTrumpChooser && (
        <TrumpChooser
          roomId={roomId}
          socket={socket}
          onSuitSelected={() => setIsTrumpChooser(false)}
        />
      )}

      <TrickDisplay trick={trick} />

      <TeamScores teamScores={teamScores} />

      <LastTrickWinner lastTrickWinner={lastTrickWinner} />

      {/* Round result summary */}
      <RoundResult roomId={roomId} roundResult={roundResult} />
    </div>
  );
}
