import React from "react";

export default function PlayerList({ players }) {
  return (
    <div>
      <h3>Players:</h3>
      <ul>
        {players.map((p, idx) => (
          <li key={p.id}>
            {idx + 1}. {p.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
