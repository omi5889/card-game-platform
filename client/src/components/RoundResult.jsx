import React from "react";
import { socket } from "../socket";

export default function RoundResult({ roomId, roundResult }) {
  if (!roundResult) return null;

  const handleNextRound = () => {
    socket.emit("restart-round", { roomId });
  };

  const containerStyle = {
    marginTop: "1rem",
    padding: "1.5rem",
    backgroundColor: "#9f8d8d", // soft
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    color: "#232220", // dark text
  };

  const resultStyle = {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "0.75rem",
  };

  const infoStyle = {
    fontSize: "0.95rem",
    lineHeight: "1.5",
  };

  const matchCompleteStyle = {
    marginTop: "1rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#b91c1c", // red
  };

  const buttonStyle = {
    marginTop: "1.25rem",
    padding: "0.6rem 1.2rem",
    backgroundColor: "#4e4c4f", // mid
    color: "#ffddba", // pale
    borderRadius: "8px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  };

  return (
    <div style={containerStyle}>
      {roundResult?.result && typeof roundResult.result === "string" && (
        <h2 style={resultStyle}>{roundResult.result}</h2>
      )}
      <p style={infoStyle}>
        Team 1 - Rounds Won: {roundResult.roundsWon[0]}
        <br />
        Team 2 - Rounds Won: {roundResult.roundsWon[1]}
        <br />
        Target: Best of {roundResult.roundTarget}
      </p>

      {roundResult.matchComplete ? (
        <div style={matchCompleteStyle}>
          🎉 Team {roundResult.matchWinner + 1} wins the match!
        </div>
      ) : (
        <button style={buttonStyle} onClick={handleNextRound}>
          🔁 Play Next Round
        </button>
      )}
    </div>
  );
}
