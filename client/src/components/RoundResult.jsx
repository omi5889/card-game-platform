import React from "react";
import { socket } from "../socket";

export default function RoundResult({ roomId, roundResult }) {
  if (!roundResult) return null;

  const handleNextRound = () => {
    socket.emit("restart-round", { roomId });
  };

  return (
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
          onClick={handleNextRound}
        >
          🔁 Play Next Round
        </button>
      )}
    </div>
  );
}
