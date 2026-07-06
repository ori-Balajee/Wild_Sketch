import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket/socket";

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const [maxPlayers, setMaxPlayers] = useState(8);
  const [rounds, setRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(60);

  useEffect(() => {
    const handlePlayerJoined = (data) => {
      console.log("Player joined event received on frontend:", data);
      if (data && data.roomId) {
        navigate(`/lobby/${data.roomId}`, { state: data });
      }
    };

    socket.on("player_joined", handlePlayerJoined);

    return () => {
      socket.off("player_joined", handlePlayerJoined);
    };
  }, [navigate]);

  const createRoom = () => {
    if (!username.trim()) return;

    socket.emit("create_room", {
      hostName: username,
      settings: {
        maxPlayers,
        rounds,
        drawTime
      }
    });
  };

  const joinRoom = () => {
    if (!username.trim() || !roomId.trim()) return;

    socket.emit("join_room", {
      roomId: roomId.toUpperCase(),
      playerName: username
    });
  };

  return (
    // Background: Deep, rich moss/charcoal tone from image_eb291d.jpg
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#171e13] text-[#f4edd1] p-6 font-mono relative overflow-hidden">

      {/* BACKGROUND GRAPHIC: High-End Fine Topographic Contour Overlay Line Art */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1440 900'%3E%3Cg fill='none' stroke='%23dfba6b' stroke-width='1'%3E%3Cpath d='M 100,-100 C 300,100 250,400 600,500 C 900,600 1100,350 1300,600 C 1450,780 1200,950 1600,1000' /%3E%3Cpath d='M 150,-80 C 330,110 280,390 620,480 C 910,570 1120,330 1330,580 C 1470,750 1230,930 1620,970' /%3E%3Cpath d='M 50,-120 C 270,80 220,420 580,520 C 880,620 1080,370 1280,620 C 1430,800 1180,980 1570,1020' /%3E%3Cpath d='M 200,-50 C 370,130 320,370 650,450 C 930,530 1150,300 1370,550 C 1500,710 1270,900 1650,930' /%3E%3Cpath d='M -100,400 C 150,350 300,600 500,550 C 700,500 850,750 1100,700 C 1300,650 1250,900 1500,850' /%3E%3Cpath d='M -80,430 C 160,370 310,620 520,570 C 710,520 870,770 1120,720 C 1310,670 1270,920 1520,870' /%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Main Structural Header */}
      <div className="text-center flex flex-col items-center gap-2 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#f4edd1] uppercase select-none border-b-2 border-[#dfba6b]/40 pb-2 px-6">
          WILDSKETCH
        </h1>
      </div>

      {/* Main Container Form Card */}
      <div className="flex flex-col gap-6 w-96 bg-[#2d3625] p-8 rounded-none border border-[#dfba6b]/30 shadow-2xl relative z-10">

        {/* Profile Identity Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold tracking-wider text-[#dfba6b]">Username</label>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#f4edd1] text-[#171e13] border border-[#dfba6b] p-3 rounded-none font-bold placeholder-[#171e13]/40 tracking-wider focus:outline-none focus:ring-1 focus:ring-[#dfba6b] uppercase text-xs"
          />
        </div>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-[#dfba6b]/20"></div>
          <span className="shrink mx-3 text-[#dfba6b] text-[8px] font-black tracking-widest uppercase">Create Room</span>
          <div className="grow border-t border-[#dfba6b]/20"></div>
        </div>

        {/* Host Configuration Panel */}
        <div className="flex flex-col gap-4 bg-[#171e13]/50 p-4 border border-[#dfba6b]/20">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <label className="uppercase tracking-wider text-[#dfba6b]">Max Players</label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="bg-[#f4edd1] text-[#171e13] border border-[#dfba6b] py-1 px-2 rounded-none font-bold outline-none cursor-pointer text-xs"
            >
              {[2, 4, 6, 8, 12].map(num => <option key={num} value={num}>{num} Players</option>)}
            </select>
          </div>

          <div className="flex justify-between items-center text-[11px] font-bold">
            <label className="uppercase tracking-wider text-[#dfba6b]">Rounds</label>
            <select
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="bg-[#f4edd1] text-[#171e13] border border-[#dfba6b] py-1 px-2 rounded-none font-bold outline-none cursor-pointer text-xs"
            >
              {[2, 3, 4, 5, 8].map(num => <option key={num} value={num}>{num} Rounds</option>)}
            </select>
          </div>

          <div className="flex justify-between items-center text-[11px] font-bold">
            <label className="uppercase tracking-wider text-[#dfba6b]">Draw Time</label>
            <select
              value={drawTime}
              onChange={(e) => setDrawTime(Number(e.target.value))}
              className="bg-[#f4edd1] text-[#171e13] border border-[#dfba6b] py-1 px-2 rounded-none font-bold outline-none cursor-pointer text-xs"
            >
              <option value={30}>30s</option>
              <option value={60}>60s</option>
              <option value={90}>90s</option>
              <option value={120}>120s</option>
            </select>
          </div>

          <button
            onClick={createRoom}
            className="w-full mt-2 bg-transparent hover:bg-[#dfba6b] text-[#dfba6b] hover:text-[#171e13] font-black uppercase tracking-widest text-[10px] py-3 px-4 border border-[#dfba6b] transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            Create New Room
          </button>
        </div>

        {/* Separator Node */}
        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-[#dfba6b]/10"></div>
          <span className="shrink mx-4 text-[#dfba6b]/40 text-[9px] font-bold tracking-widest">OR</span>
          <div className="grow border-t border-[#dfba6b]/10"></div>
        </div>

        {/* Room Join Operations */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#dfba6b]">Room Code</label>
            <input
              type="text"
              placeholder="Enter Room Code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="bg-[#f4edd1] text-[#171e13] border border-[#dfba6b] p-3 rounded-none font-bold text-center tracking-widest placeholder-[#171e13]/40 focus:outline-none focus:ring-1 focus:ring-[#dfba6b] uppercase text-xs"
            />
          </div>
          <button
            onClick={joinRoom}
            className="w-full bg-[#dfba6b] hover:bg-[#ebd094] text-[#171e13] font-black uppercase tracking-widest text-[10px] py-3.5 px-4 rounded-none transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;