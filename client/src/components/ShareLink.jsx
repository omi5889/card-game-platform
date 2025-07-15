// src/components/ShareLink.jsx
import React from "react";
import { socket } from "../socket";

export default function ShareLink({ roomId, hostId }) {
  if (socket.id !== hostId) return null;

  const joinUrl = `${window.location.origin}/room/${roomId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinUrl);
  };

  return (
    <div className="mt-2 p-3 text-[#ffddba] rounded shadow max-w-lg mx-auto">
      <p className="mb-2 font-semibold">Invite others to join:</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          className="flex-1 px-2 py-1 border rounded bg-white text-black"
          value={joinUrl}
        />
        <button
          onClick={copyToClipboard}
          className="px-3 py-1 bg-[#d9ae8e] text-[#232220] font-medium rounded hover:bg-opacity-90"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
