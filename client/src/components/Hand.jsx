import React from "react";
import Card from "./Card";

export default function Hand({ hand, onPlayCard, isTurn }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-[#ffddba] mb-2">Your Hand:</h3>
      <div className="flex flex-wrap gap-2">
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
