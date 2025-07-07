import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleCreate = () => {
    if (!username) return;
    socket.emit("create-room", { gameType: "dehla-pakad" }, ({ roomId }) => {
      navigate(`/room/${roomId}`, { state: { username } });
    });
  };

  const handleJoin = () => {
    const roomId = prompt("Enter Room ID");
    if (roomId && username) {
      navigate(`/room/${roomId}`, { state: { username } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#232220] text-[#ffddba]">
      <h1 className="text-3xl font-bold mb-6">🃏 Multiplayer Card Game</h1>

      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-4 p-2 w-64 rounded text-black bg-white"
      />

      <div className="flex gap-4">
        <button
          onClick={handleCreate}
          className="bg-[#d9ae8e] text-[#232220] px-4 py-2 rounded hover:bg-[#ffddba] transition"
        >
          Create Room
        </button>

        <button
          onClick={handleJoin}
          className="bg-[#9f8d8d] text-white px-4 py-2 rounded hover:bg-[#4e4c4f] transition"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
