import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    if (!username.trim()) return;

    socket.emit(
      "create-room",
      username
    );
  };

  const joinRoom = () => {
    if (!username.trim()) return;
    if (!roomId.trim()) return;

    socket.emit(
      "join-room",
      {
        roomId: roomId.toUpperCase(),
        username
      }
    );
  };

  socket.off("room-created");

  socket.on(
    "room-created",
    (room) => {
      navigate(
        `/lobby/${room.id}`,
        {
          state: room
        }
      );
    }
  );

  socket.off("room-updated");

  socket.on(
    "room-updated",
    (room) => {
      navigate(
        `/lobby/${room.id}`,
        {
          state: room
        }
      );
    }
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">

      <h1 className="text-5xl font-bold">
        Skribbl Clone
      </h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => {
          setUsername(
            e.target.value
          )
        }}
        className="border p-3 rounded w-72"
      />

      <input
        type="text"
        placeholder="Room Code"
        value={roomId}
        onChange={(e) => {
          setRoomId(
            e.target.value
          )
        }}
        className="border p-3 rounded w-72"
      />

      <div className="flex gap-4">

        <button
          onClick={createRoom}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Create Room
        </button>

        <button
          onClick={joinRoom}
          className="bg-green-600 text-white px-6 py-3 rounded"
        >
          Join Room
        </button>

      </div>

    </div>
  );
}

export default Home;