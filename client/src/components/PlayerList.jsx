import React from "react";
import TrickDisplay from "./TrickDisplay";

export default function PlayerList({ players, currentTurnId, trick }) {
  if (players.length !== 4) {
    return <p>Waiting for 4 players to start the game...</p>;
  }

  const teamA = [players[0], players[2]];
  const teamB = [players[1], players[3]];

  const playerStyle = (isCurrent) => ({
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    backgroundColor: isCurrent ? "#d9ae8e" : "#4e4c4f",
    color: isCurrent ? "#232220" : "#ffddba",
    fontWeight: isCurrent ? "700" : "400",
    textAlign: "center",
    boxShadow: isCurrent ? "0 0 8px 2px #d9ae8e" : "none",
    transition: "all 0.3s ease",
    userSelect: "none",
    minWidth: "6rem",
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        gridTemplateRows: "1fr 2fr 1fr",
        gap: "1rem",
        alignItems: "center",
        justifyItems: "center",
        padding: "1rem",
        backgroundColor: "#232220",
        borderRadius: "0.75rem",
        color: "#ffddba",
      }}
    >
      {/* Top - Team A player 1 */}
      <div style={{ gridColumn: 2, gridRow: 1 }}>
        <div style={playerStyle(teamA[0].id === currentTurnId)}>
          {teamA[0].username}
        </div>
      </div>

      {/* Left - Team B player 1 */}
      <div style={{ gridColumn: 1, gridRow: 2 }}>
        <div style={playerStyle(teamB[1].id === currentTurnId)}>
          {teamB[1].username}
        </div>
      </div>

      {/* Center - TrickDisplay */}
      <div style={{ gridColumn: 2, gridRow: 2 }}>
        <TrickDisplay trick={trick} />
      </div>

      {/* Right - Team B player 2 */}
      <div style={{ gridColumn: 3, gridRow: 2 }}>
        <div style={playerStyle(teamB[0].id === currentTurnId)}>
          {teamB[0].username}
        </div>
      </div>

      {/* Bottom - Team A player 2 */}
      <div style={{ gridColumn: 2, gridRow: 3 }}>
        <div style={playerStyle(teamA[1].id === currentTurnId)}>
          {teamA[1].username}
        </div>
      </div>
    </div>
  );
}
