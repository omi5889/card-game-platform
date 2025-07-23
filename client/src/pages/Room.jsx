// src/pages/Room.jsx
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket";
import { useJoinRoom } from "../hooks/useJoinRoom";

import PlayerList from "../components/PlayerList";
import Hand from "../components/Hand";
import TrumpChooser from "../components/TrumpChooser";
import LastTrickWinner from "../components/LastTrickWinner";
import RoundResult from "../components/RoundResult";
import TeamScores from "../components/TeamScores";
import ShareLink from "../components/ShareLink";

export default function Room() {
  const { state } = useLocation();
  const { roomId } = useParams();
  const initialUsername = state?.username || null;
  const { players, username } = useJoinRoom(roomId, initialUsername);

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
  const [selectedCard, setSelectedCard] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    socket.on("deal-cards", setHand);
    socket.on("game-started", () => {
      alert("Game has started!");
      setIsGameStarted(true);
    });
    socket.on("test-event", () => setTestFlag((prev) => !prev));

    return () => {
      socket.off("deal-cards");
      socket.off("game-started");
      socket.off("test-event");
    };
  }, []);

  useEffect(() => {
    socket.on("turn-update", setCurrentTurnId);
    return () => socket.off("turn-update");
  }, []);

  useEffect(() => {
    socket.on("card-played", ({ playerName, playerId, card }) => {
      setTrick((prev) => [...prev, { playerName, playerId, card }]);
    });
    socket.on("trick-complete", setTrick);
    return () => {
      socket.off("card-played");
      socket.off("trick-complete");
    };
  }, []);

  useEffect(() => {
    socket.on("trick-winner", () => setTrick([]));
    return () => socket.off("trick-winner");
  }, []);

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

  useEffect(() => {
    socket.on("connect", () => setMyId(socket.id));
    socket.on("waiting-for-trump", setTrumpChooserId);
    return () => {
      socket.off("connect");
      socket.off("waiting-for-trump");
    };
  }, []);

  useEffect(() => {
    socket.on("update-hand", setHand);
    return () => socket.off("update-hand");
  }, []);

  useEffect(() => {
    socket.on("score-update", ({ teamTens, teamTricks }) => {
      setTeamScores({ teamTens, teamTricks });
    });
    return () => socket.off("score-update");
  }, []);

  useEffect(() => {
    socket.on("trick-winner", ({ winnerUsername, card, tensCaptured }) => {
      setLastTrickWinner({ winner: winnerUsername, card, tensCaptured });
    });
    return () => socket.off("trick-winner");
  }, []);

  useEffect(() => {
    socket.on("round-end", setRoundResult);
    socket.on("round-restarting", () => {
      setTrick([]);
      setHand([]);
      setLastTrickWinner(null);
      setSelectedCard(null);
      setRoundResult((prev) => ({ ...prev, result: null }));
      setTeamScores({ teamTens: [0, 0], teamTricks: [0, 0] });
      setTrumpSuit(null);
      setTrumpChooserName(null);
      setIsGameStarted(false);
    });
    return () => {
      socket.off("round-end");
      socket.off("round-restarting");
    };
  }, []);

  useEffect(() => {
    socket.on("start-game", () => {
      setIsGameStarted(true);
    });
    return () => socket.off("start-game");
  }, []);

  useEffect(() => {
    socket.on("game-restarted", () => {
      setTrick([]);
      setHand([]);
      setLastTrickWinner(null);
      setSelectedCard(null);
      setRoundResult(null);
      setTeamScores({ teamTens: [0, 0], teamTricks: [0, 0] });
      setTrumpSuit(null);
      setTrumpChooserName(null);
      setIsGameStarted(false);
    });

    return () => socket.off("game-restarted");
  }, []);

  const playCard = (card) => {
    if (socket.id !== currentTurnId) return;
    socket.emit("play-card", { roomId, card });
  };

  return (
    <div className="p-6 space-y-4 min-h-screen bg-[#232220] text-[#ffddba]">
      <div style={{ padding: "2rem", margin: "0 auto", maxWidth: "960px" }}>
        <h2 className="text-xl font-bold">Room ID: {roomId}</h2>
        <ShareLink roomId={roomId} hostId={players[0]?.id} />
        <h3 className="text-lg">User: {username}</h3>

        <PlayerList
          players={players}
          currentTurnId={currentTurnId}
          trick={trick}
        />

        {players.length === 4 && !isGameStarted && !roundResult && (
          <button
            onClick={() => socket.emit("start-game", { roomId })}
            className="bg-[#d9ae8e] hover:bg-[#ffddba] text-[#232220] font-semibold py-2 px-4 rounded transition"
          >
            Start Game
          </button>
        )}

        {trumpChooserId && (
          <p className="text-md italic">
            Trump will be selected by:{" "}
            <span className="font-semibold">
              {trumpChooserId === myId ? "You" : trumpChooserId.slice(0, 5)}
            </span>
          </p>
        )}

        {trumpSuit && trumpChooserName && (
          <p className="text-md">
            <strong>Trump Suit:</strong> {trumpSuit} (chosen by{" "}
            {trumpChooserName})
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

        <LastTrickWinner lastTrickWinner={lastTrickWinner} />
        <RoundResult roomId={roomId} roundResult={roundResult} />
        <TeamScores teamScores={teamScores} />
      </div>
    </div>
  );
}
