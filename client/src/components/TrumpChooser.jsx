import React from "react";

export default function TrumpChooser({ roomId, socket, onSuitSelected }) {
  const suits = [
    { symbol: "♥", value: "H", color: "red" },
    { symbol: "♠", value: "S", color: "black" },
    { symbol: "♦", value: "D", color: "red" },
    { symbol: "♣", value: "C", color: "black" },
  ];

  const handleSelect = (suitValue) => {
    socket.emit("trump-selected", { roomId, suit: suitValue });
    onSuitSelected();
  };

  return (
    <div
      style={{
        backgroundColor: "#232220",
        color: "#ffddba",
        border: "2px solid #d9ae8e",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
        margin: "1rem 0",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        maxWidth: "30%",
        margin: "auto",
      }}
    >
      <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
        Select Trump Suit
      </h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        {suits.map(({ symbol, value, color }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            style={{
              backgroundColor: "#f2f0ed",
              color,
              fontWeight: "bold",
              border: "none",
              borderRadius: "10px",
              padding: "0.5rem 1.2rem",
              cursor: "pointer",
              fontSize: "3rem",
              transition: "transform 0.2s, background 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f2f0ed";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f2f0ed";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
