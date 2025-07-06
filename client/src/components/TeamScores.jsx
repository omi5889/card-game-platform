import React from "react";

export default function TeamScores({ teamScores }) {
  return (
    <div className="mt-4 text-center">
      <h3 className="font-bold">Team Scores</h3>
      <div className="flex justify-center gap-6 text-sm mt-2">
        <div className="p-2 border rounded bg-blue-50">
          <div className="font-semibold">Team 0 (Players 0 & 2)</div>
          <div>Tricks: {teamScores.teamTricks[0]}</div>
          <div>Tens: {teamScores.teamTens[0]}</div>
        </div>
        <div className="p-2 border rounded bg-red-50">
          <div className="font-semibold">Team 1 (Players 1 & 3)</div>
          <div>Tricks: {teamScores.teamTricks[1]}</div>
          <div>Tens: {teamScores.teamTens[1]}</div>
        </div>
      </div>
    </div>
  );
}
