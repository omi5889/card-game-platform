import React from "react";
import Card from "./Card";

export default function Hand({ hand, onPlayCard, isTurn }) {
  return (
    <div>
      <h3>Your Hand:</h3>
      <div style={{ display: "flex", gap: "8px" }}>
        {hand.map((card) => (
          <Card
            key={card}
            card={card}
            onClick={() => isTurn && onPlayCard(card)}
            disabled={!isTurn}
          />
        ))}
      </div>
    </div>
  );
}
