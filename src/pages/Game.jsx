import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import Canvas from "../components/Canvas";
import GameEnd from "../components/GameEnd";
import Chat from "../components/Chat";

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

    socket.on("round_start_drawing", (data) => {
      setGamePhase("drawing");

      if (data.drawerId === socket.id) {
        setDisplayWord(data.word);
      } else {
        setDisplayWord(data.word.replace(/[a-zA-Z]/g, "_ "));
      }
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
      if (data.players) {
        setPlayers(data.players);
      }
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
      socket.off("round_start_drawing");
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
    <div className="min-h-screen bg-[#2d301d] text-[#f4edd1] flex flex-col p-6 font-mono select-none relative tracking-tight selection:bg-[#c4b63a] selection:text-[#2d301d]">

      {/* BACKGROUND DECORATIVE GRID LINES */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#f4edd1_1px,transparent_1px),linear-gradient(to_bottom,#f4edd1_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* TACTICAL HEADER HUD CONTAINER */}
      <div className="w-full max-w-6xl mx-auto bg-[#525636] border-2 border-[#1c1f12] p-0 rounded-none flex flex-col md:flex-row justify-between items-stretch mb-6 shadow-[4px_4px_0px_0px_#1c1f12] divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#1c1f12]">
        <div className="p-4 flex-grow relative">
          <span className="absolute top-1 left-2 text-[8px] text-[#c4b63a] font-bold tracking-widest">[SYS_LOC]</span>
          <h2 className="text-lg font-black tracking-tighter uppercase pt-1">Room: {roomId?.toUpperCase()}</h2>
        </div>

        <div className="p-4 px-6 flex flex-col justify-center bg-[#1c1f12]/10 relative min-w-[200px]">
          <span className="absolute top-1 left-2 text-[8px] text-[#c4b63a] font-bold tracking-widest">[SYS_CYCLE]</span>
          <h3 className="text-xs font-black uppercase pt-1 text-[#c4b63a]">Round {currentRound}</h3>
          <p className="text-[10px] text-[#f4edd1]/70 mt-0.5">
            Current Phase: <span className="text-[#f4edd1] font-bold underline decoration-[#c4b63a] underline-offset-2">{gamePhase}</span>
          </p>
        </div>

        <div className="p-4 px-6 flex items-center bg-[#1c1f12]/20 relative min-w-[160px]">
          <span className="absolute top-1 left-2 text-[8px] text-[#c4b63a]/70 font-bold tracking-widest">[SYS_TIME]</span>
          <div className="text-xl font-black text-[#c4b63a] tracking-tight pt-1">
            Time: {timer}s
          </div>
        </div>
      </div>

      {/* THREE-COLUMN ASYMMETRIC GRID LAYER */}
      <div className={`w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr_300px] gap-6 items-start grow transition-all duration-300 ${gamePhase === "over" ? "blur-md pointer-events-none brightness-50" : ""
        }`}>

        {/* COLUMN 1: PLAYERS (Index Frame Style) */}
        <div className="bg-[#525636] border-2 border-[#1c1f12] p-4 flex flex-col shadow-[4px_4px_0px_0px_#1c1f12] h-96 relative">
          {/* Subtle Frame Corner Ticks */}
          <div className="absolute top-1 left-1 text-[8px] text-[#1c1f12]/40">┌</div>
          <div className="absolute top-1 right-1 text-[8px] text-[#1c1f12]/40">┐</div>
          <div className="absolute bottom-1 left-1 text-[8px] text-[#1c1f12]/40">└</div>
          <div className="absolute bottom-1 right-1 text-[8px] text-[#1c1f12]/40">┘</div>

          <h3 className="text-xs font-black text-[#c4b63a] uppercase tracking-wider border-b border-[#1c1f12] pb-2 mb-3 flex items-center justify-between">
            <span>// Players</span>
            <span className="text-[9px] text-[#f4edd1]/40 font-normal">LIST_V1.0</span>
          </h3>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1 grow custom-scrollbar">
            {players.map((p) => (
              <div
                key={p.id}
                className={`p-2.5 border-2 relative transition-all ${p.id === currentDrawerId
                    ? "bg-[#c4b63a] border-[#1c1f12] text-[#2d301d] font-black shadow-[2px_2px_0px_0px_#1c1f12]"
                    : "bg-[#1c1f12]/10 border-[#1c1f12]/40 text-[#f4edd1]"
                  }`}
              >
                <span className="truncate text-xs tracking-wide flex items-center gap-1.5">
                  {p.id === currentDrawerId ? (
                    <span className="text-[10px] bg-[#2d301d] text-[#c4b63a] px-1 py-0.5 font-sans">🎨</span>
                  ) : (
                    <span className="text-[#c4b63a] font-normal">›</span>
                  )}
                  {p.playerName}
                </span>
                <span className={`block text-[9px] mt-1 tracking-widest font-bold ${p.id === currentDrawerId ? "text-[#2d301d]/60" : "text-[#c4b63a]"}`}>
                  {p.score || 0} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: LARGE INTERACTIVE RADAR-CANVAS FIELD */}
        <div className="bg-[#1c1f12]/20 border-2 border-[#1c1f12] p-6 md:min-h-[26rem] h-full flex flex-col items-center justify-center relative shadow-inner">

          {/* Tactical Viewport Crosshair Accents */}
          <div className="absolute top-3 left-3 border-t-2 border-l-2 border-[#c4b63a]/40 w-3 h-3 pointer-events-none" />
          <div className="absolute top-3 right-3 border-t-2 border-r-2 border-[#c4b63a]/40 w-3 h-3 pointer-events-none" />
          <div className="absolute bottom-3 left-3 border-b-2 border-l-2 border-[#c4b63a]/40 w-3 h-3 pointer-events-none" />
          <div className="absolute bottom-3 right-3 border-b-2 border-r-2 border-[#c4b63a]/40 w-3 h-3 pointer-events-none" />

          {gamePhase === "waiting" && (
            <div className="text-center p-6 border border-dashed border-[#c4b63a]/30 max-w-xs bg-[#525636]/20">
              <h3 className="text-xs font-black uppercase text-[#f4edd1] tracking-wide">Waiting for match loop initiation...</h3>
              <p className="text-[10px] text-[#c4b63a] mt-2 animate-pulse uppercase tracking-widest">Syncing room states across connections.</p>
            </div>
          )}

          {gamePhase === "selecting" && (
            <div className="text-center w-full max-w-sm z-10">
              {amIDrawer ? (
                <div className="bg-[#525636] border-2 border-[#1c1f12] p-5 shadow-[4px_4px_0px_0px_#1c1f12]">
                  <h3 className="text-xs font-black text-[#c4b63a] mb-4 tracking-wider uppercase text-left border-b border-[#1c1f12] pb-2">
                    [!] Your Turn! Pick a Secret Word:
                  </h3>
                  <div className="flex flex-col gap-2">
                    {wordOptions.map((word) => (
                      <button
                        key={word}
                        onClick={() => selectWordHandler(word)}
                        className="bg-[#c4b63a] hover:bg-[#d8c943] text-[#2d301d] font-black py-2 px-4 border-2 border-[#1c1f12] shadow-[2px_2px_0px_0px_#1c1f12] uppercase tracking-widest text-xs transition-all active:translate-y-0.5 active:shadow-none cursor-pointer text-left flex justify-between items-center"
                      >
                        <span>{word}</span>
                        <span className="text-[9px] opacity-60">SELECT ↵</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-pulse border-2 border-[#1c1f12] py-4 px-6 bg-[#525636]/30 max-w-xs mx-auto">
                  <h3 className="text-xs text-[#c4b63a] font-bold uppercase tracking-wider">
                    {currentDrawerName || "The artist"} is selecting a secret word...
                  </h3>
                </div>
              )}
            </div>
          )}

          {gamePhase === "drawing" && (
            <div className="text-center w-full flex flex-col items-center">
              <div className="w-full max-w-xl flex justify-between items-end mb-3 px-1">
                <span className="text-[9px] font-black tracking-wider text-[#c4b63a]">
                  {amIDrawer ? "● YOU ARE INTERPRETING" : `○ VIEWING ${currentDrawerName.toUpperCase()}'S COMPOSITION`}
                </span>

                <h1 className="tracking-[0.25em] font-black text-sm text-[#f4edd1] bg-[#1c1f12]/60 px-3 py-1 border border-[#1c1f12] select-text">
                  {displayWord ? displayWord.toUpperCase() : ""}
                </h1>
              </div>

              <div className="w-full flex justify-center border-2 border-[#1c1f12] p-2.5 bg-[#2d301d]/90 shadow-inner relative">
                {/* Secondary viewport frame ticks inside canvas container */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#f4edd1]/20" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#f4edd1]/20" />
                <Canvas roomId={roomId} amIDrawer={amIDrawer} />
              </div>
            </div>
          )}

          {gamePhase === "intermission" && (
            <div className="text-center max-w-sm p-5 border-2 border-[#1c1f12] bg-[#525636]/40 shadow-[4px_4px_0px_0px_#1c1f12]">
              <h3 className="text-sm font-black text-[#c4b63a] leading-relaxed uppercase tracking-wide">{intermissionStatus}</h3>
              <div className="w-full bg-[#1c1f12]/40 h-1 mt-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-[#c4b63a] w-1/2 animate-loading-bar" />
              </div>
              <p className="text-[9px] text-[#f4edd1]/40 mt-2.5 uppercase tracking-widest">Calculating score delta increments...</p>
            </div>
          )}

        </div>

        {/* COLUMN 3: CHAT BLOCK */}
        <Chat roomId={roomId} amIDrawer={amIDrawer} />

      </div>

      {/* FLOATING END GAME MODAL OVERLAY */}
      {gamePhase === "over" && (
        <div className="fixed inset-0 z-50 bg-[#1c1f12]/90 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#525636] border-2 border-[#1c1f12] shadow-[6px_6px_0px_0px_#1c1f12] p-6 max-w-md w-full relative">
            <div className="absolute -top-3 left-4 bg-[#2d301d] border border-[#1c1f12] text-[#c4b63a] text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              [TERMINAL_OVER_]
            </div>
            <GameEnd players={players} onReturnHome={() => navigate("/")} />
          </div>
        </div>
      )}

    </div>
  );
}

export default Game;