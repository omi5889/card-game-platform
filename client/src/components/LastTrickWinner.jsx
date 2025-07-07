import React from "react";

export default function LastTrickWinner({ lastTrickWinner }) {
  if (!lastTrickWinner) return null;

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "1rem",
        fontSize: "0.9rem",
        backgroundColor: "#d9ae8e", // accent
        padding: "0.75rem",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        color: "#232220", // dark text
      }}
    >
      <div>
        🏆 <strong>{lastTrickWinner.winner}</strong> won the last trick with{" "}
        <strong>{lastTrickWinner.card}</strong>
      </div>

      {lastTrickWinner.tensCaptured.length > 0 && (
        <div
          style={{
            marginTop: "0.5rem",
            color: "#b91c1c", // strong red for tens
            fontWeight: "600",
          }}
        >
          🔟 Captured Ten(s):{" "}
          {lastTrickWinner.tensCaptured.map((ten) => ten.card).join(", ")}
        </div>
      )}
    </div>
  );
}
