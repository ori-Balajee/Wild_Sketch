import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socket from "../socket/socket";

function Lobby() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [players, setPlayers] = useState(location.state?.players || []);
  const [isHost, setIsHost] = useState(location.state?.player?.isHost || false);

  useEffect(() => {
    // players join
    const handlePlayerJoined = (data) => {
      console.log("A new player joined the lobby:", data.players);
      setPlayers(data.players);
    };

    // players leave
    const handlePlayerLeft = (data) => {
      console.log("A player left the lobby:", data.players);
      setPlayers(data.players);

      const currentMe = data.players.find(p => p.id === socket.id);
      if (currentMe?.isHost) {
        setIsHost(true);
      }
    };

    const handleGameStarted = (data) => {
      console.log("Game is starting! Redirecting to game board...");
      navigate(`/game/${roomId}`, {
        state: {
          players: data?.players || players
        }
      });
    };

    socket.on("player_joined", handlePlayerJoined);
    socket.on("player_left", handlePlayerLeft);
    socket.on("game_started", handleGameStarted);

    return () => {
      socket.off("player_joined", handlePlayerJoined);
      socket.off("player_left", handlePlayerLeft);
      socket.off("game_started", handleGameStarted);
    };
  }, [roomId, navigate, players]);

  // Triggered only by the host
  const handleStartGame = () => {
    socket.emit("start_game", { roomId });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2d301d] text-[#f4edd1] p-4 font-serif">
      <div className="w-full max-w-md bg-[#525636] rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(20,22,12,0.5)] border-2 border-[#1c1f12] flex flex-col gap-6">

        {/* Header Block */}
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#c4b63a] font-sans mb-2">
            Game Lobby
          </h1>
          <p className="text-xs font-sans font-bold uppercase tracking-wider text-[#f4edd1]/80">
            Room Code: <span className="bg-[#f4edd1] text-[#2d301d] px-3 py-1 rounded-lg font-mono text-base font-black border border-[#1c1f12] ml-1 tracking-widest select-all shadow-[2px_2px_0px_0px_#1c1f12]">{roomId}</span>
          </p>
        </div>

        {/* Player List Container */}
        <div className="flex flex-col gap-2">
          <h2 className="text-[10px] font-bold text-[#c4b63a] uppercase tracking-widest font-sans">
            Players Connected ({players.length})
          </h2>
          <div className="flex flex-col gap-2 bg-[#1c1f12]/20 p-3 rounded-xl border border-[#1c1f12]/30 max-h-60 overflow-y-auto">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex justify-between items-center px-4 py-2.5 rounded-lg font-sans font-bold border text-sm shadow-[2px_2px_0px_0px_#1c1f12] transition-transform ${player.id === socket.id
                    ? "bg-[#c4b63a] border-[#1c1f12] text-[#2d301d]"
                    : "bg-[#f4edd1] border-[#1c1f12] text-[#2d301d]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wide">{player.playerName}</span>
                  {player.id === socket.id && (
                    <span className="text-[9px] bg-[#2d301d]/10 text-[#2d301d]/80 px-1.5 py-0.5 rounded border border-[#2d301d]/20 font-black uppercase tracking-tight">You</span>
                  )}
                </div>
                {player.isHost && (
                  <span className="text-[10px] bg-[#2d301d] text-[#c4b63a] font-black px-2 py-0.5 rounded border border-[#1c1f12] uppercase tracking-wider">
                    👑 Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={players.length < 2}
            className={`w-full py-3.5 rounded-xl font-sans font-black uppercase tracking-widest text-sm border-2 border-[#1c1f12] transition-all cursor-pointer ${players.length < 2
                ? "bg-[#525636] text-[#1c1f12]/30 border-[#1c1f12]/20 cursor-not-allowed shadow-none"
                : "bg-[#44916a] hover:bg-[#4fa378] text-[#f4edd1] shadow-[3px_3px_0px_0px_#1c1f12] active:translate-y-0.5 active:shadow-none"
              }`}
          >
            {players.length < 2 ? "Waiting for players..." : "Start Match"}
          </button>
        ) : (
          <div className="text-center py-3 bg-[#1c1f12]/20 rounded-xl border border-[#1c1f12]/10 text-xs font-sans font-bold text-[#f4edd1]/50 uppercase tracking-widest animate-pulse">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;