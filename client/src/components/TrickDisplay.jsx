import React from "react";

export default function TrickDisplay({ trick }) {
  return (
    <div>
      <h3>Current Trick:</h3>
      <ul>
        {trick.map((t, i) => (
          <li key={i}>
            {t.playerName} : {t.card}
          </li>
        ))}
      </ul>
    </div>
  );
}
