import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socket from "../socket/socket";

function Game() {
  console.log("My current frontend Socket ID is:", socket.id);
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [players, setPlayers] = useState(location.state?.players || []);
  const [gamePhase, setGamePhase] = useState("waiting");
  const [currentRound, setCurrentRound] = useState(1);
  const [currentDrawerId, setCurrentDrawerId] = useState(null);
  const [currentDrawerName, setCurrentDrawerName] = useState("");
  const [timer, setTimer] = useState(0);
  const [wordOptions, setWordOptions] = useState([]);
  const [displayWord, setDisplayWord] = useState("");
  const [intermissionStatus, setIntermissionStatus] = useState("");

  const amIDrawer = currentDrawerId === socket.id;

useEffect(() => {
    if (location.state?.players && gamePhase === "waiting") {
      setGamePhase("selecting");
    }

    socket.on("game_started", (data) => {
      setGamePhase("selecting");
      if (data.players) {
        setPlayers(data.players);
      }
    });

    socket.on("round_start", (data) => {
      setGamePhase("selecting");
      setCurrentDrawerId(data.drawerId);
      setCurrentDrawerName(data.drawerName);
      setCurrentRound(data.round);
      setTimer(data.drawTime);
      setIntermissionStatus("");

      if (data.drawerId === socket.id) {
        setWordOptions(data.wordOptions || []);
      } else {
        setWordOptions([]);
      }
      setDisplayWord("");
    });

    socket.on("timer_tick", (timeRemaining) => {
      setTimer(timeRemaining);
    });

    socket.on("round_end", (data) => {
      setGamePhase("intermission");
      setIntermissionStatus(`Turn ended! The correct word was: ${data.word.toUpperCase()}`);
      setDisplayWord(data.word);

      if (data.scores) {
        setPlayers(data.scores);
      }
    });

    socket.on("game_over", (data) => {
      setGamePhase("over");
      alert(`Game Over! Winner: ${data.winner?.playerName}`);
      navigate("/");
    });

    socket.on("player_joined", (data) => {
      if (data.players) setPlayers(data.players);
    });

    socket.on("player_left", (data) => {
      if (data.players) setPlayers(data.players);
    });

    return () => {
      socket.off("game_started");
      socket.off("round_start");
      socket.off("timer_tick");
      socket.off("round_end");
      socket.off("game_over");
      socket.off("player_joined");
      socket.off("player_left");
    };
  }, [navigate, roomId, players, currentDrawerId, location.state?.players, gamePhase]);

  const selectWordHandler = (chosenWord) => {
    socket.emit("word_chosen", { roomId, word: chosenWord });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6 font-sans select-none">

      <div className="w-full max-w-5xl mx-auto bg-slate-800 border border-slate-700 p-5 rounded-xl flex justify-between items-center mb-6 shadow-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-indigo-400">Room: {roomId?.toUpperCase()}</h2>
          <h3 className="text-sm text-slate-300 mt-1">Round {currentRound}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Current Phase: <span className="text-sky-400 font-semibold uppercase">{gamePhase}</span>
          </p>
        </div>

        <div className="text-2xl font-mono font-bold px-5 py-2 rounded-lg bg-slate-950 text-emerald-400 border border-slate-700">
          Time: {timer}s
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start grow">

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-md h-96">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2 mb-3">Players & Scores</h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
              {players.map((p) => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center p-3 rounded-lg text-sm font-medium border ${p.id === currentDrawerId
                    ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
                    : "bg-slate-900/60 border-slate-700/40 text-slate-300"
                    }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    {p.playerName} {p.id === currentDrawerId && "🎨"}
                  </span>
                  <strong className="text-emerald-400 font-mono">{p.score || 0} pts</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-950 rounded-xl p-8 min-h-[24rem] flex flex-col items-center justify-center border-2 border-slate-800 relative shadow-inner">

          {gamePhase === "waiting" && (
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-300">Waiting for match loop initiation...</h3>
              <p className="text-xs text-slate-500 mt-2 animate-pulse">Syncing room states across connections.</p>
            </div>
          )}

          {gamePhase === "selecting" && (
            <div className="text-center">
              {amIDrawer ? (
                <div>
                  <h3 className="text-xl font-bold text-amber-400 mb-5 tracking-wide uppercase">Your Turn! Pick a Secret Word:</h3>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {wordOptions.map((word) => (
                      <button
                        key={word}
                        onClick={() => selectWordHandler(word)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-md uppercase tracking-wider text-sm transition-all transform hover:scale-105"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-pulse">
                  <h3 className="text-lg text-indigo-300 font-medium">{currentDrawerName || "The artist"} is selecting a secret word...</h3>
                </div>
              )}
            </div>
          )}

          {gamePhase === "drawing" && (
            <div className="text-center w-full flex flex-col items-center">
              <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">
                {amIDrawer ? "🎨 YOU ARE INTERPRETING" : `👀 VIEWING ${currentDrawerName.toUpperCase()}'S COMPOSITION`}
              </p>
              <h1 className="tracking-[0.5em] font-mono text-4xl md:text-5xl font-black text-sky-400 my-4 select-text">
                {displayWord ? displayWord.toUpperCase() : ""}
              </h1>

              <div className="mt-4 w-full max-w-md h-40 border-2 border-dashed border-slate-800 bg-slate-900/40 rounded-xl flex items-center justify-center text-slate-600 text-xs font-medium">
                [ Dynamic Graphics Rendering Engine Target ]
              </div>
            </div>
          )}

          {gamePhase === "intermission" && (
            <div className="text-center max-w-sm">
              <h3 className="text-xl font-extrabold text-amber-400 leading-snug uppercase tracking-wide">{intermissionStatus}</h3>
              <p className="text-xs text-slate-500 mt-3 animate-pulse">Calculating score delta increments...</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default Game;