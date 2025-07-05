// // src/pages/Room.jsx
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket";

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

      <h3>Players:</h3>
      <ul>
        {players.map((p, idx) => (
          <li key={p.id}>
            {idx + 1}. {p.username}
          </li>
        ))}
      </ul>

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

      <h3>Your Hand:</h3>
      <div style={{ display: "flex", gap: "8px" }}>
        {hand.map((card) => (
          <div
            key={card}
            onClick={() => playCard(card)}
            style={{
              border: "1px solid black",
              padding: "8px",
              cursor: "pointer",
            }}
          >
            {card}
          </div>
        ))}
      </div>

      {isTrumpChooser && (
        <div>
          <h3>Select Trump Suit</h3>
          {["S", "H", "D", "C"].map((suit) => (
            <button
              key={suit}
              onClick={() => {
                socket.emit("trump-selected", { roomId, suit });
                setIsTrumpChooser(false);
              }}
            >
              {suit}
            </button>
          ))}
        </div>
      )}

      <h3>Current Trick:</h3>
      <ul>
        {trick.map((t, i) => (
          <li key={i}>
            {t.playerName}
            {t.playerId.slice(0, 4)}: {t.card}
          </li>
        ))}
      </ul>

      <div className="mt-4 text-center">
        <h3 className="font-bold">Team Scores</h3>
        <div className="flex justify-center gap-6 text-sm mt-2">
          <div className="p-2 border rounded bg-blue-50">
            <div className="font-semibold">Team 0 (Players 0 & 2)</div>
            <div>Tricks: {teamScores.teamTricks[0]}</div>
            <div>Tens: {teamScores.teamTens[0]}</div>
          </div>
          <div className="p-2 border rounded bg-red-50">
            <div className="font-semibold">Team 1 (Players 1 & 3)</div>
            <div>Tricks: {teamScores.teamTricks[1]}</div>
            <div>Tens: {teamScores.teamTens[1]}</div>
          </div>
        </div>
      </div>

      {lastTrickWinner && (
        <div className="text-center mt-3 text-sm bg-yellow-100 p-2 rounded shadow">
          <div>
            🏆 <strong>{lastTrickWinner.winner}</strong> won the last trick with{" "}
            <strong>{lastTrickWinner.card}</strong>
          </div>
          {lastTrickWinner.tensCaptured.length > 0 && (
            <div className="text-red-600 font-semibold mt-1">
              🔟 Captured Ten(s):{" "}
              {lastTrickWinner.tensCaptured.map((ten) => ten.card).join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Round result summary */}
      {roundResult && (
        <div className="mt-4 p-4 bg-green-100 rounded shadow text-center">
          {roundResult?.result && typeof roundResult.result === "string" && (
            <h2 className="text-xl font-bold">{roundResult.result}</h2>
          )}
          <p className="mt-2 text-sm">
            Team 0 - Rounds Won: {roundResult.roundsWon[0]}
            <br />
            Team 1 - Rounds Won: {roundResult.roundsWon[1]}
            <br />
            Target: Best of {roundResult.roundTarget}
          </p>

          {roundResult.matchComplete ? (
            <div className="mt-2 text-lg text-red-600 font-semibold">
              🎉 Team {roundResult.matchWinner} wins the match!
            </div>
          ) : (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => socket.emit("restart-round", { roomId })}
            >
              🔁 Play Next Round
            </button>
          )}
        </div>
      )}
    </div>
  );
}
