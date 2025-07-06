import React from "react";

export default function TrumpChooser({ roomId, socket, onSuitSelected }) {
  const suits = ["S", "H", "D", "C"];

  const handleSelect = (suit) => {
    socket.emit("trump-selected", { roomId, suit });
    onSuitSelected(); // e.g., setIsTrumpChooser(false)
  };

  return (
    <div>
      <h3>Select Trump Suit</h3>
      {suits.map((suit) => (
        <button
          key={suit}
          onClick={() => handleSelect(suit)}
          className="m-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {suit}
        </button>
      ))}
    </div>
  );
}
