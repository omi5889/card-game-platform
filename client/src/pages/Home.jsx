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
    <div style={{ padding: "2rem" }}>
      <h1>🃏 Multiplayer Card Game</h1>
      <input
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <button onClick={handleCreate}>Create Room</button>
      <button onClick={handleJoin}>Join Room</button>
    </div>
  );
}
