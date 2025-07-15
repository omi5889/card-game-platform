import React from "react";

export default function TeamScores({ teamScores }) {
  return (
    <div
      style={{
        marginTop: "1.5rem",
        textAlign: "center",
        color: "#ffddba", // pale
      }}
    >
      <h3 style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Team Scores</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginTop: "0.75rem",
          fontSize: "1.2rem",
        }}
      >
        {/* Team 0 */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "10px",
            backgroundColor: "#4e4c4f", // mid
            border: "2px solid #d9ae8e", // accent
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            minWidth: "160px",
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
            Team 1 (Players 1 & 3)
          </div>
          <div>Tricks: {teamScores.teamTricks[0]}</div>
          <div>Tens: {teamScores.teamTens[0]}</div>
        </div>

        {/* Team 1 */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "10px",
            backgroundColor: "#4e4c4f", // mid
            border: "2px solid #d9ae8e", // accent
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            minWidth: "160px",
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
            Team 2 (Players 2 & 4)
          </div>
          <div>Tricks: {teamScores.teamTricks[1]}</div>
          <div>Tens: {teamScores.teamTens[1]}</div>
        </div>
      </div>
    </div>
  );
}
