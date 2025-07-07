import React from "react";

export default function TrickDisplay({ trick }) {
  if (!trick || trick.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "#232220",
        color: "#ffddba",
        border: "2px solid #d9ae8e",
        borderRadius: "10px",
        padding: "1rem",
        marginTop: "1rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      }}
    >
      <h3 style={{ marginBottom: "0.5rem", fontSize: "1.2rem" }}>
        Current Trick
      </h3>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        {trick.map((t, i) => {
          const rank = t.card.slice(0, -1);
          const suit = t.card.slice(-1);
          const suitSymbols = { S: "♠", H: "♥", D: "♦", C: "♣" };
          const suitColors = { S: "black", C: "black", H: "red", D: "red" };
          const color = suitColors[suit];

          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                backgroundColor: "#ffddba",
                borderRadius: "8px",
                padding: "0.75rem",
                minWidth: "80px",
                color: "#232220",
              }}
            >
              <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                {t.playerName}
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color,
                }}
              >
                {rank}
                {suitSymbols[suit]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
