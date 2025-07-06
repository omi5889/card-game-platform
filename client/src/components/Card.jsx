// src/components/Card.jsx
import React from "react";

const suitSymbols = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};

const suitColors = {
  S: "black",
  C: "black",
  H: "red",
  D: "red",
};

export default function Card({ card, onClick, disabled }) {
  if (!card) return null;

  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  const color = suitColors[suit];

  return (
    <div
      onClick={disabled ? undefined : () => onClick(card)}
      style={{
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
        border: "1.5px solid #333",
        borderRadius: "8px",
        width: "60px",
        height: "90px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "6px",
        backgroundColor: "white",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
        color,
        fontWeight: "bold",
        fontSize: "18px",
        textAlign: "center",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(-10px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div>{rank}</div>
      <div style={{ fontSize: "28px", lineHeight: "0.7" }}>
        {suitSymbols[suit]}
      </div>
      <div style={{ transform: "rotate(180deg)" }}>{rank}</div>
    </div>
  );
}
