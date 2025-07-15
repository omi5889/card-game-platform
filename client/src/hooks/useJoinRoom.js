import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

export function useJoinRoom(roomId, initialUsername) {
  const [players, setPlayers] = useState([]);
  const [username, setUsername] = useState(initialUsername);
  const [prompted, setPrompted] = useState(false);
  const navigate = useNavigate();

  // Prompt user if no username provided
  useEffect(() => {
    if (!username && !prompted) {
      const name = prompt("Enter your name to join the room:");
      if (name) {
        setUsername(name);
        navigate(`/room/${roomId}`, { state: { username: name } });
      }
      setPrompted(true);
    }
  }, [username, prompted, roomId, navigate]);

  // Join room
  useEffect(() => {
    if (!username) return;

    socket.emit("join-room", { roomId, username }, (res) => {
      if (res.error) {
        alert(res.error);
        return;
      }
      setPlayers(res.players);
    });

    socket.on("room-update", setPlayers);
    return () => socket.off("room-update");
  }, [roomId, username]);

  return { players, username };
}
