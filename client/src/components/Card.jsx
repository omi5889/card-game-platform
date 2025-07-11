import React from "react";

const suitSymbols = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};

const suitColors = {
  active: {
    S: "#232220", // black-like
    C: "#232220",
    H: "#d50000", // vibrant red
    D: "#d50000",
  },
  disabled: {
    S: "#9f8d8d",
    C: "#9f8d8d",
    H: "#e6a3a3", // soft red
    D: "#e6a3a3",
  },
};

export default function Card({ card, onClick, disabled }) {
  if (!card) return null;

  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  const color = disabled ? suitColors.disabled[suit] : suitColors.active[suit];

  const baseStyle = {
    cursor: disabled ? "default" : "pointer",
    userSelect: "none",
    border: `1.5px solid ${disabled ? "#9f8d8d" : "#4e4c4f"}`,
    borderRadius: "8px",
    width: "80px",
    height: "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px",
    backgroundColor: disabled ? "#4e4c4f" : "#f2f0ed",
    boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
    color,
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "center",
    transition: "transform 0.2s ease, background-color 0.2s ease",
  };

  return (
    <div
      onClick={disabled ? undefined : () => onClick(card)}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-10px)";
          e.currentTarget.style.backgroundColor = "#f2f0ed";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.backgroundColor = disabled
          ? "#4e4c4f"
          : "#f2f0ed";
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
