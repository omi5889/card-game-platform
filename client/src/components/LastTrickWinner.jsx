import React from "react";

export default function LastTrickWinner({ lastTrickWinner }) {
  if (!lastTrickWinner) return null;

  return (
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
  );
}
