import React from "react";

export default function Hand({ hand, onPlayCard, isTurn }) {
  return (
    <div>
      <h3>Your Hand:</h3>
      <div style={{ display: "flex", gap: "8px" }}>
        {hand.map((card) => (
          <div
            key={card}
            onClick={() => isTurn && onPlayCard(card)}
            style={{
              border: "1px solid black",
              padding: "8px",
              cursor: isTurn ? "pointer" : "not-allowed",
              backgroundColor: isTurn ? "white" : "#f0f0f0",
            }}
          >
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}
