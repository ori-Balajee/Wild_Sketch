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
      navigate(`/game/${roomId}`,{state:{
        players: data?.players || players
      }});
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-wider text-indigo-400 mb-1">
            Game Lobby
          </h1>
          <p className="text-sm text-slate-400">
            Room Code: <span className="bg-slate-900 px-2.5 py-1 rounded text-emerald-400 font-mono text-base font-bold select-all tracking-widest border border-slate-700 ml-1">{roomId}</span>
          </p>
        </div>

        {/* Player List Container */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Players Connected ({players.length})
          </h2>
          <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-lg border border-slate-700 max-h-60 overflow-y-auto">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`flex justify-between items-center px-3 py-2.5 rounded-md font-medium border text-sm transition-all ${
                  player.id === socket.id 
                    ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-200" 
                    : "bg-slate-800/50 border-slate-700/50 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{player.playerName}</span>
                  {player.id === socket.id && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 font-semibold">You</span>
                  )}
                </div>
                {player.isHost && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 tracking-wide">
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
            className={`w-full py-3.5 rounded-lg font-bold shadow transition-all tracking-wide text-base cursor-pointer ${
              players.length < 2
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:shadow-lg"
            }`}
          >
            {players.length < 2 ? "Waiting for players..." : "Start Match"}
          </button>
        ) : (
          <div className="text-center py-2.5 bg-slate-900/40 rounded-lg border border-slate-700/30 text-sm text-slate-400 font-medium animate-pulse">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;