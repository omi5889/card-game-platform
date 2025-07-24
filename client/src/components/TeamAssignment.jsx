// src/components/TeamAssignment.jsx
import React from "react";

export default function TeamAssignment({
  players,
  teamMap,
  setTeamMap,
  hostId,
  myId,
}) {
  if (myId !== hostId) return null;

  const handleTeamChange = (playerId, newTeam) => {
    setTeamMap((prev) => ({ ...prev, [playerId]: newTeam }));
  };

  return (
    <div className="bg-yellow-100 p-4 rounded shadow-md mb-4 text-black">
      <h3 className="font-bold mb-2">Assign Teams</h3>
      <ul className="space-y-2">
        {players.map((player) => (
          <li key={player.id} className="flex items-center justify-between">
            <span>{player.username}</span>
            <div className="space-x-2">
              <button
                onClick={() => handleTeamChange(player.id, 0)}
                className={`px-2 py-1 rounded ${
                  teamMap[player.id] === 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Team 1
              </button>
              <button
                onClick={() => handleTeamChange(player.id, 1)}
                className={`px-2 py-1 rounded ${
                  teamMap[player.id] === 1
                    ? "bg-red-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Team 2
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
